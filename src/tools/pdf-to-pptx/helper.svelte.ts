import { releaseCanvas, safeScale, yieldToMain } from '$lib/device-limits';
import { LockedPdf } from '$lib/pdf/locked-pdf.svelte';
import { isPdfPasswordException } from '$lib/pdf/unlock';
import { PdfEngine } from '$lib/pdf-engine.svelte';
import { toast } from 'svelte-sonner';

export type SlideQuality = 'small' | 'balanced' | 'sharp';

const QUALITY: Record<SlideQuality, { scale: number; jpeg: number }> = {
    small: { scale: 1.2, jpeg: 0.7 },
    balanced: { scale: 1.6, jpeg: 0.82 },
    sharp: { scale: 2.2, jpeg: 0.9 },
};

export class PdfToPptxState extends PdfEngine {
    file = $state<File | null>(null);
    pageCount = $state(0);
    quality = $state<SlideQuality>('balanced');
    notes = $state(true);
    isProcessing = $state(false);
    result = $state.raw<{ blob: Blob; name: string; count: number } | null>(null);
    step = $state({ current: 0, total: 0 });
    readonly locked = new LockedPdf();

    async loadFile(file: File) {
        if (!file) return;
        this.isProcessing = true;
        try {
            const pdfjs = await this.getPdfJs();
            const pdf = await pdfjs.getDocument(new Uint8Array(await file.arrayBuffer())).promise;
            this.locked.clear();
            this.file = file;
            this.result = null;
            this.pageCount = pdf.numPages;
            await pdf.destroy();
        } catch (e) {
            if (isPdfPasswordException(e)) this.locked.hold(file);
            else {
                console.error(e);
                this.locked.clear();
                toast.error('Failed to load PDF. It might be corrupted.');
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
        this.file = null;
        this.pageCount = 0;
        this.isProcessing = false;
        this.result = null;
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    async convert() {
        if (!this.file) return;
        this.isProcessing = true;
        this.result = null;
        this.step = { current: 0, total: 0 };
        try {
            const [{ default: PptxGenJS }, pdfjs] = await Promise.all([import('pptxgenjs'), this.getPdfJs()]);
            const pdf = await pdfjs.getDocument(new Uint8Array(await this.file.arrayBuffer())).promise;
            const pres = new PptxGenJS();
            const preset = QUALITY[this.quality];
            const total = pdf.numPages;

            for (let i = 1; i <= total; i++) {
                this.step = { current: i, total };
                const page = await pdf.getPage(i);
                const base = page.getViewport({ scale: 1 });
                if (i === 1) {
                    pres.defineLayout({ name: 'PDF', width: base.width / 72, height: base.height / 72 });
                    pres.layout = 'PDF';
                }

                const viewport = page.getViewport({ scale: safeScale(base.width, base.height, preset.scale) });
                const canvas = document.createElement('canvas');
                canvas.width = Math.floor(viewport.width);
                canvas.height = Math.floor(viewport.height);
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('This browser could not draw the page.');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                await page.render({ canvasContext: ctx, viewport, canvas }).promise;

                const data = canvas.toDataURL('image/jpeg', preset.jpeg);
                releaseCanvas(canvas);

                const slide = pres.addSlide();
                slide.addImage({ data, x: 0, y: 0, w: base.width / 72, h: base.height / 72 });
                if (this.notes) {
                    const content = await page.getTextContent();
                    const text = content.items
                        .map((item) => ('str' in item ? item.str : ''))
                        .join(' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    if (text) slide.addNotes(text);
                }
                page.cleanup();
                await yieldToMain();
            }
            await pdf.destroy();

            const out = (await pres.write({ outputType: 'blob' })) as Blob;
            const name = `${this.file.name.replace(/\.pdf$/i, '')}.pptx`;
            this.result = { blob: out, name, count: total };
            this.downloadBlob(out, name);
        } catch (e) {
            console.error(e);
            toast.error(`Conversion failed: ${e instanceof Error ? e.message : 'unknown error'}`);
        } finally {
            this.isProcessing = false;
        }
    }
}
