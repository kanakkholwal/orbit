import { BaseEngine } from '$lib/base-engine.svelte';
import { PDFDocument, rgb } from 'pdf-lib';

export interface BackgroundColorStateData {
    file: File | null;
    pageCount: number;
    originalSize: number;
    colorHex: string;
    pageRange: string; 
}

export class BackgroundColorState extends BaseEngine {
    state = $state<BackgroundColorStateData>({
        file: null,
        pageCount: 0,
        originalSize: 0,
        colorHex: '#FFFFCC', // Default to a light yellow/off-white
        pageRange: '',       // Default empty means "All Pages"
    });

    private pdfLibDoc: PDFDocument | null = null;

Actions

    async loadFile(files: File[]) {
        if (!files || files.length === 0) return;
        const file = files[0];

        this.isProcessing = true;
        this.handleProcess(async () => {
            const arrayBuffer = await file.arrayBuffer();
            this.pdfLibDoc = await PDFDocument.load(arrayBuffer);

            this.state.file = file;
            this.state.originalSize = file.size;
            this.state.pageCount = this.pdfLibDoc.getPageCount();
        },{
            loading: 'Loading PDF...',
            success: 'PDF loaded successfully!',
            error: 'Failed to load the PDF file.'
        })

    }

    reset() {
        this.state.file = null;
        this.pdfLibDoc = null;
        this.state.pageCount = 0;
        this.state.originalSize = 0;
        this.state.pageRange = '';
        this.progress = { current: 0, total: 0, text: '' };
    }

Processing

    async process() {
        this.handleProcess(async () => {
            if (!this.pdfLibDoc || !this.state.file) return;
             // Parse Hex to RGB
            const hex = this.state.colorHex.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;
            const pdfColor = rgb(r, g, b);

            const newPdfDoc = await PDFDocument.create();
            const totalPages = this.pdfLibDoc.getPageCount();

            // Get which pages to process
            const pagesToProcess = new Set(this.parsePageRanges(this.state.pageRange, totalPages));

            for (let i = 0; i < totalPages; i++) {
                const [originalPage] = await newPdfDoc.copyPages(this.pdfLibDoc, [i]);

                if (pagesToProcess.has(i)) {
                    // Apply background color to this page
                    const { width, height } = originalPage.getSize();
                    const newPage = newPdfDoc.addPage([width, height]);

                    // Draw background
                    newPage.drawRectangle({
                        x: 0,
                        y: 0,
                        width,
                        height,
                        color: pdfColor
                    });

                    // Embed and draw original
                    const embeddedPage = await newPdfDoc.embedPage(originalPage);
                    newPage.drawPage(embeddedPage, { x: 0, y: 0, width, height });
                } else {
                    // Keep page as is without background
                    newPdfDoc.addPage(originalPage);
                }
            }

            const newPdfBytes = await newPdfDoc.save();
            const blob = new Blob([newPdfBytes as BlobPart], { type: 'application/pdf' });

            const originalName = this.state.file.name.replace('.pdf', '');
            this.downloadBlob(blob, `${originalName}_bg_changed.pdf`);
        },{
            loading: 'Changing background color...',
            success: 'Background color changed successfully!',
            error: (e) => `Could not change the background color: ${e.message || e}`
        })
    }

    private parsePageRanges(input: string, maxPages: number): number[] {
        // If empty or "all", return all pages
        if (!input || input.trim() === '' || input.trim().toLowerCase() === 'all') {
            return Array.from({ length: maxPages }, (_, i) => i);
        }

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
                        if (i >= 1 && i <= maxPages) pages.add(i - 1); // 0-based
                    }
                }
            } else {
                const num = parseInt(trimmed);
                if (!isNaN(num) && num >= 1 && num <= maxPages) {
                    pages.add(num - 1); // 0-based
                }
            }
        }
        return Array.from(pages);
    }

}