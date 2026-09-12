import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument } from 'pdf-lib';
import type * as PDFJS from 'pdfjs-dist';
import { toast } from 'svelte-sonner';
import { dividePdf } from './divide';

export type DivideMode = 'vertical' | 'horizontal' | 'grid';
export type ReadingOrder = 'ltr' | 'rtl';
export type PageScope = 'all' | 'range';

const RANGE_SYNTAX = /^\s*\d+\s*(-\s*\d+\s*)?(,\s*\d+\s*(-\s*\d+\s*)?)*,?\s*$/;

export class DividePagesState extends PdfEngine {
    file = $state.raw<File | null>(null);
    pageCount = $state(0);
    mode = $state<DivideMode>('vertical');
    gridColumns = $state(2);
    gridRows = $state(2);
    readingOrder = $state<ReadingOrder>('ltr');
    scope = $state<PageScope>('all');
    range = $state('');
    skipFirst = $state(false);
    skipLast = $state(false);
    result = $state.raw<{ blob: Blob; name: string; pages: number } | null>(null);
    preview = $state.raw<PDFJS.PDFDocumentProxy | null>(null);

    private src: PDFDocument | null = null;

    get columns() {
        if (this.mode === 'vertical') return 2;
        if (this.mode === 'horizontal') return 1;
        return clampGrid(this.gridColumns);
    }

    get rows() {
        if (this.mode === 'vertical') return 1;
        if (this.mode === 'horizontal') return 2;
        return clampGrid(this.gridRows);
    }

    get parts() {
        return this.columns * this.rows;
    }

    get rangeIssue(): string | null {
        if (this.scope !== 'range') return null;
        const range = this.range.trim();
        if (!range) return 'Type the pages to divide, like 2-9';
        if (!RANGE_SYNTAX.test(range)) return 'Use numbers and ranges, like 2-9, 12';
        if (range.match(/\d+/g)?.some((n) => Number(n) < 1 || Number(n) > this.pageCount)) {
            return `This file has ${this.pageCount} ${this.pageCount === 1 ? 'page' : 'pages'}`;
        }
        return null;
    }

    /** 0-based pages that will be divided. */
    get targets(): number[] {
        if (this.rangeIssue) return [];
        const base =
            this.scope === 'all'
                ? Array.from({ length: this.pageCount }, (_, i) => i)
                : this.parsePageRange(this.range, this.pageCount);
        return base.filter((i) => !(this.skipFirst && i === 0) && !(this.skipLast && i === this.pageCount - 1));
    }

    get resultPageCount() {
        return this.pageCount + this.targets.length * (this.parts - 1);
    }

    get canRun() {
        return !this.isProcessing && !!this.file && this.targets.length > 0 && this.parts > 1;
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    async loadFile(files: File[]) {
        const file = files[0];
        if (!file) return;
        this.isProcessing = true;
        try {
            const bytes = await file.arrayBuffer();
            this.src = await PDFDocument.load(bytes);
            const pdfjs = await this.getPdfJs();
            this.preview = await pdfjs.getDocument(new Uint8Array(bytes.slice(0))).promise;
            this.file = file;
            this.pageCount = this.src.getPageCount();
            this.result = null;
        } catch (e) {
            console.error(e);
            toast.error('This PDF could not be opened. It may be damaged or password protected.');
        } finally {
            this.isProcessing = false;
        }
    }

    async renderPreview(canvas: HTMLCanvasElement, pageIndex: number) {
        if (!this.preview) return;
        await this.renderPageToCanvas(canvas, this.preview, pageIndex, 360);
    }

    async process() {
        if (!this.canRun || !this.src || !this.file) return;
        this.isProcessing = true;
        this.progress = { current: 0, total: 0, text: 'Dividing pages' };
        try {
            const out = await dividePdf(this.src, {
                columns: this.columns,
                rows: this.rows,
                rightToLeft: this.readingOrder === 'rtl',
                targets: this.targets
            });
            const bytes = await out.save();
            const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
            const name = `${this.file.name.replace(/\.pdf$/i, '')}_divided.pdf`;
            this.result = { blob, name, pages: out.getPageCount() };
            this.downloadBlob(blob, name);
        } catch (e) {
            console.error(e);
            toast.error('The pages could not be divided.');
        } finally {
            this.isProcessing = false;
        }
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    reset() {
        void this.preview?.destroy();
        this.preview = null;
        this.src = null;
        this.file = null;
        this.pageCount = 0;
        this.result = null;
        this.range = '';
        this.scope = 'all';
    }
}

function clampGrid(n: number) {
    return Math.min(8, Math.max(1, Math.floor(Number(n)) || 1));
}
