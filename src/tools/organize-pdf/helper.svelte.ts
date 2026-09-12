import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { toast } from 'svelte-sonner';

const ORDER_SYNTAX = /^\s*\d+\s*(-\s*\d+\s*)?(,\s*\d+\s*(-\s*\d+\s*)?)*,?\s*$/;

export interface PageItem {
    id: string;
    originalIndex: number;
    pageNumber: number;
}

export interface OrganizeStateData {
    file: File | null;
    pages: PageItem[];
}

export class OrganizePdfState extends PdfEngine {
    state = $state<OrganizeStateData>({
        file: null,
        pages: []
    });

    result = $state.raw<{ blob: Blob; name: string; pages: number } | null>(null);

    private pdfLibDoc: PDFDocument | null = null;
    private pdfJsDoc: PDFDocumentProxy | null = null;

    get sourcePageCount() {
        return this.pdfJsDoc?.numPages ?? 0;
    }

    get removedCount() {
        const kept = new Set(this.state.pages.map(p => p.originalIndex));
        return Math.max(0, this.sourcePageCount - kept.size);
    }

    get copyCount() {
        const kept = new Set(this.state.pages.map(p => p.originalIndex));
        return this.state.pages.length - kept.size;
    }

    get isOriginalOrder() {
        const pages = this.state.pages;
        return pages.length === this.sourcePageCount && pages.every((p, i) => p.originalIndex === i);
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    async loadFile(file: File) {
        if (!file) return;
        this.result = null;

        await this.handleProcess(async () => {
            const arrayBuffer = await file.arrayBuffer();

            const pdfjs = await this.getPdfJs();
            const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer.slice(0)));
            this.pdfJsDoc = await loadingTask.promise;

            this.pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            this.state.file = file;
            this.state.pages = this.originalPages();
        }, {
            loading: 'Opening PDF…',
            success: 'PDF ready',
            error: 'This PDF could not be opened.'
        });
    }

    reset() {
        this.state.file = null;
        this.state.pages = [];
        this.pdfLibDoc = null;
        this.pdfJsDoc = null;
        this.result = null;
    }

    private originalPages(): PageItem[] {
        return Array.from({ length: this.sourcePageCount }, (_, i) => ({
            id: crypto.randomUUID(),
            originalIndex: i,
            pageNumber: i + 1
        }));
    }

    restoreOriginalOrder() {
        this.state.pages = this.originalPages();
        this.result = null;
    }

    movePage(fromIndex: number, toIndex: number) {
        if (toIndex < 0 || toIndex >= this.state.pages.length || fromIndex === toIndex) return;
        const item = this.state.pages[fromIndex];
        const newPages = [...this.state.pages];
        newPages.splice(fromIndex, 1);
        newPages.splice(toIndex, 0, item);
        this.state.pages = newPages;
        this.result = null;
    }

    deletePage(id: string) {
        if (this.state.pages.length <= 1) {
            toast.error('A PDF needs at least one page.');
            return;
        }
        this.state.pages = this.state.pages.filter(p => p.id !== id);
        this.result = null;
    }

    duplicatePage(id: string) {
        const index = this.state.pages.findIndex(p => p.id === id);
        if (index === -1) return;

        const clone = { ...this.state.pages[index], id: crypto.randomUUID() };
        const newPages = [...this.state.pages];
        newPages.splice(index + 1, 0, clone);
        this.state.pages = newPages;
        this.result = null;
    }

    /** Explains why a typed page order can't be used, or returns null when it's fine. */
    orderIssue(orderString: string): string | null {
        const text = orderString.trim();
        if (!text) return null;
        if (!ORDER_SYNTAX.test(text)) return 'Use page numbers and ranges, like 3, 1, 2, 4-6';
        const max = this.sourcePageCount;
        const outOfRange = text.match(/\d+/g)?.some(n => Number(n) < 1 || Number(n) > max);
        if (outOfRange) return `This file has ${max} ${max === 1 ? 'page' : 'pages'}`;
        return null;
    }

    applyCustomOrder(orderString: string) {
        if (!orderString.trim() || this.orderIssue(orderString)) return;

        const indices = orderString.split(',').flatMap(part => {
            const [start, end] = part.split('-').map(s => parseInt(s.trim()));
            if (isNaN(start)) return [];
            if (isNaN(end)) return [start - 1];
            const step = end >= start ? 1 : -1;
            return Array.from({ length: Math.abs(end - start) + 1 }, (_, k) => start - 1 + k * step);
        });

        this.state.pages = indices.map(idx => ({
            id: crypto.randomUUID(),
            originalIndex: idx,
            pageNumber: idx + 1
        }));
        this.result = null;
    }

    async renderThumbnail(canvas: HTMLCanvasElement, originalIndex: number) {
        if (!this.pdfJsDoc) return;
        await this.renderPageToCanvas(canvas, this.pdfJsDoc, originalIndex);
    }

    async save() {
        if (!this.state.file || !this.pdfLibDoc) return;

        await this.handleProcess(async () => {
            const newPdf = await PDFDocument.create();
            const indicesToCopy = this.state.pages.map(p => p.originalIndex);
            const copiedPages = await newPdf.copyPages(this.pdfLibDoc!, indicesToCopy);
            for (const page of copiedPages) newPdf.addPage(page);

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

            const name = `${this.state.file!.name.replace(/\.pdf$/i, '')}_organized.pdf`;
            this.result = { blob, name, pages: newPdf.getPageCount() };
            this.downloadBlob(blob, name);
        }, {
            loading: 'Saving PDF…',
            success: 'PDF saved',
            error: (e) => `Could not save the PDF: ${e.message}`
        });
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }
}
