import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';

export type WatermarkType = 'text' | 'image';

export interface WatermarkStateData {
    file: File | null;
    watermarkType: WatermarkType;

    // Text Options
    text: string;
    fontSize: number;
    color: string; // Hex

    // Image Options
    imageFile: File | null;
    imageScale: number; // For future scaling features, default 0.5 or fit

    // Common Options
    opacity: number; // 0 to 1
    rotation: number; // degrees
}

export class AddWatermarkState extends PdfEngine {
    state = $state<WatermarkStateData>({
        file: null,
        watermarkType: 'text',
        text: 'CONFIDENTIAL',
        fontSize: 72,
        color: '#FF0000',
        imageFile: null,
        imageScale: 0.5,
        opacity: 0.3,
        rotation: -45
    });

    // --- Actions ---

    loadFile(file: File) {
        if (!file) return;
        this.state.file = file;
    }

    reset() {
        this.state.file = null;
        this.isProcessing = false;
        // Resetting content is optional, user might want to watermark multiple files with same settings
    }

    // --- Processing ---

    async process() {
        if (!this.state.file) return;

        await this.handleProcess(async () => {
            const arrayBuffer = await this.state.file!.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            const pages = pdfDoc.getPages();
            // const { width, height } = pages[0].getSize(); // Assume consistent size for centering logic base, or iter per page

            // Prepare Common Resources
            let embedImage: any = null;
            let font: any = null;

            if (this.state.watermarkType === 'image' && this.state.imageFile) {
                const imgBuffer = await this.state.imageFile.arrayBuffer();
                if (this.state.imageFile.type === 'image/png') {
                    embedImage = await pdfDoc.embedPng(imgBuffer);
                } else {
                    embedImage = await pdfDoc.embedJpg(imgBuffer);
                }
            } else {
                font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            }

            // Apply to all pages
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const { width: pageWidth, height: pageHeight } = page.getSize();

                if (this.state.watermarkType === 'text') {
                    const text = this.state.text;
                    const textSize = this.state.fontSize;
                    const textWidth = font.widthOfTextAtSize(text, textSize);
                    const textHeight = font.heightAtSize(textSize);

                    // Parse Hex Color
                    const r = parseInt(this.state.color.slice(1, 3), 16) / 255;
                    const g = parseInt(this.state.color.slice(3, 5), 16) / 255;
                    const b = parseInt(this.state.color.slice(5, 7), 16) / 255;

                    // Simple Centering
                    const x = pageWidth / 2 - textWidth / 2;
                    const y = pageHeight / 2 - textHeight / 2;

                    page.drawText(text, {
                        x,
                        y,
                        size: textSize,
                        font: font,
                        color: rgb(r, g, b),
                        opacity: this.state.opacity,
                        rotate: degrees(this.state.rotation),
                    });

                } else if (embedImage) {
                    // Image Watermark
                    const imgDims = embedImage.scale(this.state.imageScale);

                    // Simple Centering
                    const x = pageWidth / 2 - imgDims.width / 2;
                    const y = pageHeight / 2 - imgDims.height / 2;

                    page.drawImage(embedImage, {
                        x,
                        y,
                        width: imgDims.width,
                        height: imgDims.height,
                        opacity: this.state.opacity,
                        rotate: degrees(this.state.rotation),
                    });
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

            const originalName = this.state.file!.name.replace('.pdf', '');
            this.downloadBlob(blob, `${originalName}_watermarked.pdf`);
        }, {
            loading: 'Applying watermark...',
            success: 'Watermark applied successfully!',
            error: 'Failed to apply watermark.'
        });
    }
}

