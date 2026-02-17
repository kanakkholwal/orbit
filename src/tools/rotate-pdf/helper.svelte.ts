// FIX: Ensure this extension matches the file created in Step 1
import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument, degrees } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface RotatePageData {
    pageIndex: number;
    rotation: number;
}

export interface RotatePdfStateData {
    file: File | null;
    pageCount: number;
    pages: RotatePageData[];
    isProcessing: boolean;
    progress: string;
}

export class RotatePdfState extends PdfEngine {
    state = $state<RotatePdfStateData>({
        file: null,
        pageCount: 0,
        pages: [],
        isProcessing: false,
        progress: ''
    });

    private pdfJsDoc: PDFDocumentProxy | null = null;

    async loadFile(file: File) {
        if (!file) return;
        this.state.isProcessing = true;
        this.state.progress = 'Loading PDF...';

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfjs = await this.getPdfJs();
            
            const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer));
            this.pdfJsDoc = await loadingTask.promise;
            
            this.state.file = file;
            this.state.pageCount = this.pdfJsDoc.numPages;
            
            this.state.pages = Array.from({ length: this.pdfJsDoc.numPages }, (_, i) => ({
                pageIndex: i,
                rotation: 0
            }));

        } catch (e) {
            console.error(e);
            alert("Failed to load PDF.");
        } finally {
            this.state.isProcessing = false;
        }
    }

    reset() {
        this.state.file = null;
        this.state.pages = [];
        this.state.pageCount = 0;
        this.pdfJsDoc = null;
    }

    rotatePage(index: number, delta: number) {
        const page = this.state.pages[index];
        if (page) page.rotation += delta;
    }

    rotateAll(delta: number) {
        this.state.pages.forEach(p => p.rotation += delta);
    }

    resetRotations() {
        this.state.pages.forEach(p => p.rotation = 0);
    }

    async renderThumbnail(canvas: HTMLCanvasElement, pageIndex: number) {
        if (!this.pdfJsDoc) return;
        await this.renderPageToCanvas(canvas, this.pdfJsDoc, pageIndex);
    }

    async save() {
        if (!this.state.file) return;
        this.state.isProcessing = true;
        this.state.progress = 'Saving...';

        try {
            const arrayBuffer = await this.state.file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();
            
            this.state.pages.forEach((p, i) => {
                const page = pages[i];
                const currentRotation = page.getRotation().angle;
                page.setRotation(degrees(currentRotation + p.rotation));
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
            
            const originalName = this.state.file.name.replace('.pdf', '');
            this.downloadFile(blob, `${originalName}_rotated.pdf`);

        } catch (e: any) {
            console.error(e);
            alert(`Save failed: ${e.message}`);
        } finally {
            this.state.isProcessing = false;
        }
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