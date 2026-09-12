import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'svelte-sonner';
import { computeLayout } from './layout';
import { buildSheets, layoutOptions, type SheetSettings, visibleSize } from './sheets';

const isPdf = (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');

export class PagesPerSheetState extends PdfEngine {
    file = $state.raw<File | null>(null);
    pageCount = $state(0);
    firstPage = $state({ width: 595.28, height: 841.89 });
    settings = $state<SheetSettings>({
        perSheet: 4,
        size: 'original',
        orientation: 'auto',
        marginMm: 8,
        gapMm: 4,
        order: 'across',
        border: false,
    });
    result = $state.raw<{ blob: Blob; name: string; sheets: number; pages: number } | null>(null);

    get layout() {
        return computeLayout(this.firstPage, layoutOptions(this.settings));
    }

    get sheetCount() {
        return Math.ceil(this.pageCount / this.settings.perSheet);
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    async loadFile(files: File[]) {
        const file = files.find(isPdf);
        if (!file) {
            toast.error('Please choose a PDF file.');
            return;
        }
        try {
            const doc = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false });
            const pages = doc.getPages();
            if (pages.length === 0) throw new Error('empty');
            this.firstPage = visibleSize(pages[0]);
            this.pageCount = pages.length;
            this.file = file;
            this.result = null;
        } catch (e) {
            console.error('[Pages per Sheet] Error:', e);
            const encrypted = e instanceof Error && /encrypt/i.test(e.message);
            toast.error(encrypted ? 'This PDF is password protected. Unlock it first.' : 'Could not open this PDF. It may be damaged.');
        }
    }

    reset() {
        this.file = null;
        this.pageCount = 0;
        this.result = null;
        this.isProcessing = false;
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    async process() {
        if (!this.file) return;
        this.isProcessing = true;
        this.result = null;
        this.progress = { current: 0, total: this.sheetCount, text: 'Placing pages' };
        try {
            const built = await buildSheets(await this.file.arrayBuffer(), $state.snapshot(this.settings), (n, total) => {
                this.progress = { current: n, total, text: 'Placing pages' };
            });
            const blob = new Blob([built.bytes as BlobPart], { type: 'application/pdf' });
            const name = `${this.file.name.replace(/\.pdf$/i, '')}_${this.settings.perSheet}-per-sheet.pdf`;
            this.result = { blob, name, sheets: built.sheets, pages: built.pages };
            this.downloadBlob(blob, name);
        } catch (e) {
            console.error('[Pages per Sheet] Error:', e);
            const encrypted = e instanceof Error && /encrypt/i.test(e.message);
            toast.error(encrypted ? 'This PDF is password protected. Unlock it first.' : 'Could not create the sheets for this PDF.');
        } finally {
            this.isProcessing = false;
        }
    }
}
