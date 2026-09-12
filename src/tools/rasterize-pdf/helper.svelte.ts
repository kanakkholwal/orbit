import { PdfEngine } from '$lib/pdf-engine.svelte';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { toast } from 'svelte-sonner';
import { type ImageKind, rasterizeToPdf } from '../pdf-color-filters/raster';

export type Resolution = '150' | '200' | '300';

export class RasterizeState extends PdfEngine {
    file = $state.raw<File | null>(null);
    pageCount = $state(0);
    dpi = $state<Resolution>('200');
    format = $state<ImageKind>('jpeg');
    quality = $state(0.85);
    grayscale = $state(false);
    result = $state.raw<{ blob: Blob; name: string } | null>(null);

    private pdf: PDFDocumentProxy | null = null;

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    async loadFile(files: File[]) {
        const file = files[0];
        if (!file) return;
        try {
            const pdfjs = await this.getPdfJs();
            const doc = await pdfjs.getDocument(new Uint8Array(await file.arrayBuffer())).promise;
            await this.pdf?.destroy();
            this.pdf = doc;
            this.file = file;
            this.pageCount = doc.numPages;
            this.result = null;
        } catch (e) {
            console.error(e);
            toast.error('This PDF could not be opened. It may be damaged or password protected.');
        }
    }

    async process() {
        if (!this.pdf || !this.file || this.isProcessing) return;
        this.isProcessing = true;
        this.result = null;
        this.progress = { current: 0, total: this.pageCount, text: 'Rasterizing pages' };
        try {
            const bytes = await rasterizeToPdf(this.pdf, {
                dpi: Number(this.dpi),
                format: this.format,
                quality: this.quality,
                filter: this.grayscale
                    ? { kind: 'grayscale', threshold: 128, brightness: 0, contrast: 0, saturation: 0 }
                    : null,
                onPage: (current, total) => {
                    this.progress = { current, total, text: 'Rasterizing pages' };
                }
            });
            const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
            const name = `${this.file.name.replace(/\.pdf$/i, '')}_rasterized.pdf`;
            this.result = { blob, name };
            this.downloadBlob(blob, name);
        } catch (e) {
            console.error(e);
            toast.error(`Could not rasterize the PDF: ${e instanceof Error ? e.message : 'unknown error'}`);
        } finally {
            this.isProcessing = false;
        }
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    reset() {
        void this.pdf?.destroy();
        this.pdf = null;
        this.file = null;
        this.pageCount = 0;
        this.result = null;
        this.progress = { current: 0, total: 0, text: '' };
    }
}
