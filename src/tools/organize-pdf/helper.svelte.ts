import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { toast } from 'svelte-sonner';

export interface PageItem {
    id: string; // Unique ID for UI keys
    originalIndex: number; // 0-based index in the source PDF
    pageNumber: number; // 1-based display number (derived)
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

    private pdfLibDoc: PDFDocument | null = null;
    private pdfJsDoc: PDFDocumentProxy | null = null;

Actions

    async loadFile(file: File) {
        if (!file) return;

        await this.handleProcess(async () => {
            const arrayBuffer = await file.arrayBuffer();

            // Load both engines
            // PDF.js for rendering thumbnails
            const pdfjs = await this.getPdfJs();
            const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer.slice(0)));
            this.pdfJsDoc = await loadingTask.promise;

            // PDF-Lib for saving the final file
            this.pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            this.state.file = file;

            // Initialize pages array
            this.state.pages = Array.from({ length: this.pdfJsDoc.numPages }, (_, i) => ({
                id: crypto.randomUUID(),
                originalIndex: i,
                pageNumber: i + 1
            }));
        }, {
            loading: 'Loading PDF...',
            success: 'PDF loaded successfully!',
            error: 'Failed to load PDF.'
        });
    }

    reset() {
        this.state.file = null;
        this.state.pages = [];
        this.pdfLibDoc = null;
        this.pdfJsDoc = null;
    }

Page Manipulation

    movePage(fromIndex: number, toIndex: number) {
        const item = this.state.pages[fromIndex];
        const newPages = [...this.state.pages];
        newPages.splice(fromIndex, 1);
        newPages.splice(toIndex, 0, item);
        this.state.pages = newPages;
    }

    deletePage(id: string) {
        if (this.state.pages.length <= 1) {
            toast.error("You cannot delete the last page.");
            return;
        }
        this.state.pages = this.state.pages.filter(p => p.id !== id);
    }

    duplicatePage(id: string) {
        const index = this.state.pages.findIndex(p => p.id === id);
        if (index === -1) return;

        const original = this.state.pages[index];
        const clone = {
            ...original,
            id: crypto.randomUUID()
        };

        const newPages = [...this.state.pages];
        newPages.splice(index + 1, 0, clone);
        this.state.pages = newPages;
    }

    applyCustomOrder(orderString: string) {
        // Parse "1, 3, 2" etc.
        const indices = orderString.split(',')
            .map(s => parseInt(s.trim()) - 1) // Convert to 0-based
            .filter(n => !isNaN(n) && n >= 0 && n < (this.pdfJsDoc?.numPages || 0));

        if (indices.length === 0) {
            toast.error("Invalid page numbers provided.");
            return;
        }

        // Reconstruct pages array based on these indices
        // Note: This logic allows picking specific pages, potentially dropping others
        this.state.pages = indices.map(idx => ({
            id: crypto.randomUUID(),
            originalIndex: idx,
            pageNumber: idx + 1
        }));
    }

Rendering

    async renderThumbnail(canvas: HTMLCanvasElement, originalIndex: number) {
        if (!this.pdfJsDoc) return;
        await this.renderPageToCanvas(canvas, this.pdfJsDoc, originalIndex);
    }

Saving

    async save() {
        if (!this.state.file || !this.pdfLibDoc) return;

        await this.handleProcess(async () => {
            const newPdf = await PDFDocument.create();

            // Get indices needed
            const indicesToCopy = this.state.pages.map(p => p.originalIndex);

            // Copy pages from source
            const copiedPages = await newPdf.copyPages(this.pdfLibDoc!, indicesToCopy);

            // Add them to new doc
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

            const originalName = this.state.file!.name.replace('.pdf', '');
            this.downloadBlob(blob, `${originalName}_organized.pdf`);
        }, {
            loading: 'Building PDF...',
            success: 'PDF organized successfully!',
            error: (e) => `Save failed: ${e.message}`
        });
    }


}