import { PdfEngine } from '$lib/pdf-engine.svelte';
import { loadPyMuPDF } from '$utils/pymupdf-loader';
import { toast } from 'svelte-sonner';

export interface AiFile {
    id: string;
    file: File;
    originalSize: number;
    status: 'pending' | 'processing' | 'done' | 'error';
    json?: string;
    sections?: number;
    error?: string;
}

const jsonName = (file: File) => `${file.name.replace(/\.pdf$/i, '')}_llm.json`;

export class PdfForAiState extends PdfEngine {
    files = $state<AiFile[]>([]);

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
        return this.files.filter(f => f.status === 'done' && f.json !== undefined);
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
                this.progress = { current: i + 1, total: queue.length, text: `Preparing ${entry.file.name}` };

                try {
                    // pdfToLlamaIndex is a custom extension added in pymupdf-loader.
                    const llamaDocs = await (pymupdf as any).pdfToLlamaIndex(entry.file);
                    entry.json = JSON.stringify(llamaDocs, null, 2);
                    entry.sections = Array.isArray(llamaDocs) ? llamaDocs.length : undefined;
                    entry.status = 'done';
                } catch (e) {
                    console.error(`Failed to extract ${entry.file.name}:`, e);
                    entry.status = 'error';
                    entry.error = 'Could not read this file';
                }
            }

            await this.downloadResults(queue.filter(f => f.status === 'done'));
        } catch (e: any) {
            console.error('[Prepare PDF for AI] Error:', e);
            toast.error(`An error occurred during extraction: ${e.message}`);
            for (const entry of queue) if (entry.status === 'processing') entry.status = 'pending';
        } finally {
            this.isProcessing = false;
        }
    }

    downloadOne(id: string) {
        const entry = this.doneFiles.find(f => f.id === id);
        if (entry) this.downloadBlob(new Blob([entry.json!], { type: 'application/json' }), jsonName(entry.file));
    }

    async downloadResults(entries: AiFile[] = this.doneFiles) {
        const done = entries.filter(f => f.json !== undefined);
        if (done.length === 0) return;

        if (done.length === 1) {
            this.downloadOne(done[0].id);
            return;
        }

        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        for (const f of done) zip.file(jsonName(f.file), f.json!);
        this.downloadBlob(await zip.generateAsync({ type: 'blob' }), 'pdf-for-ai.zip');
    }
}
