import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { toast } from 'svelte-sonner';

export interface HeaderFooterStateData {
    file: File | null;
    pageCount: number;
    originalSize: number;
    
    // Formatting Options
    pageRange: string;
    fontSize: number;
    fontColor: string; // hex
    
    // Texts
    headerLeft: string;
    headerCenter: string;
    headerRight: string;
    footerLeft: string;
    footerCenter: string;
    footerRight: string;

    isProcessing: boolean;
}

export class HeaderFooterState extends PdfEngine {
    state = $state<HeaderFooterStateData>({
        file: null,
        pageCount: 0,
        originalSize: 0,
        pageRange: '',
        fontSize: 10,
        fontColor: '#000000',
        headerLeft: '',
        headerCenter: '',
        headerRight: '',
        footerLeft: '',
        footerCenter: '',
        footerRight: '',
        isProcessing: false
    });

    private pdfLibDoc: PDFDocument | null = null;

    result = $state.raw<{ blob: Blob; name: string } | null>(null);

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    targetPages(range: string): number[] {
        return this.parsePageRanges(range, this.state.pageCount);
    }

    async loadFile(files: File[]) {
        if (!files || files.length === 0) return;
        const file = files[0];
        
        this.state.isProcessing = true;
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.pdfLibDoc = await PDFDocument.load(arrayBuffer);
            
            this.state.file = file;
            this.state.originalSize = file.size;
            this.state.pageCount = this.pdfLibDoc.getPageCount();
            this.result = null;
        } catch (e) {
            console.error("Error loading PDF", e);
            toast.error("Failed to load the PDF file.");
        } finally {
            this.state.isProcessing = false;
        }
    }

    reset() {
        this.state.file = null;
        this.pdfLibDoc = null;
        this.state.pageCount = 0;
        this.state.originalSize = 0;
        this.result = null;
    }

    async process() {
        if (!this.pdfLibDoc || !this.state.file) return;
        this.state.isProcessing = true;
        this.result = null;

        try {
            // Draw on a fresh copy so a second run does not stack text on the loaded document.
            const doc = await PDFDocument.load(await this.state.file.arrayBuffer());
            const helveticaFont = await doc.embedFont(StandardFonts.Helvetica);
            const allPages = doc.getPages();
            const totalPages = allPages.length;
            const margin = 40;

            // Parse Color
            const hex = this.state.fontColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;
            const pdfColor = rgb(r, g, b);

            const indicesToProcess = this.parsePageRanges(this.state.pageRange, totalPages);
            if (indicesToProcess.length === 0) throw new Error("Invalid page range specified.");

            const drawOptions = { 
                font: helveticaFont, 
                size: this.state.fontSize, 
                color: pdfColor 
            };

            for (const pageIndex of indicesToProcess) {
                const page = allPages[pageIndex];
                const { width, height } = page.getSize();
                const pageNumber = pageIndex + 1;

                const processText = (text: string) => text.replace(/{page}/g, String(pageNumber)).replace(/{total}/g, String(totalPages));

                const processed = {
                    headerLeft: processText(this.state.headerLeft),
                    headerCenter: processText(this.state.headerCenter),
                    headerRight: processText(this.state.headerRight),
                    footerLeft: processText(this.state.footerLeft),
                    footerCenter: processText(this.state.footerCenter),
                    footerRight: processText(this.state.footerRight),
                };

                if (processed.headerLeft) page.drawText(processed.headerLeft, { ...drawOptions, x: margin, y: height - margin });
                if (processed.headerCenter) page.drawText(processed.headerCenter, { ...drawOptions, x: width / 2 - helveticaFont.widthOfTextAtSize(processed.headerCenter, this.state.fontSize) / 2, y: height - margin });
                if (processed.headerRight) page.drawText(processed.headerRight, { ...drawOptions, x: width - margin - helveticaFont.widthOfTextAtSize(processed.headerRight, this.state.fontSize), y: height - margin });
                
                if (processed.footerLeft) page.drawText(processed.footerLeft, { ...drawOptions, x: margin, y: margin });
                if (processed.footerCenter) page.drawText(processed.footerCenter, { ...drawOptions, x: width / 2 - helveticaFont.widthOfTextAtSize(processed.footerCenter, this.state.fontSize) / 2, y: margin });
                if (processed.footerRight) page.drawText(processed.footerRight, { ...drawOptions, x: width - margin - helveticaFont.widthOfTextAtSize(processed.footerRight, this.state.fontSize), y: margin });
            }

            const newPdfBytes = await doc.save();
            const blob = new Blob([newPdfBytes as BlobPart], { type: 'application/pdf' });
            
            const originalName = this.state.file.name.replace('.pdf', '');
            const name = `${originalName}_header_footer.pdf`;
            this.result = { blob, name };
            this.downloadBlob(blob, name);

        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "An error occurred.");
        } finally {
            this.state.isProcessing = false;
        }
    }

    private parsePageRanges(input: string, maxPages: number): number[] {
        if (!input || input.trim() === '') {
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
        return Array.from(pages).sort((a, b) => a - b);
    }

}