import { arrayMove } from '$lib/actions/sortable-list';
import { PdfEngine } from '$lib/pdf-engine.svelte';
import { nanoid } from 'nanoid';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'svelte-sonner';
import { buildMix, mixOrder, sourceLetter, type MixSlot, type RunOutMode } from './mix';

export interface MixFile {
    id: string;
    file: File;
    size: number;
    pageCount: number;
    reversed: boolean;
    perTurn: number;
    doc: PDFDocument;
}

export class AlternateMixState extends PdfEngine {
    files = $state<MixFile[]>([]);
    runOut = $state<RunOutMode>('append');
    outputName = $state('mixed.pdf');
    result = $state.raw<{ blob: Blob; name: string; pages: number } | null>(null);

    get order(): MixSlot[] {
        return mixOrder(this.files, this.runOut);
    }

    get totalPages() {
        return this.files.reduce((sum, f) => sum + f.pageCount, 0);
    }

    get totalSize() {
        return this.files.reduce((sum, f) => sum + f.size, 0);
    }

    get canRun() {
        return !this.isProcessing && this.files.length >= 2 && this.order.length > 0;
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    label(slot: MixSlot) {
        return `${sourceLetter(slot.source)}${slot.page + 1}`;
    }

    async addFiles(picked: File[]) {
        this.result = null;
        this.isProcessing = true;
        this.progress = { current: 0, total: picked.length, text: 'Reading files' };
        try {
            for (const file of picked) {
                try {
                    const doc = await PDFDocument.load(await file.arrayBuffer());
                    this.files.push({ id: nanoid(), file, size: file.size, pageCount: doc.getPageCount(), reversed: false, perTurn: 1, doc });
                } catch (e) {
                    console.error(e);
                    toast.error(`${file.name} could not be opened. It may be damaged or password protected.`);
                }
                this.progress.current++;
            }
        } finally {
            this.isProcessing = false;
        }
    }

    removeFile(id: string) {
        this.files = this.files.filter((f) => f.id !== id);
        this.result = null;
    }

    moveFile(from: number, to: number) {
        if (to < 0 || to >= this.files.length) return;
        this.files = arrayMove(this.files, from, to);
        this.result = null;
    }

    /** Front sides in the first file, back sides scanned last to first in the second. */
    collateDuplex() {
        this.files.forEach((f, i) => {
            f.reversed = i === 1;
            f.perTurn = 1;
        });
        this.runOut = 'append';
        this.result = null;
    }

    async process() {
        if (!this.canRun) return;
        this.isProcessing = true;
        this.progress = { current: 0, total: 0, text: 'Mixing pages' };
        try {
            const out = await buildMix(this.files.map((f) => f.doc), this.order);
            const bytes = await out.save();
            const name = `${this.outputName.trim().replace(/\.pdf$/i, '') || 'mixed'}.pdf`;
            const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
            this.result = { blob, name, pages: out.getPageCount() };
            this.downloadBlob(blob, name);
        } catch (e) {
            console.error(e);
            toast.error('The pages could not be mixed.');
        } finally {
            this.isProcessing = false;
        }
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    reset() {
        this.files = [];
        this.runOut = 'append';
        this.result = null;
    }
}
