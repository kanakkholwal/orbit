import { PdfEngine } from '$lib/pdf-engine.svelte';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

export interface ExtractStateData {
    file: File | null;
    pageCount: number;
    pagesToExtract: string; // The user input string "1, 3-5"
    isProcessing: boolean;
    progress: string;
}

export class ExtractPagesState extends PdfEngine {
    state = $state<ExtractStateData>({
        file: null,
        pageCount: 0,
        pagesToExtract: '',
        isProcessing: false,
        progress: ''
    });

    private pdfDoc: PDFDocument | null = null;

    // --- Actions ---

    async loadFile(file: File) {
        if (!file) return;
        this.state.isProcessing = true;
        this.state.progress = 'Loading PDF...';

        try {
            const arrayBuffer = await file.arrayBuffer();
            this.pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            
            this.state.file = file;
            this.state.pageCount = this.pdfDoc.getPageCount();
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
        this.state.pagesToExtract = '';
        this.pdfDoc = null;
    }

    // --- Processing ---

    async extract() {
        if (!this.state.file || !this.pdfDoc) return;
        
        const indices = this.parsePageRanges(this.state.pagesToExtract, this.state.pageCount);
        
        if (indices.length === 0) {
            alert("Please enter valid page numbers.");
            return;
        }

        this.state.isProcessing = true;
        this.state.progress = 'Extracting...';

        try {
            const zip = new JSZip();
            const baseName = this.state.file.name.replace('.pdf', '');

            for (let i = 0; i < indices.length; i++) {
                const pageIndex = indices[i];
                this.state.progress = `Extracting page ${pageIndex + 1}...`;

                const newPdf = await PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(this.pdfDoc, [pageIndex]);
                newPdf.addPage(copiedPage);
                
                const pdfBytes = await newPdf.save();
                zip.file(`${baseName}_page_${pageIndex + 1}.pdf`, pdfBytes);
            }

            this.state.progress = 'Creating ZIP...';
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            this.downloadFile(zipBlob, `${baseName}_extracted.zip`);

        } catch (e: any) {
            console.error(e);
            alert(`Extraction failed: ${e.message}`);
        } finally {
            this.state.isProcessing = false;
        }
    }

    private parsePageRanges(input: string, maxPages: number): number[] {
        const pages = new Set<number>();
        const parts = input.split(',');

        for (const part of parts) {
            const trimmed = part.trim();
            if (trimmed.includes('-')) {
                const [start, end] = trimmed.split('-').map(Number);
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) {
                        if (i >= 1 && i <= maxPages) pages.add(i - 1); // Convert to 0-based
                    }
                }
            } else {
                const num = parseInt(trimmed);
                if (!isNaN(num) && num >= 1 && num <= maxPages) {
                    pages.add(num - 1); // Convert to 0-based
                }
            }
        }
        
        return Array.from(pages).sort((a, b) => a - b);
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