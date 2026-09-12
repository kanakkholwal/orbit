import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { toast } from 'svelte-sonner';

const RANGE_SYNTAX = /^\s*\d+\s*(-\s*\d+\s*)?(,\s*\d+\s*(-\s*\d+\s*)?)*,?\s*$/;

export interface DeleteStateData {
    file: File | null;
    pageCount: number;
    pagesToDelete: Set<number>; // 0-based indices
    inputText: string;
}

export class DeletePagesState extends PdfEngine {
    state = $state<DeleteStateData>({
        file: null,
        pageCount: 0,
        pagesToDelete: new Set(),
        inputText: ''
    });

    result = $state.raw<{ blob: Blob; name: string; deleted: number; remaining: number } | null>(null);

    private pdfLibDoc: PDFDocument | null = null;
    private pdfJsDoc: PDFDocumentProxy | null = null;

    get selectedCount() {
        return this.state.pagesToDelete.size;
    }

    /** Explains why the typed page numbers can't be used, or returns null when they're fine. */
    get inputIssue(): string | null {
        const text = this.state.inputText.trim();
        if (!text) return null;
        if (!RANGE_SYNTAX.test(text)) return 'Use page numbers and ranges, like 1, 3-5, 8';
        const max = this.state.pageCount;
        const outOfRange = text.match(/\d+/g)?.some(n => Number(n) < 1 || Number(n) > max);
        if (outOfRange) return `This file has ${max} ${max === 1 ? 'page' : 'pages'}`;
        return null;
    }

    get canDelete() {
        return (
            !this.isProcessing &&
            !this.inputIssue &&
            this.selectedCount > 0 &&
            this.selectedCount < this.state.pageCount
        );
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    async loadFile(file: File) {
        if (!file) return;
        this.isProcessing = true;
        this.result = null;

        try {
            const arrayBuffer = await file.arrayBuffer();

            const pdfjs = await this.getPdfJs();
            const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer.slice(0)));
            this.pdfJsDoc = await loadingTask.promise;

            this.pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            this.state.file = file;
            this.state.pageCount = this.pdfJsDoc.numPages;
            this.state.pagesToDelete = new Set();
            this.state.inputText = '';
        } catch (e) {
            console.error(e);
            toast.error('This PDF could not be opened.');
        } finally {
            this.isProcessing = false;
        }
    }

    reset() {
        this.state.file = null;
        this.state.pageCount = 0;
        this.state.pagesToDelete = new Set();
        this.state.inputText = '';
        this.pdfLibDoc = null;
        this.pdfJsDoc = null;
        this.result = null;
    }

    togglePage(index: number) {
        const next = new Set(this.state.pagesToDelete);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        this.state.pagesToDelete = next;
        this.updateInputFromSet();
    }

    selectAll() {
        this.state.pagesToDelete = new Set(Array.from({ length: this.state.pageCount }, (_, i) => i));
        this.updateInputFromSet();
    }

    clearSelection() {
        this.state.pagesToDelete = new Set();
        this.updateInputFromSet();
    }

    handleInputUpdate(text: string) {
        this.state.inputText = text;
        this.state.pagesToDelete = new Set(this.parsePageRanges(text, this.state.pageCount));
        this.result = null;
    }

    private updateInputFromSet() {
        const sorted = Array.from(this.state.pagesToDelete).sort((a, b) => a - b);
        const parts: string[] = [];
        for (let i = 0; i < sorted.length; i++) {
            const start = sorted[i];
            while (sorted[i + 1] === sorted[i] + 1) i++;
            parts.push(start === sorted[i] ? `${start + 1}` : `${start + 1}-${sorted[i] + 1}`);
        }
        this.state.inputText = parts.join(', ');
        this.result = null;
    }

    async renderThumbnail(canvas: HTMLCanvasElement, pageIndex: number) {
        if (!this.pdfJsDoc) return;
        await this.renderPageToCanvas(canvas, this.pdfJsDoc, pageIndex);
    }

    async process() {
        if (!this.state.file || !this.pdfLibDoc) return;

        if (this.state.pagesToDelete.size === 0) {
            toast.error('Select at least one page to delete.');
            return;
        }

        if (this.state.pagesToDelete.size >= this.state.pageCount) {
            toast.error('Keep at least one page in the PDF.');
            return;
        }

        this.isProcessing = true;
        this.progress = { text: 'Deleting pages…', current: 0, total: 0 };

        try {
            const newPdf = await PDFDocument.create();
            const indicesToKeep = [];

            for (let i = 0; i < this.state.pageCount; i++) {
                if (!this.state.pagesToDelete.has(i)) indicesToKeep.push(i);
            }

            const copiedPages = await newPdf.copyPages(this.pdfLibDoc, indicesToKeep);
            for (const page of copiedPages) newPdf.addPage(page);

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

            const name = `${this.state.file.name.replace(/\.pdf$/i, '')}_deleted.pdf`;
            this.result = {
                blob,
                name,
                deleted: this.state.pagesToDelete.size,
                remaining: indicesToKeep.length
            };
            this.downloadBlob(blob, name);
        } catch (e: any) {
            console.error(e);
            toast.error(`Could not delete pages: ${e.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    private parsePageRanges(input: string, maxPages: number): number[] {
        const pages = new Set<number>();

        for (const part of input.split(',')) {
            const trimmed = part.trim();
            if (!trimmed) continue;

            if (trimmed.includes('-')) {
                const [startStr, endStr] = trimmed.split('-');
                const start = parseInt(startStr);
                const end = parseInt(endStr);

                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) {
                        if (i >= 1 && i <= maxPages) pages.add(i - 1);
                    }
                }
            } else {
                const num = parseInt(trimmed);
                if (!isNaN(num) && num >= 1 && num <= maxPages) pages.add(num - 1);
            }
        }
        return Array.from(pages);
    }
}
