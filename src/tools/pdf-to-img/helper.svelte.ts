import { LockedPdf } from '$lib/pdf/locked-pdf.svelte';
import { isPdfPasswordException } from '$lib/pdf/unlock';
import { PdfEngine } from '$lib/pdf-engine.svelte';
import JSZip from 'jszip';
import { toast } from 'svelte-sonner';

export type ImageFormat = 'jpeg' | 'png' | 'webp';

/** Safari's canvas silently returns PNG data when asked for WebP. */
export function canEncodeWebp(): boolean {
    if (typeof document === 'undefined') return false;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export interface PdfToImageStateData {
    file: File | null;
    pageCount: number;
    quality: number;
    format: ImageFormat; // New field
    isProcessing: boolean;
    progress: string;
}

export class PdfToJpgState extends PdfEngine {
    // Reactive State
    state = $state<PdfToImageStateData>({
        file: null,
        pageCount: 0,
        quality: 0.9,
        format: 'jpeg', // Default to JPG
        isProcessing: false,
        progress: ''
    });

    result = $state.raw<{ blob: Blob; name: string; count: number } | null>(null);

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }
    step = $state({ current: 0, total: 0 });
    readonly locked = new LockedPdf();

// Actions

    async loadFile(file: File) {
        if (!file) return;
        this.state.isProcessing = true;
        this.state.progress = 'Loading PDF...';

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfjs = await this.getPdfJs();
            
            const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer));
            const pdf = await loadingTask.promise;
            
            this.locked.clear();
            this.state.file = file;
            this.result = null;
            this.state.pageCount = pdf.numPages;
        } catch (e) {
            if (isPdfPasswordException(e)) {
                this.locked.hold(file);
            } else {
                console.error(e);
                this.locked.clear();
                toast.error("Failed to load PDF. It might be corrupted.");
            }
        } finally {
            this.state.isProcessing = false;
        }
    }

    async unlock(password: string) {
        const unlocked = await this.locked.unlock(password);
        if (unlocked) await this.loadFile(unlocked);
    }

    reset() {
        this.locked.clear();
        this.state.file = null;
        this.state.pageCount = 0;
        this.state.isProcessing = false;
        this.result = null;
    }

// Processing Logic

    async convert() {
        if (!this.state.file) return;
        this.state.isProcessing = true;
        this.result = null;
        this.step = { current: 0, total: 0 };
        this.state.progress = 'Initializing...';

        try {
            const arrayBuffer = await this.state.file.arrayBuffer();
            const pdfjs = await this.getPdfJs();
            const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer));
            const pdf = await loadingTask.promise;
            
            const zip = new JSZip();
            const totalPages = pdf.numPages;
            
            const mimeType = `image/${this.state.format}`;
            let ext = EXTENSIONS[mimeType];

            for (let i = 1; i <= totalPages; i++) {
                this.state.progress = `Converting page ${i} of ${totalPages}...`;
                this.step = { current: i, total: totalPages };
                
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    await page.render({ 
                        canvasContext: context, 
                        viewport: viewport,
                        canvas 
                    }).promise;

                    const blob = await new Promise<Blob | null>((resolve) => 
                        canvas.toBlob(resolve, mimeType, this.state.quality)
                    );

                    if (blob) {
                        ext = EXTENSIONS[blob.type] ?? ext;
                        zip.file(`page_${i}.${ext}`, blob);
                    }
                }
            }

            this.state.progress = 'Zipping files...';
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            const originalName = this.state.file.name.replace('.pdf', '');
            const name = `${originalName}_to_${ext}.zip`;
            this.result = { blob: zipBlob, name, count: totalPages };
            this.downloadBlob(zipBlob, name);

        } catch (e: any) {
            console.error(e);
            toast.error(`Conversion failed: ${e.message}`);
        } finally {
            this.state.isProcessing = false;
        }
    }

}