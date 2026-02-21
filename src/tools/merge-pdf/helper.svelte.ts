import { PdfEngine } from '$lib/pdf-engine.svelte';
import { nanoid } from 'nanoid';
import { PDFDocument } from 'pdf-lib';
import type * as PDFJS from 'pdfjs-dist';

export const MERGE_STATE_KEY = Symbol('MERGE_STATE');

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
    // State
    files = $state<UploadedFile[]>([]);
    allPages = $state<PageItem[]>([]); // Flattened list for Page Mode
    mode = $state<'file' | 'page'>('file');

    // Internal
    private pdfJsDocs: Map<string, PDFJS.PDFDocumentProxy> = new Map();


    // --- Actions ---

    async addFiles(newFiles: File[]) {
        if (!newFiles.length) return;

        await this.handleProcess(async () => {
            const pdfjs = await this.getPdfJs();

            for (let i = 0; i < newFiles.length; i++) {
                const file = newFiles[i];
                const arrayBuffer = await file.arrayBuffer();

                // 1. Load for Rendering (PDF.js)
                const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer.slice(0)));
                const docProxy = await loadingTask.promise;

                const fileId = nanoid();
                this.pdfJsDocs.set(fileId, docProxy);

                // 2. Load for Merging (pdf-lib)
                const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

                // 3. Create File Entry
                const newFile: UploadedFile = {
                    id: fileId,
                    file,
                    name: file.name,
                    size: file.size,
                    pageCount: docProxy.numPages,
                    pageRange: '', // Empty = all
                    pdfDoc
                };

                this.files.push(newFile);

                // 4. Generate Page Items (for Page Mode)
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
            loading: 'Analyzing PDFs...',
            success: 'Files loaded successfully!',
            error: 'Failed to load one or more PDF files.'
        });
    }

    removeFile(fileId: string) {
        this.files = this.files.filter(f => f.id !== fileId);
        // Also remove associated pages
        this.allPages = this.allPages.filter(p => p.fileId !== fileId);
        this.pdfJsDocs.delete(fileId);
    }

    updateFileOrder(newIndices: number[]) {
        const reordered = newIndices.map(i => this.files[i]);
        this.files = reordered;
    }

    // --- Rendering for Thumbnails ---
    async renderThumbnail(canvas: HTMLCanvasElement, fileId: string, pageIndex: number) {
        const doc = this.pdfJsDocs.get(fileId);
        if (!doc) return;

        await this.renderPageToCanvas(canvas, doc, pageIndex);
    }

    // --- Merge Logic ---

    async mergeAndDownload() {
        if (this.files.length === 0) return;

        await this.handleProcess(async () => {
            const mergedPdf = await PDFDocument.create();

            if (this.mode === 'file') {
                // --- FILE MODE MERGE ---
                for (const file of this.files) {
                    if (!file.pdfDoc) continue;

                    let pageIndices: number[] = [];

                    // Parse Range (e.g. "1-3, 5")
                    if (!file.pageRange.trim()) {
                        // All pages
                        pageIndices = file.pdfDoc.getPageIndices();
                    } else {
                        pageIndices = this.parsePageRange(file.pageRange, file.pageCount);
                    }

                    const copiedPages = await mergedPdf.copyPages(file.pdfDoc, pageIndices);
                    copiedPages.forEach(page => mergedPdf.addPage(page));
                }

            } else {
                
                // We iterate the `allPages` array which reflects the user's custom sort order
                const fileCache = new Map<string, PDFDocument>();
                // Pre-fill cache
                this.files.forEach(f => { if (f.pdfDoc) fileCache.set(f.id, f.pdfDoc); });

                for (const pageItem of this.allPages) {
                    const sourceDoc = fileCache.get(pageItem.fileId);
                    if (sourceDoc) {
                        const [copiedPage] = await mergedPdf.copyPages(sourceDoc, [pageItem.pageIndex]);
                        mergedPdf.addPage(copiedPage);
                    }
                }
            }

            // Save and Download
            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
            this.downloadBlob(blob, `merged_${new Date().getTime()}.pdf`);
        }, {
            loading: 'Merging PDFs...',
            success: 'PDFs merged successfully!',
            error: 'Error merging PDFs. Please check console.'
        });
    }



    reset() {
        this.files = [];
        this.allPages = [];
        this.pdfJsDocs.clear();
        this.mode = 'file';
    }
}