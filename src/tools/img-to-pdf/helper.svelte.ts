import { PdfEngine } from '$lib/pdf-engine.svelte';
import { toast } from 'svelte-sonner';

export interface ImageFile {
    id: string;
    file: File;
    previewUrl?: string;
}

export type PageSize = 'fit' | 'a4' | 'letter' | 'legal';
export type Orientation = 'auto' | 'portrait' | 'landscape';
export type MarginSize = 'none' | 'small' | 'large';

const PAGE_POINTS: Record<Exclude<PageSize, 'fit'>, [number, number]> = {
    a4: [595.28, 841.89],
    letter: [612, 792],
    legal: [612, 1008],
};

const MARGIN_POINTS: Record<MarginSize, number> = { none: 0, small: 18, large: 36 };

// Match original supported list
export const ACCEPTED_FORMATS = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/gif',
    'image/tiff', 'image/webp', 'image/heic', 'image/heif',
    'image/x-icon', 'image/vnd.adobe.photoshop', // PSD
    '.jp2', '.jpx', '.jxr', '.tif', '.tiff', '.psd'
];

export class JpgToPdfState extends PdfEngine {
    files = $state<ImageFile[]>([]);
    settings = $state<{ pageSize: PageSize; orientation: Orientation; margin: MarginSize }>({
        pageSize: 'fit',
        orientation: 'auto',
        margin: 'none',
    });
    result = $state.raw<{ blob: Blob; name: string; pages: number } | null>(null);
    isProcessing = $state(false);
    progress = $state({ current: 0, total: 0, text: '' });

// Actions

    addFiles(newFiles: File[]) {
        const entries = newFiles.map(f => ({
            id: crypto.randomUUID(),
            file: f,
            // Only create preview for browser-supported types
            previewUrl: this.isBrowserViewable(f) ? URL.createObjectURL(f) : undefined
        }));

        this.files.push(...entries);
        if (entries.length > 0) this.result = null;
    }

    reorder(files: ImageFile[]) {
        this.files = files;
        this.result = null;
    }

    moveFile(index: number, delta: -1 | 1) {
        const target = index + delta;
        if (target < 0 || target >= this.files.length) return;
        const next = [...this.files];
        [next[index], next[target]] = [next[target], next[index]];
        this.reorder(next);
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    removeFile(id: string) {
        this.result = null;
        const index = this.files.findIndex(f => f.id === id);
        if (index !== -1) {
            if (this.files[index].previewUrl) URL.revokeObjectURL(this.files[index].previewUrl!);
            this.files.splice(index, 1);
        }
    }

    reset() {
        this.files.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
        this.files = [];
        this.result = null;
        this.isProcessing = false;
    }

    // Processing 

    async convert() {
        if (this.files.length === 0) return;
        this.isProcessing = true;
        this.progress = { current: 0, total: this.files.length, text: 'Initializing Engine...' };

        try {
            let pymupdf: any = null;

            const { loadPyMuPDF } = await import('$utils/pymupdf-loader');
            pymupdf = await loadPyMuPDF();

            const processedFiles: File[] = [];

            // 2. Pre-process Loop
            for (let i = 0; i < this.files.length; i++) {
                const imgEntry = this.files[i];
                this.progress = {
                    current: i + 1,
                    total: this.files.length,
                    text: `Processing ${imgEntry.file.name}...`
                };

                // Convert HEIC if necessary
                let readyFile = await this.handleHeic(imgEntry.file);

                // Note: If you want to resize/compress JPGs before PDF creation 
                // (like 'compressImageFile' in your legacy code), add that logic here.

                processedFiles.push(readyFile);
            }

            // 3. Convert using built-in PyMuPDF helper
            this.progress.text = 'Generating PDF...';

            // FIX: Use the method from your legacy code directly
            // This avoids the "mupdf.Document is not a constructor" error
            const rawBlob = await pymupdf.imagesToPdf(processedFiles);
            const { blob: pdfBlob, pages } = await this.layoutPages(rawBlob);

            const name = 'converted_images.pdf';
            this.result = { blob: pdfBlob, name, pages };
            this.downloadBlob(pdfBlob, name);

        } catch (e: any) {
            console.error(e);
            toast.error(`Conversion failed: ${e.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

// Helpers

    private async layoutPages(blob: Blob): Promise<{ blob: Blob; pages: number }> {
        const { PDFDocument } = await import('pdf-lib');
        const src = await PDFDocument.load(await blob.arrayBuffer());
        const { pageSize, orientation, margin } = this.settings;
        const m = MARGIN_POINTS[margin];
        if (pageSize === 'fit' && m === 0) return { blob, pages: src.getPageCount() };

        const out = await PDFDocument.create();
        const embedded = await out.embedPages(src.getPages());
        for (const page of embedded) {
            let w: number;
            let h: number;
            if (pageSize === 'fit') {
                [w, h] = [page.width + m * 2, page.height + m * 2];
            } else {
                [w, h] = PAGE_POINTS[pageSize];
                const landscape = orientation === 'landscape' || (orientation === 'auto' && page.width > page.height);
                if (landscape) [w, h] = [h, w];
            }
            const scale = pageSize === 'fit' ? 1 : Math.min((w - m * 2) / page.width, (h - m * 2) / page.height);
            const dw = page.width * scale;
            const dh = page.height * scale;
            out.addPage([w, h]).drawPage(page, { x: (w - dw) / 2, y: (h - dh) / 2, width: dw, height: dh });
        }
        const bytes = await out.save();
        return { blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }), pages: out.getPageCount() };
    }

    private async handleHeic(file: File): Promise<File> {
        if (file.name.match(/\.(heic|heif)$/i) || file.type === 'image/heic') {
            try {
                // Dynamic import to avoid SSR window error
                const heic2any = (await import('heic2any')).default;

                const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
                const blob = Array.isArray(result) ? result[0] : result;

                return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
            } catch (e) {
                console.error("HEIC conversion failed", e);
            }
        }
        return file;
    }

    private isBrowserViewable(file: File) {
        return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'].includes(file.type);
    }


}