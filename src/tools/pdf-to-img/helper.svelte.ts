import { PdfEngine } from '$lib/pdf-engine.svelte';
import JSZip from 'jszip';
import { toast } from 'svelte-sonner';

export type ImageFormat = 'jpeg' | 'png' | 'webp';

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
            
            this.state.file = file;
            this.state.pageCount = pdf.numPages;
        } catch (e) {
            console.error(e);
            toast.error("Failed to load PDF. It might be corrupted.");
        } finally {
            this.state.isProcessing = false;
        }
    }

    reset() {
        this.state.file = null;
        this.state.pageCount = 0;
        this.state.isProcessing = false;
    }

// Processing Logic

    async convert() {
        if (!this.state.file) return;
        this.state.isProcessing = true;
        this.state.progress = 'Initializing...';

        try {
            const arrayBuffer = await this.state.file.arrayBuffer();
            const pdfjs = await this.getPdfJs();
            const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer));
            const pdf = await loadingTask.promise;
            
            const zip = new JSZip();
            const totalPages = pdf.numPages;
            
            // Determine file extension based on format
            const ext = this.state.format === 'jpeg' ? 'jpg' : this.state.format;
            const mimeType = `image/${this.state.format}`;

            for (let i = 1; i <= totalPages; i++) {
                this.state.progress = `Converting page ${i} of ${totalPages}...`;
                
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
                        zip.file(`page_${i}.${ext}`, blob);
                    }
                }
            }

            this.state.progress = 'Zipping files...';
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            const originalName = this.state.file.name.replace('.pdf', '');
            this.downloadBlob(zipBlob, `${originalName}_to_${ext}.zip`);

        } catch (e: any) {
            console.error(e);
            toast.error(`Conversion failed: ${e.message}`);
        } finally {
            this.state.isProcessing = false;
        }
    }

}