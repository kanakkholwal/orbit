import { PdfEngine } from '$lib/pdf-engine.svelte';
import { initializeQpdf } from '$utils/helper';
import { type QpdfLike, type RepairOutcome, repairBytes } from './repair';

export type RepairStatus = 'pending' | 'processing' | RepairOutcome;

export interface RepairFile {
    id: string;
    file: File;
    size: number;
    status: RepairStatus;
    pages?: number;
    result?: Uint8Array;
}

const outputName = (file: File) => `${file.name.replace(/\.pdf$/i, '')}_repaired.pdf`;

/** Batch state for Repair PDF: qpdf rewrite first, pdf-lib object-by-object rebuild as fallback. */
export class RepairPdfState extends PdfEngine {
    files = $state<RepairFile[]>([]);

    get pendingFiles(): RepairFile[] {
        return this.files.filter((f) => f.status === 'pending');
    }

    get doneFiles(): RepairFile[] {
        return this.files.filter((f) => (f.status === 'healthy' || f.status === 'repaired') && f.result);
    }

    get repairedFiles(): RepairFile[] {
        return this.doneFiles.filter((f) => f.status === 'repaired');
    }

    count(status: RepairStatus): number {
        return this.files.filter((f) => f.status === status).length;
    }

    get totalSize(): number {
        return this.files.reduce((sum, f) => sum + f.size, 0);
    }

    get resultFiles(): File[] {
        return this.doneFiles.map((f) => new File([f.result as BlobPart], outputName(f.file), { type: 'application/pdf' }));
    }

    addFiles(incoming: File[]) {
        for (const file of incoming) {
            this.files.push({ id: crypto.randomUUID(), file, size: file.size, status: 'pending' });
        }
    }

    removeFile(id: string) {
        this.files = this.files.filter((f) => f.id !== id);
    }

    async process() {
        const queue = this.pendingFiles;
        if (!queue.length) return;

        this.isProcessing = true;
        this.progress = { current: 0, total: queue.length, text: 'Getting ready' };
        try {
            let qpdf: QpdfLike | null = null;
            try {
                qpdf = await initializeQpdf();
            } catch (e) {
                console.warn('repair-pdf: continuing without qpdf', e);
            }

            for (let i = 0; i < queue.length; i++) {
                const entry = queue[i];
                this.progress = { current: i + 1, total: queue.length, text: `Checking ${entry.file.name}` };
                entry.status = 'processing';
                try {
                    const outcome = await repairBytes(new Uint8Array(await entry.file.arrayBuffer()), qpdf);
                    entry.result = outcome.bytes;
                    entry.pages = outcome.pages;
                    entry.status = outcome.outcome;
                } catch (e) {
                    console.error('repair-pdf:', e);
                    entry.status = 'failed';
                }
            }
            const repaired = queue.filter((f) => f.status === 'repaired' && f.result);
            if (repaired.length > 0) await this.downloadResults(repaired);
        } finally {
            this.isProcessing = false;
        }
    }

    downloadOne(id: string) {
        const entry = this.doneFiles.find((f) => f.id === id);
        if (entry) this.downloadBlob(new Blob([entry.result as BlobPart], { type: 'application/pdf' }), outputName(entry.file));
    }

    async downloadResults(done: RepairFile[] = this.doneFiles) {
        if (done.length === 0) return;
        if (done.length === 1) {
            this.downloadOne(done[0].id);
            return;
        }
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        for (const f of done) zip.file(outputName(f.file), f.result as Uint8Array);
        this.downloadBlob(await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }), 'repaired_pdfs.zip');
    }

    reset() {
        this.files = [];
        this.isProcessing = false;
        this.progress = { current: 0, total: 0, text: '' };
    }
}
