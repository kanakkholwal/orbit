import { PdfEngine } from '$lib/pdf-engine.svelte';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { toast } from 'svelte-sonner';
import { type FilterSettings, rasterizeToPdf } from './raster';

export type Resolution = '150' | '200' | '300';

export class ColorFiltersState extends PdfEngine {
    file = $state.raw<File | null>(null);
    pageCount = $state(0);
    previewPage = $state(1);
    dpi = $state<Resolution>('150');
    quality = $state(0.8);
    settings = $state<FilterSettings>({
        kind: 'grayscale',
        threshold: 160,
        brightness: 0,
        contrast: 0,
        saturation: 0
    });
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
            this.previewPage = 1;
            this.result = null;
        } catch (e) {
            console.error(e);
            toast.error('This PDF could not be opened. It may be damaged or password protected.');
        }
    }

    /** Renders a page at preview size onto a fresh canvas. */
    async renderPreview(pageIndex: number, width: number): Promise<HTMLCanvasElement | null> {
        if (!this.pdf) return null;
        const canvas = document.createElement('canvas');
        await this.renderPageToCanvas(canvas, this.pdf, pageIndex, width);
        return canvas;
    }

    async process() {
        if (!this.pdf || !this.file || this.isProcessing) return;
        this.isProcessing = true;
        this.result = null;
        this.progress = { current: 0, total: this.pageCount, text: 'Filtering pages' };
        try {
            const bytes = await rasterizeToPdf(this.pdf, {
                dpi: Number(this.dpi),
                format: 'jpeg',
                quality: this.quality,
                filter: $state.snapshot(this.settings),
                onPage: (current, total) => {
                    this.progress = { current, total, text: 'Filtering pages' };
                }
            });
            const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
            const name = `${this.file.name.replace(/\.pdf$/i, '')}_filtered.pdf`;
            this.result = { blob, name };
            this.downloadBlob(blob, name);
        } catch (e) {
            console.error(e);
            toast.error(`Could not apply the filter: ${e instanceof Error ? e.message : 'unknown error'}`);
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
        this.previewPage = 1;
        this.result = null;
        this.progress = { current: 0, total: 0, text: '' };
    }
}
