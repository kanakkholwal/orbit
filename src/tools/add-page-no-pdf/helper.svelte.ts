import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type NumberFormat = 'n' | 'n of x';

export interface PageNumberStateData {
    file: File | null;
    pageCount: number;
    // Options
    position: Position;
    format: NumberFormat;
    fontSize: number;
    margin: number;
    color: string; // Hex code
    startFromPage: number; // 1-based index to start numbering from
}

export class PageNumberState extends PdfEngine {
    state = $state<PageNumberStateData>({
        file: null,
        pageCount: 0,
        position: 'bottom-center',
        format: 'n',
        fontSize: 12,
        margin: 20,
        color: '#000000',
        startFromPage: 1
    });

    // --- Actions ---

    async loadFile(file: File) {
        if (!file) return;
        this.isProcessing = true;
        this.progress = { text: 'Loading PDF...', current: 0, total: 0 };

        try {
            const arrayBuffer = await file.arrayBuffer();
            // Load simply to get page count
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            this.state.file = file;
            this.state.pageCount = pdfDoc.getPageCount();
        } catch (e) {
            console.error(e);
            alert("Failed to load PDF.");
        } finally {
            this.isProcessing = false;
        }
    }

    reset() {
        this.state.file = null;
        this.state.pageCount = 0;
    }

    // --- Processing ---

    async process() {
        if (!this.state.file) return;

        await this.handleProcess(async () => {
            const arrayBuffer = await this.state.file!.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            const pages = pdfDoc.getPages();
            const totalPages = pages.length;

            // Parse Color
            const r = parseInt(this.state.color.slice(1, 3), 16) / 255;
            const g = parseInt(this.state.color.slice(3, 5), 16) / 255;
            const b = parseInt(this.state.color.slice(5, 7), 16) / 255;
            const pdfColor = rgb(r, g, b);

            for (let i = 0; i < totalPages; i++) {
                const pageNum = i + 1;

                // Skip pages before startFromPage
                if (pageNum < this.state.startFromPage) continue;

                const page = pages[i];
                const { width, height } = page.getSize();

                // Determine Text
                const text = this.state.format === 'n'
                    ? `${pageNum}`
                    : `${pageNum} of ${totalPages}`;

                const textWidth = font.widthOfTextAtSize(text, this.state.fontSize);
                const textHeight = font.heightAtSize(this.state.fontSize);

                // Calculate Coordinates
                let x = 0;
                let y = 0;
                const margin = this.state.margin;

                // Horizontal
                if (this.state.position.includes('left')) {
                    x = margin;
                } else if (this.state.position.includes('center')) {
                    x = (width / 2) - (textWidth / 2);
                } else { // right
                    x = width - margin - textWidth;
                }

                // Vertical
                if (this.state.position.includes('top')) {
                    y = height - margin - textHeight;
                } else { // bottom
                    y = margin;
                }

                page.drawText(text, {
                    x,
                    y,
                    size: this.state.fontSize,
                    font: font,
                    color: pdfColor,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

            const originalName = this.state.file!.name.replace('.pdf', '');
            this.downloadBlob(blob, `${originalName}_numbered.pdf`);
        }, {
            loading: 'Adding page numbers...',
            success: 'PDF numbered successfully!',
            error: 'Failed to add page numbers.'
        });
    }
}

