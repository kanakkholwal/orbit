import { BaseEngine } from '$lib/base-engine.svelte';
import { loadPyMuPDF } from '$utils/pymupdf-loader';
import { toast } from 'svelte-sonner';

export class PdfForAiState extends BaseEngine {
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

    //  Processing 

    async process() {
        if (this.files.length === 0) return;
        
        this.isProcessing = true;
        this.progress.text = 'Loading AI extraction engine...';

        try {
            const pymupdf = await loadPyMuPDF();
            const total = this.files.length;
            let completed = 0;
            let failed = 0;

            if (total === 1) {
                // Single file extraction
                const fileObj = this.files[0];
                this.progress.text = `Extracting ${fileObj.file.name}...`;

                // Cast to any to access the custom extension method added in pymupdf-loader
                const llamaDocs = await (pymupdf as any).pdfToLlamaIndex(fileObj.file);
                const outName = fileObj.file.name.replace(/\.pdf$/i, '') + '_llm.json';
                const jsonContent = JSON.stringify(llamaDocs, null, 2);

                const blob = new Blob([jsonContent], { type: 'application/json' });
                this.downloadBlob(blob, outName);
                completed++;
                
            } else {
                // Multi-file extraction -> ZIP
                this.progress.text = 'Loading ZIP creator...';
                const JSZip = (await import('jszip')).default;
                const zip = new JSZip();

                for (const fileObj of this.files) {
                    try {
                        this.progress.text = `Extracting (${completed + 1}/${total}): ${fileObj.file.name}...`;
                        
                        const llamaDocs = await (pymupdf as any).pdfToLlamaIndex(fileObj.file);
                        const outName = fileObj.file.name.replace(/\.pdf$/i, '') + '_llm.json';
                        const jsonContent = JSON.stringify(llamaDocs, null, 2);
                        
                        zip.file(outName, jsonContent);
                        completed++;
                    } catch (e) {
                        console.error(`Failed to extract ${fileObj.file.name}:`, e);
                        failed++;
                    }
                }

                this.progress.text = 'Creating ZIP archive...';
                const zipBlob = await zip.generateAsync({ type: 'blob' });

                this.downloadBlob(zipBlob, 'pdf-for-ai.zip');
            }

            if (failed > 0) {
                toast.error(`Extraction partial: Extracted ${completed} PDF(s), failed ${failed}.`);
            }

        } catch (e: any) {
            console.error('[Prepare PDF for AI] Error:', e);
            toast.error(`An error occurred during extraction: ${e.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

}