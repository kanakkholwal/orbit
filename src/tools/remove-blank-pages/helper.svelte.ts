import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { toast } from 'svelte-sonner';

export type BlankStrictness = 'strict' | 'balanced' | 'loose';

// A page counts as blank when its average brightness (0-255) is above this.
const BRIGHTNESS_THRESHOLD: Record<BlankStrictness, number> = {
    strict: 254,
    balanced: 252,
    loose: 248
};

export interface BlankPageStateData {
    file: File | null;
    pageCount: number;
    originalSize: number;
    strictness: BlankStrictness;
    isDetecting: boolean;
    detectedPages: { index: number; isSelected: boolean }[];
    hasPerformedDetection: boolean;
}

export class RemoveBlankPagesState extends PdfEngine {
    state = $state<BlankPageStateData>({
        file: null,
        pageCount: 0,
        originalSize: 0,
        strictness: 'balanced',
        isDetecting: false,
        detectedPages: [],
        hasPerformedDetection: false
    });

    result = $state.raw<{ blob: Blob; name: string; removed: number; remaining: number } | null>(null);

    private pdfLibDoc: PDFDocument | null = null;
    private pdfJsDoc: PDFDocumentProxy | null = null;

    get selectedCount() {
        return this.state.detectedPages.filter(p => p.isSelected).length;
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    async loadFile(files: File[]) {
        if (!files || files.length === 0) return;
        const file = files[0];

        this.isProcessing = true;
        this.result = null;
        this.progress = { text: 'Opening PDF…', current: 0, total: 0 };
        try {
            const arrayBuffer = await file.arrayBuffer();

            const pdfjs = await this.getPdfJs();
            const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer.slice(0)));
            this.pdfJsDoc = await loadingTask.promise;

            this.pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            this.state.file = file;
            this.state.originalSize = file.size;
            this.state.pageCount = this.pdfJsDoc.numPages;
            this.state.detectedPages = [];
            this.state.hasPerformedDetection = false;
        } catch (e) {
            console.error('Error loading PDF', e);
            toast.error('This PDF could not be opened.');
        } finally {
            this.isProcessing = false;
        }
    }

    reset() {
        this.state.file = null;
        this.pdfLibDoc = null;
        this.pdfJsDoc = null;
        this.state.pageCount = 0;
        this.state.originalSize = 0;
        this.state.detectedPages = [];
        this.state.hasPerformedDetection = false;
        this.result = null;
    }

    togglePageSelection(index: number) {
        const page = this.state.detectedPages.find(p => p.index === index);
        if (page) page.isSelected = !page.isSelected;
        this.result = null;
    }

    selectAll() {
        for (const p of this.state.detectedPages) p.isSelected = true;
        this.result = null;
    }

    clearSelection() {
        for (const p of this.state.detectedPages) p.isSelected = false;
        this.result = null;
    }

    async detectBlankPages() {
        if (!this.pdfJsDoc) return;

        this.state.isDetecting = true;
        this.result = null;
        this.progress = { text: 'Checking pages', current: 0, total: this.pdfJsDoc.numPages };
        this.state.detectedPages = [];

        const threshold = BRIGHTNESS_THRESHOLD[this.state.strictness];

        try {
            const totalPages = this.pdfJsDoc.numPages;
            const detected = [];

            for (let i = 1; i <= totalPages; i++) {
                this.progress = { text: 'Checking pages', current: i, total: totalPages };
                const page = await this.pdfJsDoc.getPage(i);
                if (await this.isPageBlank(page, threshold)) {
                    detected.push({ index: i - 1, isSelected: true });
                }
            }

            this.state.detectedPages = detected;
            this.state.hasPerformedDetection = true;
        } catch (e) {
            console.error(e);
            toast.error('Something went wrong while checking the pages.');
        } finally {
            this.state.isDetecting = false;
        }
    }

    private async isPageBlank(page: any, threshold: number): Promise<boolean> {
        const viewport = page.getViewport({ scale: 0.5 });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
            totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }

        return totalBrightness / (data.length / 4) > threshold;
    }

    async renderThumbnail(canvas: HTMLCanvasElement, pageIndex: number) {
        if (!this.pdfJsDoc) return;
        await this.renderPageToCanvas(canvas, this.pdfJsDoc, pageIndex);
    }

    async process() {
        if (!this.pdfLibDoc || !this.state.file) return;

        const pagesToRemove = new Set(
            this.state.detectedPages.filter(p => p.isSelected).map(p => p.index)
        );

        if (pagesToRemove.size === 0) {
            toast.error('Select at least one page to remove.');
            return;
        }

        this.isProcessing = true;
        this.progress = { text: 'Removing pages', current: 0, total: 0 };

        try {
            const newPdfDoc = await PDFDocument.create();
            const totalPages = this.pdfLibDoc.getPageCount();

            for (let i = 0; i < totalPages; i++) {
                if (!pagesToRemove.has(i)) {
                    const [copiedPage] = await newPdfDoc.copyPages(this.pdfLibDoc, [i]);
                    newPdfDoc.addPage(copiedPage);
                }
            }

            const newPdfBytes = await newPdfDoc.save();
            const blob = new Blob([newPdfBytes as BlobPart], { type: 'application/pdf' });

            const name = `${this.state.file.name.replace(/\.pdf$/i, '')}_no_blank.pdf`;
            this.result = { blob, name, removed: pagesToRemove.size, remaining: newPdfDoc.getPageCount() };
            this.downloadBlob(blob, name);
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || 'Could not remove pages.');
        } finally {
            this.isProcessing = false;
        }
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }
}
