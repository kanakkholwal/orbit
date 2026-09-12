import { PdfEngine } from '$lib/pdf-engine.svelte';
import { toast } from 'svelte-sonner';

export interface WordFile {
    id: string;
    file: File;
    originalSize: number;
    status: 'pending' | 'processing' | 'done' | 'error';
    resultBlob?: Blob;
    error?: string;
}

const docxName = (file: File) => `${file.name.replace(/\.pdf$/i, '')}.docx`;

export class PdfToWordState extends PdfEngine {
    files = $state<WordFile[]>([]);

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

    async process() {
        const queue = this.files.filter(f => f.status === 'pending');
        if (queue.length === 0) return;

        this.isProcessing = true;
        this.progress = { current: 0, total: queue.length, text: 'Getting ready' };

        try {
            const { loadPyMuPDF } = await import('$utils/pymupdf-loader');
            const pymupdf: any = await loadPyMuPDF();

            for (let i = 0; i < queue.length; i++) {
                const entry = queue[i];
                entry.status = 'processing';
                this.progress = { current: i + 1, total: queue.length, text: `Converting ${entry.file.name}` };

                try {
                    entry.resultBlob = await pymupdf.pdfToDocx(entry.file);
                    entry.status = 'done';
                } catch (e: any) {
                    console.error('[PDF to Word] Error:', e);
                    entry.status = 'error';
                    entry.error = 'Could not convert this file';
                }
            }

            await this.downloadResults(queue.filter(f => f.status === 'done'));
        } catch (e: any) {
            console.error('[PDF to Word] Error:', e);
            toast.error(`An error occurred during conversion: ${e.message}`);
            for (const entry of queue) if (entry.status === 'processing') entry.status = 'pending';
        } finally {
            this.isProcessing = false;
        }
    }

    downloadOne(id: string) {
        const entry = this.doneFiles.find(f => f.id === id);
        if (entry) this.downloadBlob(entry.resultBlob!, docxName(entry.file));
    }

    async downloadResults(entries: WordFile[] = this.doneFiles) {
        const done = entries.filter(f => f.resultBlob);
        if (done.length === 0) return;

        if (done.length === 1) {
            this.downloadOne(done[0].id);
            return;
        }

        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        for (const f of done) zip.file(docxName(f.file), await f.resultBlob!.arrayBuffer());
        this.downloadBlob(await zip.generateAsync({ type: 'blob' }), 'converted-documents.zip');
    }
}
