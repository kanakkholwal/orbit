import { PdfEngine } from '$lib/pdf-engine.svelte';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { toast } from 'svelte-sonner';
import { type BlankSize, type InsertPosition, insertBlankPages, type PlanItem, planInsertion } from './plan';

export class InsertBlankPagesState extends PdfEngine {
    file = $state.raw<File | null>(null);
    pageCount = $state(0);
    position = $state<InsertPosition>('end');
    count = $state(1);
    every = $state(1);
    afterText = $state('');
    size = $state<BlankSize>('match');
    result = $state.raw<{ blob: Blob; name: string; pages: number } | null>(null);

    private pdf: PDFDocumentProxy | null = null;

    get afterPages(): number[] {
        return this.parsePageRange(this.afterText, this.pageCount);
    }

    get plan(): PlanItem[] {
        return planInsertion(this.pageCount, {
            position: this.position,
            count: this.count,
            every: this.every,
            after: this.afterPages
        });
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    async loadFile(files: File[]) {
        const file = files[0];
        if (!file) return;
        try {
            const pdfjs = await this.getPdfJs();
            const doc = await pdfjs.getDocument(new Uint8Array(await file.arrayBuffer())).promise;
            await this.pdf?.destroy();
            this.pdf = doc;
            this.file = file;
            this.pageCount = doc.numPages;
            this.result = null;
        } catch (e) {
            console.error(e);
            toast.error('This PDF could not be opened. It may be damaged or password protected.');
        }
    }

    async renderThumbnail(canvas: HTMLCanvasElement, pageIndex: number) {
        if (this.pdf) await this.renderPageToCanvas(canvas, this.pdf, pageIndex, 96);
    }

    async process() {
        if (!this.file || this.isProcessing) return;
        const plan = this.plan;
        this.isProcessing = true;
        this.result = null;
        try {
            const bytes = await insertBlankPages(await this.file.arrayBuffer(), plan, this.size);
            const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
            const name = `${this.file.name.replace(/\.pdf$/i, '')}_with_blank_pages.pdf`;
            this.result = { blob, name, pages: plan.length };
            this.downloadBlob(blob, name);
        } catch (e) {
            console.error(e);
            const locked = e instanceof Error && /encrypt/i.test(e.message);
            toast.error(
                locked
                    ? 'This PDF is protected. Remove its password with Decrypt PDF first.'
                    : 'Could not add the blank pages to this PDF.'
            );
        } finally {
            this.isProcessing = false;
        }
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    reset() {
        void this.pdf?.destroy();
        this.pdf = null;
        this.file = null;
        this.pageCount = 0;
        this.afterText = '';
        this.result = null;
    }
}
