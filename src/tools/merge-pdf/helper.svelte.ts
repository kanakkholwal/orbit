import { PdfEngine } from '$lib/pdf-engine.svelte';
import { nanoid } from 'nanoid';
import { PDFDocument } from 'pdf-lib';
import type * as PDFJS from 'pdfjs-dist';

export const MERGE_STATE_KEY = Symbol('MERGE_STATE');

const RANGE_SYNTAX = /^\s*\d+\s*(-\s*\d+\s*)?(,\s*\d+\s*(-\s*\d+\s*)?)*,?\s*$/;

export interface UploadedFile {
    id: string;
    file: File;
    name: string;
    size: number;
    pageCount: number;
    // For File Mode: User can type "1-5, 8"
    pageRange: string;
    // Cache the PDF document for merging later
    pdfDoc?: PDFDocument;
}

export interface PageItem {
    id: string; // Unique ID for Sortable
    fileId: string;
    fileName: string;
    pageIndex: number; // 0-based index in original file
    visualRotation: number;
}

export class MergeState extends PdfEngine {
    files = $state<UploadedFile[]>([]);
    allPages = $state<PageItem[]>([]);
    mode = $state<'file' | 'page'>('file');
    outputName = $state('merged.pdf');
    result = $state.raw<{ blob: Blob; pages: number; name: string } | null>(null);

    private pdfJsDocs: Map<string, PDFJS.PDFDocumentProxy> = new Map();

    async addFiles(newFiles: File[]) {
        if (!newFiles.length) return;
        this.result = null;

        await this.handleProcess(async () => {
            const pdfjs = await this.getPdfJs();

            for (let i = 0; i < newFiles.length; i++) {
                const file = newFiles[i];
                const arrayBuffer = await file.arrayBuffer();

                const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer.slice(0)));
                const docProxy = await loadingTask.promise;

                const fileId = nanoid();
                this.pdfJsDocs.set(fileId, docProxy);

                const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

                this.files.push({
                    id: fileId,
                    file,
                    name: file.name,
                    size: file.size,
                    pageCount: docProxy.numPages,
                    pageRange: '',
                    pdfDoc
                });

                for (let p = 0; p < docProxy.numPages; p++) {
                    this.allPages.push({
                        id: nanoid(),
                        fileId: fileId,
                        fileName: file.name,
                        pageIndex: p,
                        visualRotation: 0
                    });
                }
            }
        }, {
            loading: 'Reading PDFs…',
            success: newFiles.length === 1 ? 'File added' : `${newFiles.length} files added`,
            error: 'One or more files could not be opened.'
        });
    }

    removeFile(fileId: string) {
        this.files = this.files.filter(f => f.id !== fileId);
        this.allPages = this.allPages.filter(p => p.fileId !== fileId);
        this.pdfJsDocs.delete(fileId);
        this.result = null;
    }

    removePage(pageId: string) {
        this.allPages = this.allPages.filter(p => p.id !== pageId);
        this.result = null;
    }

    moveFile(index: number, offset: -1 | 1) {
        const target = index + offset;
        if (target < 0 || target >= this.files.length) return;
        const next = [...this.files];
        [next[index], next[target]] = [next[target], next[index]];
        this.files = next;
        this.result = null;
    }

    updateFileOrder(newIndices: number[]) {
        this.files = newIndices.map(i => this.files[i]);
    }

    /** Explains why a file's page range can't be used, or returns null when it's fine. */
    rangeIssue(file: UploadedFile): string | null {
        const range = file.pageRange.trim();
        if (!range) return null;
        if (!RANGE_SYNTAX.test(range)) return 'Use numbers and ranges, like 1-3, 5';
        const tooHigh = range.match(/\d+/g)?.some(n => Number(n) > file.pageCount || Number(n) < 1);
        if (tooHigh) return `This file has ${file.pageCount} ${file.pageCount === 1 ? 'page' : 'pages'}`;
        return null;
    }

    pagesFor(file: UploadedFile): number {
        if (!file.pageRange.trim()) return file.pageCount;
        if (this.rangeIssue(file)) return 0;
        return this.parsePageRange(file.pageRange, file.pageCount).length;
    }

    get hasRangeIssues() {
        return this.mode === 'file' && this.files.some(f => this.rangeIssue(f) !== null);
    }

    get resultPageCount() {
        return this.mode === 'file'
            ? this.files.reduce((sum, f) => sum + this.pagesFor(f), 0)
            : this.allPages.length;
    }

    get totalSize() {
        return this.files.reduce((sum, f) => sum + f.size, 0);
    }

    get canMerge() {
        return !this.isProcessing && this.files.length > 0 && !this.hasRangeIssues && this.resultPageCount > 0;
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    async renderThumbnail(canvas: HTMLCanvasElement, fileId: string, pageIndex: number) {
        const doc = this.pdfJsDocs.get(fileId);
        if (!doc) return;
        await this.renderPageToCanvas(canvas, doc, pageIndex);
    }

    private get fileName() {
        const base = this.outputName.trim().replace(/\.pdf$/i, '') || 'merged';
        return `${base}.pdf`;
    }

    async mergeAndDownload() {
        if (!this.canMerge) return;

        await this.handleProcess(async () => {
            const mergedPdf = await PDFDocument.create();

            if (this.mode === 'file') {
                for (const file of this.files) {
                    if (!file.pdfDoc) continue;
                    const pageIndices = file.pageRange.trim()
                        ? this.parsePageRange(file.pageRange, file.pageCount)
                        : file.pdfDoc.getPageIndices();
                    const copiedPages = await mergedPdf.copyPages(file.pdfDoc, pageIndices);
                    for (const page of copiedPages) mergedPdf.addPage(page);
                }
            } else {
                const fileCache = new Map<string, PDFDocument>();
                this.files.forEach(f => { if (f.pdfDoc) fileCache.set(f.id, f.pdfDoc); });

                for (const pageItem of this.allPages) {
                    const sourceDoc = fileCache.get(pageItem.fileId);
                    if (sourceDoc) {
                        const [copiedPage] = await mergedPdf.copyPages(sourceDoc, [pageItem.pageIndex]);
                        mergedPdf.addPage(copiedPage);
                    }
                }
            }

            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
            const name = this.fileName;
            this.result = { blob, pages: mergedPdf.getPageCount(), name };
            this.downloadBlob(blob, name);
        }, {
            loading: 'Merging…',
            success: 'Merged PDF saved',
            error: 'The files could not be merged.'
        });
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    reset() {
        this.files = [];
        this.allPages = [];
        this.pdfJsDocs.clear();
        this.mode = 'file';
        this.result = null;
    }
}
