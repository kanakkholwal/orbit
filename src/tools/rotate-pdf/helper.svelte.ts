import { LockedPdf } from '$lib/pdf/locked-pdf.svelte';
import { isPdfPasswordException, removeOwnerLock } from '$lib/pdf/unlock';
import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument, degrees } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { toast } from 'svelte-sonner';

export interface RotatePageData {
    pageIndex: number;
    rotation: number;
}

export interface RotatePdfStateData {
    file: File | null;
    pageCount: number;
    pages: RotatePageData[];
}

export const normalizeTurn = (deg: number) => ((deg % 360) + 360) % 360;

export class RotatePdfState extends PdfEngine {
    state = $state<RotatePdfStateData>({
        file: null,
        pageCount: 0,
        pages: []
    });

    result = $state.raw<{ blob: Blob; name: string; turned: number } | null>(null);

    readonly locked = new LockedPdf();

    private pdfJsDoc: PDFDocumentProxy | null = null;

    get turnedCount() {
        return this.state.pages.filter(p => normalizeTurn(p.rotation) !== 0).length;
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    async loadFile(file: File) {
        if (!file) return;
        this.isProcessing = true;
        this.result = null;

        try {
            const original = new Uint8Array(await file.arrayBuffer());
            const bytes = await removeOwnerLock(original);
            const pdfjs = await this.getPdfJs();

            const loadingTask = pdfjs.getDocument(bytes.slice());
            this.pdfJsDoc = await loadingTask.promise;

            this.locked.clear();
            this.state.file = bytes === original ? file : new File([bytes as BlobPart], file.name, { type: 'application/pdf' });
            this.state.pageCount = this.pdfJsDoc.numPages;
            this.state.pages = Array.from({ length: this.pdfJsDoc.numPages }, (_, i) => ({
                pageIndex: i,
                rotation: 0
            }));
        } catch (e) {
            if (isPdfPasswordException(e)) {
                this.locked.hold(file);
            } else {
                console.error(e);
                this.locked.clear();
                toast.error('This PDF could not be opened.');
            }
        } finally {
            this.isProcessing = false;
        }
    }

    async unlock(password: string) {
        const unlocked = await this.locked.unlock(password);
        if (unlocked) await this.loadFile(unlocked);
    }

    reset() {
        this.locked.clear();
        this.state.file = null;
        this.state.pages = [];
        this.state.pageCount = 0;
        this.pdfJsDoc = null;
        this.result = null;
    }

    rotatePage(index: number, delta: number) {
        const page = this.state.pages[index];
        if (page) page.rotation += delta;
        this.result = null;
    }

    rotateAll(delta: number) {
        for (const p of this.state.pages) p.rotation += delta;
        this.result = null;
    }

    resetRotations() {
        for (const p of this.state.pages) p.rotation = 0;
        this.result = null;
    }

    async renderThumbnail(canvas: HTMLCanvasElement, pageIndex: number) {
        if (!this.pdfJsDoc) return;
        await this.renderPageToCanvas(canvas, this.pdfJsDoc, pageIndex);
    }

    async save() {
        if (!this.state.file) return;
        this.isProcessing = true;
        this.progress = { text: 'Saving…', current: 0, total: 0 };

        try {
            const arrayBuffer = await this.state.file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();

            this.state.pages.forEach((p, i) => {
                const page = pages[i];
                const currentRotation = page.getRotation().angle;
                page.setRotation(degrees(normalizeTurn(currentRotation + p.rotation)));
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

            const name = `${this.state.file.name.replace(/\.pdf$/i, '')}_rotated.pdf`;
            this.result = { blob, name, turned: this.turnedCount };
            this.downloadBlob(blob, name);
        } catch (e: any) {
            console.error(e);
            toast.error(`Could not save the PDF: ${e.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }
}
