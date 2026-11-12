import { releaseCanvas, safeScale, yieldToMain } from '$lib/device-limits';
import { PdfEngine } from '$lib/pdf-engine.svelte';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'svelte-sonner';

// Types for Compression
export type Algorithm = 'condense' | 'photon';
export type CompressionLevel = 'light' | 'balanced' | 'aggressive' | 'extreme';

export interface CompressSettings {
    algorithm: Algorithm;
    level: CompressionLevel;
    // Custom Settings (Optional overrides)
    imageQuality?: number;
    dpiTarget?: number;
    removeMetadata: boolean;
    subsetFonts: boolean;
    convertToGrayscale: boolean;
    removeThumbnails: boolean;
    /** Keep tightening until the file is under this many KB. 0 means use the chosen level only. */
    targetKB: number;
}

export interface CompressFile {
    file: File;
    id: string;
    originalSize: number;
    status: 'pending' | 'processing' | 'done' | 'error';
    compressedSize?: number;
    /** False when even the strongest setting stayed above the target. */
    metTarget?: boolean;
    resultBlob?: Blob;
    error?: string;
}

// Preset Configurations
const CONDENSE_PRESETS = {
    light: { imageQuality: 90, dpiTarget: 150 },
    balanced: { imageQuality: 75, dpiTarget: 96 },
    aggressive: { imageQuality: 50, dpiTarget: 72 },
    extreme: { imageQuality: 30, dpiTarget: 60 },
};

const PHOTON_PRESETS = {
    light: { scale: 2.0, quality: 0.85 },
    balanced: { scale: 1.5, quality: 0.65 },
    aggressive: { scale: 1.2, quality: 0.45 },
    extreme: { scale: 1.0, quality: 0.25 },
};

export class CompressState extends PdfEngine {
    files = $state<CompressFile[]>([]);
    settings = $state<CompressSettings>({
        algorithm: 'condense',
        level: 'balanced',
        removeMetadata: true,
        subsetFonts: true,
        convertToGrayscale: false,
        removeThumbnails: true,
        targetKB: 0
    });




    addFiles(newFiles: File[]) {
        const entries = newFiles.map(f => ({
            file: f,
            id: crypto.randomUUID(),
            originalSize: f.size,
            status: 'pending' as const
        }));
        this.files.push(...entries);
    }

    removeFile(id: string) {
        this.files = this.files.filter(f => f.id !== id);
    }

    reset() {
        this.files = [];
        this.isProcessing = false;
    }

    get doneFiles() {
        return this.files.filter(f => f.status === 'done' && f.resultBlob);
    }

    get totalSize() {
        return this.files.reduce((sum, f) => sum + f.originalSize, 0);
    }

    get savedBytes() {
        return this.doneFiles.reduce((sum, f) => sum + (f.originalSize - (f.compressedSize ?? f.originalSize)), 0);
    }

    /** Compressed outputs as Files, for handing to another tool. */
    get resultFiles(): File[] {
        return this.doneFiles.map(f => new File([f.resultBlob!], `compressed_${f.file.name}`, { type: 'application/pdf' }));
    }

// Compression Logic

    async process() {
        if (this.files.length === 0) return;
        this.isProcessing = true;
        this.progress = { current: 0, total: this.files.length, text: 'Starting...' };

        try {
            // Lazy load heavy libs only when needed
            let pymupdf: any = null;
            this.progress.text = 'Loading compression engine...';
            if (this.settings.algorithm === 'condense' || this.settings.targetKB > 0) {
                // You'll need to adapt your pymupdf loader to be importable here
                // For now, I'll stub it or assume you have a utility
                const { loadPyMuPDF } = await import('$utils/pymupdf-loader');
                pymupdf = await loadPyMuPDF();
            } else {
                // For Photon, we need PDF.js
                await this.getPdfJs();
            }
            this.progress.text = 'Compressing files...';

            const queue = this.files.filter(f => f.status === 'pending');
            for (let i = 0; i < queue.length; i++) {
                const fileEntry = queue[i];
                fileEntry.status = 'processing';
                this.progress = { current: i + 1, total: queue.length, text: `Compressing ${fileEntry.file.name}` };

                try {
                    let resultBlob: Blob;

                    if (this.settings.targetKB > 0) {
                        resultBlob = await this.compressToTarget(fileEntry.file, pymupdf);
                        fileEntry.metTarget = resultBlob.size <= this.settings.targetKB * 1024;
                    } else if (this.settings.algorithm === 'condense') {
                        resultBlob = await this.compressCondense(fileEntry.file, pymupdf);
                    } else {
                        resultBlob = await this.compressPhoton(fileEntry.file);
                    }

                    fileEntry.resultBlob = resultBlob;
                    fileEntry.compressedSize = resultBlob.size;
                    fileEntry.status = 'done';

                } catch (e: any) {
                    console.error(e);
                    fileEntry.status = 'error';
                    fileEntry.error = e.message;
                }
            }

            // Download Logic
            await this.downloadResults();

        } catch (e) {
            console.error(e);
            toast.error("Critical error during compression.");
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Tries each strength from the chosen one upward with Optimize, then Flatten,
     * and returns the first result under the target, or the smallest seen.
     */
    private async compressToTarget(file: File, pymupdf: any): Promise<Blob> {
        const limit = this.settings.targetKB * 1024;
        const order: CompressionLevel[] = ['light', 'balanced', 'aggressive', 'extreme'];
        const from = Math.max(0, order.indexOf(this.settings.level));
        const steps: { algo: Algorithm; level: CompressionLevel }[] = [
            ...order.slice(from).map(level => ({ algo: 'condense' as const, level })),
            ...order.slice(Math.max(from, 1)).map(level => ({ algo: 'photon' as const, level }))
        ];
        let best: Blob | null = null;
        for (const [i, step] of steps.entries()) {
            this.progress.text = `Trying ${step.level} ${step.algo === 'condense' ? 'optimize' : 'flatten'} (${i + 1}/${steps.length})`;
            let blob: Blob;
            if (step.algo === 'condense') {
                blob = await this.compressCondense(file, pymupdf, step.level);
            } else {
                await this.getPdfJs();
                blob = await this.compressPhoton(file, step.level);
            }
            if (!best || blob.size < best.size) best = blob;
            if (blob.size <= limit) return blob;
            await yieldToMain();
        }
        return best as Blob;
    }

    private async compressCondense(file: File, pymupdf: any, level: CompressionLevel = this.settings.level): Promise<Blob> {
        const preset = CONDENSE_PRESETS[level];

        // Merge preset with custom overrides if any (logic simplified for brevity)
        const options = {
            images: {
                enabled: true,
                quality: this.settings.imageQuality ?? preset.imageQuality,
                dpiTarget: this.settings.dpiTarget ?? preset.dpiTarget,
                dpiThreshold: (this.settings.dpiTarget ?? preset.dpiTarget) + 10,
                convertToGray: this.settings.convertToGrayscale
            },
            scrub: {
                metadata: this.settings.removeMetadata,
                thumbnails: this.settings.removeThumbnails,
            },
            subsetFonts: this.settings.subsetFonts,
            save: { garbage: 4, deflate: true, clean: true }
        };

        const arrayBuffer = await file.arrayBuffer();
        // Assuming pymupdf.compressPdf accepts Uint8Array or Blob
        // Adapt based on your actual pymupdf implementation
        const result = await pymupdf.compressPdf(new Blob([arrayBuffer]), options);
        return result.blob;
    }

    private async compressPhoton(file: File, level: CompressionLevel = this.settings.level): Promise<Blob> {
        const preset = PHOTON_PRESETS[level];
        const arrayBuffer = await file.arrayBuffer();

        const loadingTask = this.pdfjsLib!.getDocument(new Uint8Array(arrayBuffer));
        const pdfDoc = await loadingTask.promise;
        const newPdf = await PDFDocument.create();

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const base = page.getViewport({ scale: 1 });
            const viewport = page.getViewport({ scale: safeScale(base.width, base.height, preset.scale) });

            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const ctx = canvas.getContext('2d');

            if (ctx) {
                await page.render({ canvasContext: ctx, viewport, canvas }).promise;

                const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', preset.quality));
                if (!blob) throw new Error("Canvas to Blob failed");

                const imgBytes = await blob.arrayBuffer();
                const embeddedImg = await newPdf.embedJpg(imgBytes);

                const newPage = newPdf.addPage([base.width, base.height]);
                newPage.drawImage(embeddedImg, {
                    x: 0, y: 0, width: base.width, height: base.height
                });
            }
            releaseCanvas(canvas);
            page.cleanup();
            await yieldToMain();
        }
        await pdfDoc.destroy();

        const pdfBytes = await newPdf.save();
        return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    }

    async downloadResults() {
        const successful = this.files.filter(f => f.status === 'done');
        if (successful.length === 0) return;

        if (successful.length === 1) {
            this.downloadBlob(successful[0].resultBlob!, `compressed_${successful[0].file.name}`);
        } else {
            const zip = new JSZip();
            successful.forEach(f => {
                zip.file(`compressed_${f.file.name}`, f.resultBlob!);
            });
            const content = await zip.generateAsync({ type: 'blob' });
            this.downloadBlob(content, 'compressed_files.zip');
        }
    }

}