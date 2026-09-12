import { PdfEngine } from '$lib/pdf-engine.svelte';
import { loadPyMuPDF } from '$utils/pymupdf-loader';
import { toast } from 'svelte-sonner';

export interface DeskewResult {
    totalPages: number;
    correctedPages: number;
    angles: number[];
    corrected: boolean[];
}

export interface DeskewFile {
    id: string;
    file: File;
    originalSize: number;
    status: 'pending' | 'processing' | 'done' | 'error';
    result?: DeskewResult;
    resultBlob?: Blob;
    error?: string;
}

const outputName = (file: File) => file.name.replace(/\.pdf$/i, '_deskewed.pdf');

export class DeskewPdfState extends PdfEngine {
    files = $state<DeskewFile[]>([]);

    threshold = $state('0.5');
    dpi = $state('150');

    addFiles(newFiles: File[]) {
        const validFiles = newFiles.filter(
            f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );

        if (validFiles.length < newFiles.length) {
            toast.error('Some files were skipped. Only PDF files are allowed.');
        }

        for (const f of validFiles) {
            this.files.push({ id: crypto.randomUUID(), file: f, originalSize: f.size, status: 'pending' });
        }
    }

    removeFile(id: string) {
        this.files = this.files.filter(f => f.id !== id);
    }

    reset() {
        this.files = [];
        this.isProcessing = false;
        this.progress = { current: 0, total: 0, text: '' };
    }

    get doneFiles() {
        return this.files.filter(f => f.status === 'done' && f.resultBlob);
    }

    get totalSize() {
        return this.files.reduce((sum, f) => sum + f.originalSize, 0);
    }

    get resultFiles(): File[] {
        return this.doneFiles.map(f => new File([f.resultBlob!], outputName(f.file), { type: 'application/pdf' }));
    }

    async process() {
        const queue = this.files.filter(f => f.status === 'pending');
        if (queue.length === 0) return;

        this.isProcessing = true;
        this.progress = { current: 0, total: queue.length, text: 'Getting ready' };

        try {
            const pymupdf = await loadPyMuPDF();
            const threshold = parseFloat(this.threshold);
            const dpi = parseInt(this.dpi, 10);

            for (let i = 0; i < queue.length; i++) {
                const entry = queue[i];
                entry.status = 'processing';
                this.progress = { current: i + 1, total: queue.length, text: `Straightening ${entry.file.name}` };

                try {
                    const { pdf, result } = await (pymupdf as any).deskewPdf(entry.file, { threshold, dpi });
                    entry.resultBlob = pdf;
                    entry.result = result;
                    entry.status = 'done';
                } catch (e: any) {
                    console.error('[Deskew PDF] Error:', e);
                    entry.status = 'error';
                    entry.error = 'Could not straighten this file';
                }
            }

            await this.downloadResults(queue.filter(f => f.status === 'done'));
        } catch (e: any) {
            console.error('[Deskew PDF] Error:', e);
            toast.error('An error occurred during deskewing.');
            for (const entry of queue) if (entry.status === 'processing') entry.status = 'pending';
        } finally {
            this.isProcessing = false;
        }
    }

    downloadOne(id: string) {
        const entry = this.doneFiles.find(f => f.id === id);
        if (entry) this.downloadBlob(entry.resultBlob!, outputName(entry.file));
    }

    async downloadResults(entries: DeskewFile[] = this.doneFiles) {
        const done = entries.filter(f => f.resultBlob);
        if (done.length === 0) return;

        if (done.length === 1) {
            this.downloadOne(done[0].id);
            return;
        }

        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        for (const f of done) zip.file(outputName(f.file), await f.resultBlob!.arrayBuffer());
        this.downloadBlob(await zip.generateAsync({ type: 'blob' }), 'deskewed_pdfs.zip');
    }
}
