import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { toast } from 'svelte-sonner';

export interface Placement {
    page: number; // 0-based
    x: number; // left, ratio of page width (0..1)
    y: number; // top, ratio of page height (0..1)
    w: number; // width, ratio of page width (0..1)
}

export class EsignPdfState extends PdfEngine {
    fileName = $state('document');
    pdfBytes = $state<Uint8Array | null>(null);
    pageCount = $state(0);

    /** PNG data URL of the signature (drawn / typed / uploaded). */
    signature = $state<string | null>(null);
    /** height / width of the signature image, for aspect-correct placement. */
    signatureAspect = $state(0.4);

    placement = $state<Placement>({ page: 0, x: 0.62, y: 0.82, w: 0.3 });

    private pdfJsDoc: PDFDocumentProxy | null = null;

    get hasPdf(): boolean {
        return this.pdfBytes !== null;
    }
    get ready(): boolean {
        return this.hasPdf && this.signature !== null;
    }

    async loadFile(file: File) {
        if (!file) return;
        await this.handleProcess(
            async () => {
                this.fileName = file.name.replace(/\.pdf$/i, '') || 'document';
                const buffer = await file.arrayBuffer();
                this.pdfBytes = new Uint8Array(buffer);
                const pdfjs = await this.getPdfJs();
                this.pdfJsDoc = await pdfjs.getDocument(new Uint8Array(buffer.slice(0))).promise;
                this.pageCount = this.pdfJsDoc.numPages;
                this.placement = { ...this.placement, page: 0 };
            },
            { loading: 'Loading PDF…', success: 'PDF loaded.', error: 'Failed to load PDF.' }
        );
    }

    async renderPreview(canvas: HTMLCanvasElement, pageIndex: number, targetWidth = 600) {
        if (!this.pdfJsDoc) return;
        await this.renderPageToCanvas(canvas, this.pdfJsDoc, pageIndex, targetWidth);
    }

    setSignature(dataUrl: string) {
        this.signature = dataUrl;
        const img = new Image();
        img.onload = () => {
            if (img.width > 0) this.signatureAspect = img.height / img.width;
        };
        img.src = dataUrl;
    }

    clearSignature() {
        this.signature = null;
    }

    setPage(page: number) {
        this.placement = { ...this.placement, page: Math.max(0, Math.min(page, this.pageCount - 1)) };
    }

    async apply() {
        if (!this.pdfBytes || !this.signature) return;
        await this.handleProcess(
            async () => {
                const doc = await PDFDocument.load(this.pdfBytes!, { ignoreEncryption: true });
                const page = doc.getPage(this.placement.page);
                const { width: pw, height: ph } = page.getSize();

                const pngBytes = await (await fetch(this.signature!)).arrayBuffer();
                const png = await doc.embedPng(pngBytes);

                const w = this.placement.w * pw;
                const h = w * this.signatureAspect;
                const x = this.placement.x * pw;
                // placement.y is the TOP of the signature as a ratio from the top;
                // pdf-lib origin is bottom-left, so flip.
                const y = ph - this.placement.y * ph - h;

                page.drawImage(png, { x, y, width: w, height: h });

                const out = await doc.save();
                const blob = new Blob([out as BlobPart], { type: 'application/pdf' });
                this.downloadBlob(blob, `${this.fileName}_signed.pdf`);
            },
            {
                loading: 'Applying signature…',
                success: 'Signed PDF ready.',
                error: 'Failed to apply signature.'
            }
        );
    }

    reset() {
        this.pdfBytes = null;
        this.pdfJsDoc = null;
        this.pageCount = 0;
        this.signature = null;
        this.fileName = 'document';
        this.placement = { page: 0, x: 0.62, y: 0.82, w: 0.3 };
    }

    notifyUnsupported() {
        toast.error('Could not read that image.');
    }
}
