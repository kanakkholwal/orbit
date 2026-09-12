import { PdfEngine } from '$lib/pdf-engine.svelte';
import { nanoid } from 'nanoid';
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber } from 'pdf-lib';

export type StripStatus = 'idle' | 'processing' | 'done' | 'error';

export interface StripFile {
    id: string;
    file: File;
    name: string; // output name, e.g. "stripped-<original>"
    size: number;
    originalPages?: number;
    keptPages?: number;
    status: StripStatus;
    note?: string;
    result?: Uint8Array;
}

/**
 * "Strip PDF": keeps only the LAST page of each PDF page-label range (plus the
 * document's final page) and removes everything else.
 *
 * Page labels live in the catalog's /PageLabels number tree (a /Nums array of
 * [startIndex, labelDict, startIndex, labelDict, …]). Each startIndex marks the
 * first page of a label range, so `startIndex - 1` is the last page of the
 * previous range: those are the pages we keep. Ported from the original Vue
 * "PDF Stripper". Reference: PDF spec §8.3.1 (Page Labels).
 */
async function stripPdf(
    bytes: ArrayBuffer
): Promise<{ doc: PDFDocument; kept: number; original: number } | null> {
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const original = pdf.getPageCount();

    // lookupMaybe (not lookup): returns undefined when the key is absent or the
    // wrong type, instead of throwing. Most PDFs have no /PageLabels at all.
    const pageLabels = pdf.catalog.lookupMaybe(PDFName.of('PageLabels'), PDFDict);
    if (!pageLabels) return null;

    const nums = pageLabels.lookupMaybe(PDFName.of('Nums'), PDFArray);
    if (!nums) return null;

    const entries = nums.asArray();
    const pagesToKeep = new Set<number>();
    // Start at 1 so the very first range start (page 0) isn't treated as a
    // "previous range end". Every other numeric entry is a range start → the
    // page before it (start - 1) is a page we keep.
    for (let i = 1; i < entries.length; i++) {
        const element = entries[i];
        if (element instanceof PDFNumber) {
            pagesToKeep.add(element.asNumber() - 1);
        }
    }

    let deletedAnyPage = false;
    // original - 2: always keep the final page (never a "previous range end",
    // not in the set), and walk backwards so indices stay valid as we remove.
    for (let i = original - 2; i >= 0; i--) {
        if (!pagesToKeep.has(i)) {
            pdf.removePage(i);
            deletedAnyPage = true;
        }
    }
    if (!deletedAnyPage) return null;

    return { doc: pdf, kept: pdf.getPageCount(), original };
}

const isSkipped = (f: StripFile) => f.status === 'idle' && !!f.note;

export class StripPdfState extends PdfEngine {
    files = $state<StripFile[]>([]);

    get doneFiles(): StripFile[] {
        return this.files.filter((f) => f.status === 'done' && f.result);
    }

    get strippedCount(): number {
        return this.doneFiles.length;
    }

    get skippedCount(): number {
        return this.files.filter(isSkipped).length;
    }

    get pendingFiles(): StripFile[] {
        return this.files.filter((f) => (f.status === 'idle' && !f.note) || f.status === 'error');
    }

    get totalSize(): number {
        return this.files.reduce((sum, f) => sum + f.size, 0);
    }

    get resultFiles(): File[] {
        return this.doneFiles.map((f) => new File([f.result as BlobPart], f.name, { type: 'application/pdf' }));
    }

    addFiles(incoming: File[]) {
        if (!incoming.length) return;
        for (const file of incoming) {
            this.files.push({
                id: nanoid(),
                file,
                name: `stripped-${file.name}`,
                size: file.size,
                status: 'idle'
            });
        }
    }

    removeFile(id: string) {
        this.files = this.files.filter((f) => f.id !== id);
    }

    async process() {
        const queue = this.pendingFiles;
        if (!queue.length) return;

        this.isProcessing = true;
        try {
            for (let i = 0; i < queue.length; i++) {
                const entry = queue[i];
                this.progress = { current: i + 1, total: queue.length, text: `Stripping ${entry.file.name}` };
                entry.status = 'processing';
                entry.note = undefined;
                try {
                    const stripped = await stripPdf(await entry.file.arrayBuffer());
                    if (stripped) {
                        entry.result = await stripped.doc.save();
                        entry.originalPages = stripped.original;
                        entry.keptPages = stripped.kept;
                        entry.status = 'done';
                    } else {
                        entry.status = 'idle';
                        entry.note = 'No page labels, so nothing to remove';
                    }
                } catch (e) {
                    console.error('strip-pdf:', e);
                    entry.status = 'error';
                    entry.note = 'Could not process this file';
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }

    downloadOne(id: string) {
        const entry = this.files.find((f) => f.id === id);
        if (!entry?.result) return;
        const blob = new Blob([entry.result as BlobPart], { type: 'application/pdf' });
        this.downloadBlob(blob, entry.name);
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
        for (const f of done) zip.file(f.name, f.result as Uint8Array);
        const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
        this.downloadBlob(blob, `stripped_${new Date().getTime()}.zip`);
    }

    reset() {
        this.files = [];
        this.isProcessing = false;
        this.progress = { current: 0, total: 0, text: '' };
    }
}
