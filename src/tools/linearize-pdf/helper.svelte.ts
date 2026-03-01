import { BaseEngine } from '$lib/base-engine.svelte';
import { initializeQpdf } from '$utils/helper';
import { toast } from 'svelte-sonner';

export class LinearizePdfState extends BaseEngine {
    files = $state<{ id: string; file: File; originalSize: number }[]>([]);
  

    addFiles(newFiles: File[]) {
        const validFiles = newFiles.filter(
            f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );

        if (validFiles.length < newFiles.length) {
            toast.error('Some files were skipped. Only PDF files are allowed.');
        }

        for (const f of validFiles) {
            this.files.push({ id: crypto.randomUUID(), file: f, originalSize: f.size });
        }
    }

    removeFile(id: string) {
        this.files = this.files.filter(f => f.id !== id);
    }

    reset() {
        this.files = [];
        this.isProcessing = false;
        this.progress.text = '';
    }


    async process() {
        if (this.files.length === 0) return;
        
        this.isProcessing = true;
        this.progress.text = 'Loading optimization engine...';

        let qpdf: any;
        let zip: any;
        let successCount = 0;
        let errorCount = 0;

        try {
            qpdf = await initializeQpdf();

            if (this.files.length > 1) {
                const JSZip = (await import('jszip')).default;
                zip = new JSZip();
            }

            for (let i = 0; i < this.files.length; i++) {
                const fileObj = this.files[i];
                const inputPath = `/input_${i}.pdf`;
                const outputPath = `/output_${i}.pdf`;

                if (this.files.length > 1) {
                    this.progress.text = `Optimizing ${fileObj.file.name} (${i + 1}/${this.files.length})...`;
                } else {
                    this.progress.text = `Optimizing ${fileObj.file.name}...`;
                }

                try {
                    const arrayBuffer = await fileObj.file.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);

                    // Write to QPDF Virtual File System
                    qpdf.FS.writeFile(inputPath, uint8Array);

                    // Execute QPDF linearization command
                    qpdf.callMain([inputPath, '--linearize', outputPath]);

                    // Read output
                    const outputFile = qpdf.FS.readFile(outputPath, { encoding: 'binary' });
                    
                    if (!outputFile || outputFile.length === 0) {
                        throw new Error('Linearization resulted in an empty file.');
                    }

                    const originalName = fileObj.file.name.replace(/\.pdf$/i, '');
                    const newFileName = `${originalName}_fast_web.pdf`;

                    if (this.files.length === 1) {
                        // Single file -> Download directly
                        const blob = new Blob([outputFile], { type: 'application/pdf' });
                        this.downloadBlob(blob, newFileName);
                    } else {
                        // Multiple files -> Add to ZIP
                        zip.file(newFileName, outputFile, { binary: true });
                    }

                    successCount++;
                } catch (err) {
                    console.error(`Failed to linearize ${fileObj.file.name}:`, err);
                    errorCount++;
                } finally {
                    // Clean up virtual file system to prevent memory leaks
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

            if (successCount === 0) {
                throw new Error('No PDF files could be linearized.');
            }

            if (this.files.length > 1) {
                this.progress.text = 'Generating ZIP archive...';
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                this.downloadBlob(zipBlob, 'optimized_pdfs.zip');
            }

            if (errorCount > 0) {
                toast.error(`Partial success: ${successCount} optimized, ${errorCount} failed.`);
            }

        } catch (e: any) {
            console.error('[Linearize PDF] Error:', e);
            toast.error(`An error occurred during optimization: ${e.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

  
}