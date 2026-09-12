import { PdfEngine } from '$lib/pdf-engine.svelte';
import { loadPyMuPDF } from '$utils/pymupdf-loader';
import { toast } from 'svelte-sonner';

export interface TextFile {
    id: string;
    file: File;
    originalSize: number;
    status: 'pending' | 'processing' | 'done' | 'error';
    text?: string;
    error?: string;
}

const textName = (file: File) => `${file.name.replace(/\.pdf$/i, '')}.txt`;

export class PdfToTextState extends PdfEngine {
    files = $state<TextFile[]>([]);

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
        return this.files.filter(f => f.status === 'done' && f.text !== undefined);
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
            const pymupdf = await loadPyMuPDF();

            for (let i = 0; i < queue.length; i++) {
                const entry = queue[i];
                entry.status = 'processing';
                this.progress = { current: i + 1, total: queue.length, text: `Reading ${entry.file.name}` };

                try {
                    entry.text = await pymupdf.pdfToText(entry.file);
                    entry.status = 'done';
                } catch (e: any) {
                    console.error('[PDF to Text] Error:', e);
                    entry.status = 'error';
                    entry.error = 'Could not read this file';
                }
            }

            await this.downloadResults(queue.filter(f => f.status === 'done'));
        } catch (e: any) {
            console.error('[PDF to Text] Error:', e);
            toast.error(`An error occurred during extraction: ${e.message}`);
            for (const entry of queue) if (entry.status === 'processing') entry.status = 'pending';
        } finally {
            this.isProcessing = false;
        }
    }

    downloadOne(id: string) {
        const entry = this.doneFiles.find(f => f.id === id);
        if (!entry) return;
        this.downloadBlob(new Blob([entry.text!], { type: 'text/plain;charset=utf-8' }), textName(entry.file));
    }

    async downloadResults(entries: TextFile[] = this.doneFiles) {
        const done = entries.filter(f => f.text !== undefined);
        if (done.length === 0) return;

        if (done.length === 1) {
            this.downloadOne(done[0].id);
            return;
        }

        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        for (const f of done) zip.file(textName(f.file), f.text!);
        this.downloadBlob(await zip.generateAsync({ type: 'blob' }), 'pdf-to-text.zip');
    }
}
