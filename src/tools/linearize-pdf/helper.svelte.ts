import { PdfEngine } from '$lib/pdf-engine.svelte';
import { initializeQpdf } from '$utils/helper';
import { toast } from 'svelte-sonner';

export interface LinearizeFile {
    id: string;
    file: File;
    originalSize: number;
    status: 'pending' | 'processing' | 'done' | 'error';
    resultBlob?: Blob;
    error?: string;
}

const outputName = (file: File) => `${file.name.replace(/\.pdf$/i, '')}_fast_web.pdf`;

export class LinearizePdfState extends PdfEngine {
    files = $state<LinearizeFile[]>([]);

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

        let qpdf: any;

        try {
            qpdf = await initializeQpdf();

            for (let i = 0; i < queue.length; i++) {
                const entry = queue[i];
                const inputPath = `/input_${i}.pdf`;
                const outputPath = `/output_${i}.pdf`;
                entry.status = 'processing';
                this.progress = { current: i + 1, total: queue.length, text: `Optimizing ${entry.file.name}` };

                try {
                    const uint8Array = new Uint8Array(await entry.file.arrayBuffer());
                    qpdf.FS.writeFile(inputPath, uint8Array);
                    qpdf.callMain([inputPath, '--linearize', outputPath]);

                    const outputFile = qpdf.FS.readFile(outputPath, { encoding: 'binary' });
                    if (!outputFile || outputFile.length === 0) {
                        throw new Error('Linearization resulted in an empty file.');
                    }

                    entry.resultBlob = new Blob([outputFile], { type: 'application/pdf' });
                    entry.status = 'done';
                } catch (err) {
                    console.error(`Failed to linearize ${entry.file.name}:`, err);
                    entry.status = 'error';
                    entry.error = 'Could not optimize this file';
                } finally {
                    // Unlink from the WASM file system so memory is freed between files.
                    try {
                        if (qpdf?.FS) {
                            if (qpdf.FS.analyzePath(inputPath).exists) qpdf.FS.unlink(inputPath);
                            if (qpdf.FS.analyzePath(outputPath).exists) qpdf.FS.unlink(outputPath);
                        }
                    } catch (cleanupError) {
                        console.warn('Failed to cleanup WASM FS:', cleanupError);
                    }
                }
            }

            await this.downloadResults(queue.filter(f => f.status === 'done'));
        } catch (e: any) {
            console.error('[Linearize PDF] Error:', e);
            toast.error(`An error occurred during optimization: ${e.message}`);
            for (const entry of queue) if (entry.status === 'processing') entry.status = 'pending';
        } finally {
            this.isProcessing = false;
        }
    }

    downloadOne(id: string) {
        const entry = this.doneFiles.find(f => f.id === id);
        if (entry) this.downloadBlob(entry.resultBlob!, outputName(entry.file));
    }

    async downloadResults(entries: LinearizeFile[] = this.doneFiles) {
        const done = entries.filter(f => f.resultBlob);
        if (done.length === 0) return;

        if (done.length === 1) {
            this.downloadOne(done[0].id);
            return;
        }

        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        for (const f of done) zip.file(outputName(f.file), await f.resultBlob!.arrayBuffer(), { binary: true });
        this.downloadBlob(await zip.generateAsync({ type: 'blob' }), 'optimized_pdfs.zip');
    }
}
