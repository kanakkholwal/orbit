import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { toast } from 'svelte-sonner';

export interface CropData {
    x: number; // Percentage (0-1)
    y: number; // Percentage (0-1)
    width: number; // Percentage (0-1)
    height: number; // Percentage (0-1)
}

export interface CropStateData {
    file: File | null;
    pageCount: number;
    currentPage: number; // 1-based index
    pageCrops: Record<number, CropData>; // Map pageNum -> CropData
    isDestructive: boolean;
    applyToAll: boolean;
}

export class CropPdfState extends PdfEngine {
    state = $state<CropStateData>({
        file: null,
        pageCount: 0,
        currentPage: 1,
        pageCrops: {},
        isDestructive: false,
        applyToAll: false,
    });

    private pdfJsDoc: PDFDocumentProxy | null = null;
    private fileBuffer: ArrayBuffer | null = null;

// Actions

    async loadFile(file: File) {
        if (!file) return;
        this.progress = { text: 'Loading PDF...',current: 0, total: 0 };
        
        try {
            this.fileBuffer = await file.arrayBuffer();
            const pdfjs = await this.getPdfJs();
            
            const loadingTask = pdfjs.getDocument(new Uint8Array(this.fileBuffer.slice(0)));
            this.pdfJsDoc = await loadingTask.promise;
            
            this.state.file = file;
            this.state.pageCount = this.pdfJsDoc.numPages;
            this.state.currentPage = 1;
            this.state.pageCrops = {};

        } catch (e) {
            console.error(e);
            toast.error("Failed to load PDF.");
        } finally {
            this.isProcessing = false;
        }
    }

    reset() {
        this.state.file = null;
        this.state.pageCrops = {};
        this.pdfJsDoc = null;
        this.fileBuffer = null;
    }

    setPage(pageNum: number) {
        if (pageNum >= 1 && pageNum <= this.state.pageCount) {
            this.state.currentPage = pageNum;
        }
    }

    saveCrop(pageNum: number, crop: CropData) {
        this.state.pageCrops[pageNum] = crop;
    }

// Rendering for Cropper

    async renderPageForCropper(canvas: HTMLCanvasElement, pageNum: number) {
        if (!this.pdfJsDoc) return;
        // Render high quality for UI
        await this.renderPageToCanvas(canvas, this.pdfJsDoc, pageNum - 1, 1000); 
    }

// Processing

    async crop() {
        if (!this.state.file || !this.pdfJsDoc || !this.fileBuffer) return;

        // Prepare final crop map
        const finalCrops: Record<number, CropData> = {};
        
        if (this.state.applyToAll) {
            const currentCrop = this.state.pageCrops[this.state.currentPage];
            if (!currentCrop) {
                toast.error("Please define a crop area on the current page first.");
                return;
            }
            for (let i = 1; i <= this.state.pageCount; i++) {
                finalCrops[i] = currentCrop;
            }
        } else {
            Object.assign(finalCrops, this.state.pageCrops);
        }

        if (Object.keys(finalCrops).length === 0) {
            toast.error("No pages have been cropped.");
            return;
        }

        this.isProcessing = true;
        this.progress = { text: 'Applying Crop...', current: 0, total: 0 };
        
        try {
            let pdfBytes: Uint8Array;
            if (this.state.isDestructive) {
                pdfBytes = await this.performDestructiveCrop(finalCrops);
            } else {
                pdfBytes = await this.performMetadataCrop(finalCrops);
            }

            const prefix = this.state.isDestructive ? 'flattened' : 'cropped';
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
            this.downloadBlob(blob, `${prefix}_${this.state.file.name}`);

        } catch (e: any) {
            console.error(e);
            toast.error(`Crop failed: ${e.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    // Mode 1: Metadata Crop (Fast, Non-Destructive)
    private async performMetadataCrop(crops: Record<number, CropData>): Promise<Uint8Array> {
        const pdfDoc = await PDFDocument.load(this.fileBuffer!, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();

        for (const [pageNumStr, crop] of Object.entries(crops)) {
            const pageNum = parseInt(pageNumStr);
            // Get original page geometry from PDF.js to convert percentage to PDF points
            const pdfJsPage = await this.pdfJsDoc!.getPage(pageNum);
            const viewport = pdfJsPage.getViewport({ scale: 1 }); // 1pt = 1px logic in PDF world usually

            // Calculate crop box in PDF points
            const cropX = viewport.width * crop.x;
            const cropY = viewport.height * crop.y; // PDF coordinates might need inversion depending on origin
            const cropW = viewport.width * crop.width;
            const cropH = viewport.height * crop.height;

            // Coordinate conversion: Visual (Top-Left) -> PDF (Bottom-Left) usually handled by library logic
            // But raw setCropBox takes (x, y, width, height) relative to MediaBox.
            // PDF-Lib coordinate system handling:
            // (0,0) is bottom-left. Visual crop is top-left.
            // We need to map the visual rectangle to the PDF page rectangle.
            
            // NOTE: A more robust way used in your legacy code involves `viewport.convertToPdfPoint`.
            // Since we don't expose that easily from the worker, we approximate standard PDF coords.
            // or we do visual geometry calc here:
            
            const page = pages[pageNum - 1];
            const { width, height } = page.getSize(); // PDF-Lib size
            
            // Visual Y starts from top. PDF Y starts from bottom.
            // Crop Y (bottom-left) = Page Height - Visual Y (top) - Visual Height
            const pdfCropX = width * crop.x;
            const pdfCropY = height - (height * crop.y) - (height * crop.height);
            const pdfCropW = width * crop.width;
            const pdfCropH = height * crop.height;

            page.setCropBox(pdfCropX, pdfCropY, pdfCropW, pdfCropH);
        }

        return pdfDoc.save();
    }

    // Mode 2: Destructive (Rasterize -> Embed) - "Hard Crop"
    private async performDestructiveCrop(crops: Record<number, CropData>): Promise<Uint8Array> {
        const newPdf = await PDFDocument.create();
        const sourcePdf = await PDFDocument.load(this.fileBuffer!, { ignoreEncryption: true });
        
        for (let i = 1; i <= this.state.pageCount; i++) {
            this.progress = { text: `Processing Page ${i}...`, current: i, total: this.state.pageCount };
            
            if (crops[i]) {
                const crop = crops[i];
                const page = await this.pdfJsDoc!.getPage(i);
                
                // 1. Render Page to Canvas (High Res)
                const scale = 2.5;
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d')!;
                
                await page.render({ canvasContext: ctx, viewport,canvas }).promise;

                // 2. Crop Canvas
                const cropX = viewport.width * crop.x;
                const cropY = viewport.height * crop.y;
                const cropW = viewport.width * crop.width;
                const cropH = viewport.height * crop.height;

                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = cropW;
                finalCanvas.height = cropH;
                const finalCtx = finalCanvas.getContext('2d')!;

                finalCtx.drawImage(
                    canvas, 
                    cropX, cropY, cropW, cropH, 
                    0, 0, cropW, cropH
                );

                // 3. Embed Image into New PDF
                const imgBlob = await new Promise<Blob | null>(r => finalCanvas.toBlob(r, 'image/jpeg', 0.9));
                if (imgBlob) {
                    const imgBytes = await imgBlob.arrayBuffer();
                    const embeddedImg = await newPdf.embedJpg(imgBytes);
                    const newPage = newPdf.addPage([cropW / scale, cropH / scale]); // Scale back down to PDF points
                    newPage.drawImage(embeddedImg, {
                        x: 0, y: 0,
                        width: cropW / scale,
                        height: cropH / scale
                    });
                }
            } else {
                // Copy original page if not cropped
                const [copied] = await newPdf.copyPages(sourcePdf, [i - 1]);
                newPdf.addPage(copied);
            }
        }
        return newPdf.save();
    }


}