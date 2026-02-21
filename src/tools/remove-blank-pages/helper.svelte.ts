import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface BlankPageStateData {
    file: File | null;
    pageCount: number;
    originalSize: number;
    
    sensitivity: number; // 0 to 100
    isDetecting: boolean;
    isProcessing: boolean;
    progress: string;

    // Array of objects representing pages detected as blank
    // isSelected indicates if the user wants to proceed with deleting it
    detectedPages: { index: number; isSelected: boolean }[];
    hasPerformedDetection: boolean;
}

export class RemoveBlankPagesState extends PdfEngine {
    state = $state<BlankPageStateData>({
        file: null,
        pageCount: 0,
        originalSize: 0,
        sensitivity: 80,
        isDetecting: false,
        isProcessing: false,
        progress: '',
        detectedPages: [],
        hasPerformedDetection: false
    });

    private pdfLibDoc: PDFDocument | null = null;
    private pdfJsDoc: PDFDocumentProxy | null = null;

    // --- Actions ---

    async loadFile(files: File[]) {
        if (!files || files.length === 0) return;
        const file = files[0];
        
        this.state.isProcessing = true;
        this.state.progress = 'Loading PDF...';
        try {
            const arrayBuffer = await file.arrayBuffer();
            
            // Load for rendering/analysis
            const pdfjs = await this.getPdfJs();
            const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer.slice(0)));
            this.pdfJsDoc = await loadingTask.promise;
            
            // Load for manipulation
            this.pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            
            this.state.file = file;
            this.state.originalSize = file.size;
            this.state.pageCount = this.pdfJsDoc.numPages;
            this.state.detectedPages = [];
            this.state.hasPerformedDetection = false;

        } catch (e) {
            console.error("Error loading PDF", e);
            alert("Failed to load the PDF file.");
        } finally {
            this.state.isProcessing = false;
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
    }

    togglePageSelection(index: number) {
        const page = this.state.detectedPages.find(p => p.index === index);
        if (page) {
            page.isSelected = !page.isSelected;
        }
    }

    // --- Detection ---

    async detectBlankPages() {
        if (!this.pdfJsDoc) return;
        
        this.state.isDetecting = true;
        this.state.progress = 'Analyzing pages...';
        this.state.detectedPages = [];
        
        // Convert sensitivity (0-100) to a brightness threshold (0-255).
        // Higher sensitivity = lower threshold (more strict, detects fewer things as "content", so more pages are "blank")
        // Note: 255 is pure white. If sensitivity is 100, threshold is ~0. If 0, threshold is 255.
        // The original logic: threshold = Math.round(255 - (sensitivityPercent * 2.55))
        const threshold = Math.round(255 - (this.state.sensitivity * 2.55));

        try {
            const totalPages = this.pdfJsDoc.numPages;
            const detected = [];

            for (let i = 1; i <= totalPages; i++) {
                this.state.progress = `Analyzing page ${i} of ${totalPages}...`;
                const page = await this.pdfJsDoc.getPage(i);
                const isBlank = await this.isPageBlank(page, threshold);
                
                if (isBlank) {
                    detected.push({ index: i - 1, isSelected: true }); // 0-based index
                }
            }

            this.state.detectedPages = detected;
            this.state.hasPerformedDetection = true;

        } catch (e) {
            console.error(e);
            alert("Error during blank page detection.");
        } finally {
            this.state.isDetecting = false;
        }
    }

    private async isPageBlank(page: any, threshold: number): Promise<boolean> {
        // Render at a low scale for fast pixel analysis
        const viewport = page.getViewport({ scale: 0.5 });
        
        // We need an offscreen canvas for pixel reading
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let totalBrightness = 0;
        // Check every 4th byte (R, G, B, A)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Simple average brightness calculation
            totalBrightness += (r + g + b) / 3;
        }

        const avgBrightness = totalBrightness / (data.length / 4);
        
        // If average brightness is higher than the threshold, it is considered blank (white)
        return avgBrightness > threshold;
    }

    // --- Rendering for UI Thumbnails ---
    async renderThumbnail(canvas: HTMLCanvasElement, pageIndex: number) {
        if (!this.pdfJsDoc) return;
        await this.renderPageToCanvas(canvas, this.pdfJsDoc, pageIndex, 0.3); // Low scale for thumbnail
    }


    // --- Processing ---

    async process() {
        if (!this.pdfLibDoc || !this.state.file) return;
        
        const pagesToRemove = new Set(
            this.state.detectedPages.filter(p => p.isSelected).map(p => p.index)
        );

        if (pagesToRemove.size === 0) {
            alert("No pages selected for removal.");
            return;
        }

        this.state.isProcessing = true;
        this.state.progress = 'Removing pages...';

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
            
            const originalName = this.state.file.name.replace('.pdf', '');
            this.downloadFile(blob, `${originalName}_no_blank.pdf`);

        } catch (e: any) {
            console.error(e);
            alert(e.message || "Could not remove pages.");
        } finally {
            this.state.isProcessing = false;
            // Optionally reset detection state after successful removal
            // this.state.hasPerformedDetection = false;
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