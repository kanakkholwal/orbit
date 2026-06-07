import type * as PDFJS from 'pdfjs-dist';
import { BaseEngine } from './base-engine.svelte';

export interface ProgressState {
    current: number;
    total: number;
    text: string;
}

/**
 * Canonical base class for ALL tool state classes (`<Name>State extends PdfEngine`).
 *
 * It inherits the generic runtime from {@link BaseEngine} (isProcessing,
 * progress/progressLabel, handleProcess, downloadBlob) and adds PDF-specific
 * helpers (lazy pdf.js, thumbnail rendering, page-range parsing). pdf.js is
 * dynamically imported only when `getPdfJs()` is first called, so tools that
 * never render thumbnails pay no bundle cost — there is therefore no reason to
 * extend BaseEngine directly. One base, no decision.
 */
export class PdfEngine extends BaseEngine {

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


}

