import { PdfEngine } from '$lib/pdf-engine.svelte';
import { EncryptedPDFError, PDFDocument } from 'pdf-lib';
import { type FlattenOptions, type FlattenReport, flattenDocument } from './flatten';

export type FlattenStatus = 'idle' | 'processing' | 'done' | 'error';

export interface FlattenFile {
    id: string;
    file: File;
    size: number;
    status: FlattenStatus;
    note?: string;
    skippedFor?: string;
    report?: FlattenReport;
    result?: Uint8Array;
}

const outputName = (file: File) => `${file.name.replace(/\.pdf$/i, '')}_flattened.pdf`;

/** Batch state for Flatten PDF: draws fields and comments into the pages with pdf-lib. */
export class FlattenPdfState extends PdfEngine {
    files = $state<FlattenFile[]>([]);
    options = $state<FlattenOptions>({ forms: true, comments: true, removeLeftovers: false });

    get optionsKey(): string {
        const { forms, comments, removeLeftovers } = this.options;
        return `${forms}-${comments}-${removeLeftovers}`;
    }

    get pendingFiles(): FlattenFile[] {
        const key = this.optionsKey;
        return this.files.filter((f) => (f.status === 'idle' && (!f.note || f.skippedFor !== key)) || f.status === 'error');
    }

    get doneFiles(): FlattenFile[] {
        return this.files.filter((f) => f.status === 'done' && f.result);
    }

    get skippedCount(): number {
        const key = this.optionsKey;
        return this.files.filter((f) => f.status === 'idle' && !!f.note && f.skippedFor === key).length;
    }

    get totalSize(): number {
        return this.files.reduce((sum, f) => sum + f.size, 0);
    }

    get totals(): FlattenReport {
        return this.doneFiles.reduce(
            (sum, f) => ({
                fields: sum.fields + (f.report?.fields ?? 0),
                comments: sum.comments + (f.report?.comments ?? 0),
                removed: sum.removed + (f.report?.removed ?? 0),
                kept: sum.kept + (f.report?.kept ?? 0),
            }),
            { fields: 0, comments: 0, removed: 0, kept: 0 }
        );
    }

    get resultFiles(): File[] {
        return this.doneFiles.map((f) => new File([f.result as BlobPart], outputName(f.file), { type: 'application/pdf' }));
    }

    addFiles(incoming: File[]) {
        for (const file of incoming) {
            this.files.push({ id: crypto.randomUUID(), file, size: file.size, status: 'idle' });
        }
    }

    removeFile(id: string) {
        this.files = this.files.filter((f) => f.id !== id);
    }

    async process() {
        const queue = this.pendingFiles;
        if (!queue.length || (!this.options.forms && !this.options.comments)) return;

        this.isProcessing = true;
        const options = { ...this.options };
        const key = this.optionsKey;
        try {
            for (let i = 0; i < queue.length; i++) {
                const entry = queue[i];
                this.progress = { current: i + 1, total: queue.length, text: `Flattening ${entry.file.name}` };
                entry.status = 'processing';
                entry.note = undefined;
                try {
                    const doc = await PDFDocument.load(await entry.file.arrayBuffer(), { updateMetadata: false });
                    const report = flattenDocument(doc, options);
                    if (report.fields + report.comments + report.removed === 0) {
                        entry.status = 'idle';
                        entry.skippedFor = key;
                        entry.note = report.kept > 0 ? 'Nothing had a saved look to flatten' : 'Nothing to flatten';
                        continue;
                    }
                    entry.result = await doc.save({ updateFieldAppearances: false });
                    entry.report = report;
                    entry.status = 'done';
                } catch (e) {
                    console.error('flatten-pdf:', e);
                    entry.status = 'error';
                    entry.note =
                        e instanceof EncryptedPDFError ? 'Locked with a password. Unlock it first.' : 'Could not read this file';
                }
            }
            if (this.doneFiles.length > 0) await this.downloadResults();
        } finally {
            this.isProcessing = false;
        }
    }

    downloadOne(id: string) {
        const entry = this.doneFiles.find((f) => f.id === id);
        if (entry) this.downloadBlob(new Blob([entry.result as BlobPart], { type: 'application/pdf' }), outputName(entry.file));
    }

    async downloadResults() {
        const done = this.doneFiles;
        if (done.length === 0) return;
        if (done.length === 1) {
            this.downloadOne(done[0].id);
            return;
        }
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        for (const f of done) zip.file(outputName(f.file), f.result as Uint8Array);
        this.downloadBlob(await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }), 'flattened_pdfs.zip');
    }

    reset() {
        this.files = [];
        this.isProcessing = false;
        this.progress = { current: 0, total: 0, text: '' };
    }
}
