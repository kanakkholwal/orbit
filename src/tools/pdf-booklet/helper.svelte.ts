import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'svelte-sonner';
import { bookletSheets, makeBooklet, type Binding, type BlankPlacement, type Sheet, type SheetSize } from './booklet';

export class BookletState extends PdfEngine {
    file = $state.raw<File | null>(null);
    pageCount = $state(0);
    sheetSize = $state<SheetSize>('a4');
    binding = $state<Binding>('left');
    blanks = $state<BlankPlacement>('end');
    result = $state.raw<{ blob: Blob; name: string; sheets: number } | null>(null);

    private src: PDFDocument | null = null;

    get sheets(): Sheet[] {
        return this.pageCount > 0 ? bookletSheets(this.pageCount, { binding: this.binding, blanks: this.blanks }) : [];
    }

    get blankCount() {
        return this.sheets.length * 4 - this.pageCount;
    }

    get canRun() {
        return !this.isProcessing && !!this.src && this.pageCount > 0;
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    async loadFile(files: File[]) {
        const file = files[0];
        if (!file) return;
        this.isProcessing = true;
        try {
            this.src = await PDFDocument.load(await file.arrayBuffer());
            this.file = file;
            this.pageCount = this.src.getPageCount();
            this.result = null;
        } catch (e) {
            console.error(e);
            toast.error('This PDF could not be opened. It may be damaged or password protected.');
        } finally {
            this.isProcessing = false;
        }
    }

    async process() {
        if (!this.canRun || !this.src || !this.file) return;
        this.isProcessing = true;
        this.progress = { current: 0, total: 0, text: 'Laying out sheets' };
        try {
            const { doc, sheets } = await makeBooklet(this.src, {
                binding: this.binding,
                blanks: this.blanks,
                sheetSize: this.sheetSize
            });
            const bytes = await doc.save();
            const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
            const name = `${this.file.name.replace(/\.pdf$/i, '')}_booklet.pdf`;
            this.result = { blob, name, sheets: sheets.length };
            this.downloadBlob(blob, name);
        } catch (e) {
            console.error(e);
            toast.error('The booklet could not be made.');
        } finally {
            this.isProcessing = false;
        }
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    reset() {
        this.src = null;
        this.file = null;
        this.pageCount = 0;
        this.result = null;
    }
}
