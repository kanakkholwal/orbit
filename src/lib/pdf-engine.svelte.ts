import type * as PDFJS from 'pdfjs-dist';
import { toast } from 'svelte-sonner';

export interface ProgressState {
    current: number;
    total: number;
    text: string;
}

export class PdfEngine {
    // Shared State
    isProcessing = $state(false);
    progress = $state<ProgressState>({ current: 0, total: 0, text: '' });

    // Protected so subclasses (MergeState, SplitState) can access it
    protected pdfjsLib: typeof PDFJS | null = null;

    /**
     * Loads the PDF.js library dynamically and configures the worker.
     * Protected so only this class and its children can use it.
     */
    protected async getPdfJs() {
        if (this.pdfjsLib) return this.pdfjsLib;

        const lib = await import('pdfjs-dist');

        lib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
        ).toString();
        this.pdfjsLib = lib;
        return lib;
    }

    /**
     * Shared logic to render a PDF page to a canvas.
     * Used by Merge, Split, Organize, etc.
     */
    async renderPageToCanvas(
        canvas: HTMLCanvasElement,
        pdfDocProxy: PDFJS.PDFDocumentProxy,
        pageIndex: number,
        targetWidth: number = 200
    ) {
        if (!pdfDocProxy) return;

        const page = await pdfDocProxy.getPage(pageIndex + 1);

        const viewport = page.getViewport({ scale: 1 });

        // Calculate scale to hit targetWidth
        const scale = targetWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(scaledViewport.width * outputScale);
        canvas.height = Math.floor(scaledViewport.height * outputScale);
        canvas.style.width = Math.floor(scaledViewport.width) + "px";
        canvas.style.height = Math.floor(scaledViewport.height) + "px";

        const ctx = canvas.getContext('2d');
        if (ctx) {
            await page.render({
                canvasContext: ctx,
                viewport: scaledViewport,
                transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
                canvas
            }).promise;
        }
    }

    /**
     * Shared logic to trigger a file download in the browser.
     */
    protected downloadBlob(blob: Blob, fileName: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Parses a range string (e.g., "1-3, 5") into an array of 0-based page indices.
     */
    protected parsePageRange(rangeStr: string, maxPages: number): number[] {
        const indices = new Set<number>();
        const parts = rangeStr.split(',');

        for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) continue;

            if (trimmed.includes('-')) {
                const [start, end] = trimmed.split('-').map(Number);
                if (!isNaN(start) && !isNaN(end)) {
                    // Clamp to valid range
                    const s = Math.max(1, start);
                    const e = Math.min(maxPages, end);
                    for (let i = s; i <= e; i++) indices.add(i - 1);
                }
            } else {
                const p = Number(trimmed);
                if (!isNaN(p) && p >= 1 && p <= maxPages) {
                    indices.add(p - 1);
                }
            }
        }
        return Array.from(indices).sort((a, b) => a - b);
    }

    /**
     * Standardized runner for async tasks with toast notifications.
     */
    protected async handleProcess<T>(
        task: () => Promise<T>,
        options: {
            loading?: string;
            success?: string;
            error?: string | ((err: any) => string);
        } = {}
    ) {
        const {
            loading = 'Processing...',
            success = 'Task completed successfully!',
            error = 'An error occurred during processing.'
        } = options;

        this.isProcessing = true;
        try {
            const result = await toast.promise(task(), {
                loading,
                success,
                error
            });
            return result;
        } finally {
            this.isProcessing = false;
        }
    }
}

