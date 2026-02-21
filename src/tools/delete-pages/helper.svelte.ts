import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface DeleteStateData {
    file: File | null;
    pageCount: number;
    pagesToDelete: Set<number>; // 0-based indices
    inputText: string;
    isProcessing: boolean;
    progress: string;
}

export class DeletePagesState extends PdfEngine {
    state = $state<DeleteStateData>({
        file: null,
        pageCount: 0,
        pagesToDelete: new Set(),
        inputText: '',
        isProcessing: false,
        progress: ''
    });

    private pdfLibDoc: PDFDocument | null = null;
    private pdfJsDoc: PDFDocumentProxy | null = null;

    // --- Actions ---

    async loadFile(file: File) {
        if (!file) return;
        this.state.isProcessing = true;
        this.state.progress = 'Loading PDF...';

        try {
            const arrayBuffer = await file.arrayBuffer();
            
            // For thumbnails
            const pdfjs = await this.getPdfJs();
            const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer.slice(0)));
            this.pdfJsDoc = await loadingTask.promise;
            
            // For saving
            this.pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            
            this.state.file = file;
            this.state.pageCount = this.pdfJsDoc.numPages;
            this.state.pagesToDelete = new Set();
            this.state.inputText = '';

        } catch (e) {
            console.error(e);
            alert("Failed to load PDF.");
        } finally {
            this.state.isProcessing = false;
        }
    }

    reset() {
        this.state.file = null;
        this.state.pageCount = 0;
        this.state.pagesToDelete = new Set();
        this.state.inputText = '';
        this.pdfLibDoc = null;
        this.pdfJsDoc = null;
    }

    // Toggle a specific page (called from visual grid)
    togglePage(index: number) { // 0-based
        if (this.state.pagesToDelete.has(index)) {
            this.state.pagesToDelete.delete(index);
        } else {
            this.state.pagesToDelete.add(index);
        }
        // Force Svelte reactivity on the Set
        this.state.pagesToDelete = new Set(this.state.pagesToDelete);
        this.updateInputFromSet();
    }

    // Called when the user types in the text input
    handleInputUpdate(text: string) {
        this.state.inputText = text;
        const parsed = this.parsePageRanges(text, this.state.pageCount);
        this.state.pagesToDelete = new Set(parsed);
    }

    private updateInputFromSet() {
        const sorted = Array.from(this.state.pagesToDelete)
            .map(i => i + 1) // Convert to 1-based for UI
            .sort((a, b) => a - b);
        this.state.inputText = sorted.join(', ');
    }

    // --- Rendering ---
    async renderThumbnail(canvas: HTMLCanvasElement, pageIndex: number) {
        if (!this.pdfJsDoc) return;
        await this.renderPageToCanvas(canvas, this.pdfJsDoc, pageIndex);
    }

    // --- Processing ---
    async process() {
        if (!this.state.file || !this.pdfLibDoc) return;
        
        if (this.state.pagesToDelete.size === 0) {
            alert("Please select at least one page to delete.");
            return;
        }
        
        if (this.state.pagesToDelete.size >= this.state.pageCount) {
            alert("You cannot delete all pages in the document.");
            return;
        }

        this.state.isProcessing = true;
        this.state.progress = 'Deleting Pages...';

        try {
            const newPdf = await PDFDocument.create();
            const indicesToKeep = [];
            
            for (let i = 0; i < this.state.pageCount; i++) {
                if (!this.state.pagesToDelete.has(i)) {
                    indicesToKeep.push(i);
                }
            }
            
            const copiedPages = await newPdf.copyPages(this.pdfLibDoc, indicesToKeep);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
            
            const originalName = this.state.file.name.replace('.pdf', '');
            this.downloadFile(blob, `${originalName}_deleted.pdf`);

        } catch (e: any) {
            console.error(e);
            alert(`Process failed: ${e.message}`);
        } finally {
            this.state.isProcessing = false;
        }
    }

    private parsePageRanges(input: string, maxPages: number): number[] {
        const pages = new Set<number>();
        const parts = input.split(',');

        for (const part of parts) {
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
                if (!isNaN(num) && num >= 1 && num <= maxPages) {
                    pages.add(num - 1); 
                }
            }
        }
        return Array.from(pages);
    }

    private downloadFile(blob: Blob, fileName: string) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
}