import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PageSizes, PDFDocument, rgb } from 'pdf-lib';
import { toast } from 'svelte-sonner';

export class FixPageSizeState extends PdfEngine {
    file = $state<{ file: File; originalSize: number } | null>(null);
    isProcessing = $state(false);

    // Settings
    targetSize = $state('A4');
    customWidth = $state(8.5);
    customHeight = $state(11);
    customUnits = $state('in');
    orientation = $state('auto');
    scalingMode = $state<'fit' | 'fill'>('fit');
    backgroundColor = $state('#ffffff');


    result = $state.raw<{ blob: Blob; name: string } | null>(null);

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    /** Output page size in points, after orientation. Mirrors `process()`. */
    get targetDimensions(): [number, number] {
        let w: number;
        let h: number;
        if (this.targetSize === 'Custom') {
            const unit = this.customUnits === 'in' ? 72 : 72 / 25.4;
            w = Number(this.customWidth) * unit;
            h = Number(this.customHeight) * unit;
        } else {
            [w, h] = PageSizes[this.targetSize as keyof typeof PageSizes];
        }
        if ((this.orientation === 'landscape' && w < h) || (this.orientation === 'portrait' && w > h)) [w, h] = [h, w];
        return [w, h];
    }

    loadFile(files: File[]) {
        const validFile = files.find(
            f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );

        if (!validFile) {
            toast.error('Please upload a valid PDF file.');
            return;
        }

        this.file = { file: validFile, originalSize: validFile.size };
        this.result = null;
    }

    reset() {
        this.file = null;
        this.result = null;
        this.isProcessing = false;
    }


    async process() {
        if (!this.file) return;

        this.isProcessing = true;
        this.result = null;
        try {
            let targetWidth: number;
            let targetHeight: number;

            // 1. Calculate Target Dimensions in Points (72 dpi)
            if (this.targetSize === 'Custom') {
                if (this.customUnits === 'in') {
                    targetWidth = this.customWidth * 72;
                    targetHeight = this.customHeight * 72;
                } else {
                    // millimeters
                    targetWidth = this.customWidth * (72 / 25.4);
                    targetHeight = this.customHeight * (72 / 25.4);
                }
            } else {
                [targetWidth, targetHeight] = PageSizes[this.targetSize as keyof typeof PageSizes];
            }

            // 2. Adjust for Orientation
            if (this.orientation === 'landscape' && targetWidth < targetHeight) {
                [targetWidth, targetHeight] = [targetHeight, targetWidth];
            } else if (this.orientation === 'portrait' && targetWidth > targetHeight) {
                [targetWidth, targetHeight] = [targetHeight, targetWidth];
            }

            // 3. Parse Background Color
            const bgRgb = this.hexToRgb(this.backgroundColor);

            const arrayBuffer = await this.file.file.arrayBuffer();
            const sourceDoc = await PDFDocument.load(arrayBuffer);
            const newDoc = await PDFDocument.create();

            // 4. Process each page
            for (const sourcePage of sourceDoc.getPages()) {
                const { width: sourceWidth, height: sourceHeight } = sourcePage.getSize();
                const embeddedPage = await newDoc.embedPage(sourcePage);

                const newPage = newDoc.addPage([targetWidth, targetHeight]);
                
                // Draw background
                newPage.drawRectangle({
                    x: 0,
                    y: 0,
                    width: targetWidth,
                    height: targetHeight,
                    color: rgb(bgRgb.r / 255, bgRgb.g / 255, bgRgb.b / 255),
                });

                // Calculate scaling
                const scaleX = targetWidth / sourceWidth;
                const scaleY = targetHeight / sourceHeight;
                const scale = this.scalingMode === 'fit' 
                    ? Math.min(scaleX, scaleY) 
                    : Math.max(scaleX, scaleY);

                const scaledWidth = sourceWidth * scale;
                const scaledHeight = sourceHeight * scale;

                // Center the content
                const x = (targetWidth - scaledWidth) / 2;
                const y = (targetHeight - scaledHeight) / 2;

                newPage.drawPage(embeddedPage, {
                    x,
                    y,
                    width: scaledWidth,
                    height: scaledHeight,
                });
            }

            const newPdfBytes = await newDoc.save();
            const blob = new Blob([newPdfBytes as BlobPart], { type: 'application/pdf' });
            
            const originalName = this.file.file.name.replace(/\.pdf$/i, '');
            const name = `${originalName}_standardized.pdf`;
            this.result = { blob, name };
            this.downloadBlob(blob, name);

        } catch (e: any) {
            console.error('[Fix Page Size] Error:', e);
            toast.error(`An error occurred while standardizing pages: ${e.message}`);
        } finally {
            this.isProcessing = false;
        }
    }


    private hexToRgb(hex: string) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 }; // fallback white
    }

 
}