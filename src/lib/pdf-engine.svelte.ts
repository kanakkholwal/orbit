import type * as PDFJS from 'pdfjs-dist';

export class PdfEngine {
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
        targetWidth: number = 300
    ) {
        if (!pdfDocProxy) return;

        const page = await pdfDocProxy.getPage(pageIndex + 1);

        const viewport = page.getViewport({ scale: 1 });

        // Thumbnail size ~200px
        const scale = 200 / viewport.width;
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
}