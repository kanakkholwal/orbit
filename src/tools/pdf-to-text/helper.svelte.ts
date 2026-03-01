import { BaseEngine } from '$lib/base-engine.svelte';
import { loadPyMuPDF } from '$utils/pymupdf-loader';
import { toast } from 'svelte-sonner';

export class PdfToTextState extends BaseEngine{
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

// Processing

    async process() {
        if (this.files.length === 0) return;
        
        this.isProcessing = true;
        this.progress.text = 'Loading text extraction engine...';

        try {
            const pymupdf = await loadPyMuPDF();

            if (this.files.length === 1) {
                // Single file extraction
                const fileObj = this.files[0];
                this.progress.text = `Extracting text from ${fileObj.file.name}...`;

                const fullText = await pymupdf.pdfToText(fileObj.file);

                const baseName = fileObj.file.name.replace(/\.pdf$/i, '');
                const textBlob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
                
                this.downloadBlob(textBlob, `${baseName}.txt`);
                
            } else {
                // Multi-file extraction -> ZIP
                this.progress.text = 'Loading ZIP creator...';
                const JSZip = (await import('jszip')).default;
                const zip = new JSZip();

                for (let i = 0; i < this.files.length; i++) {
                    const fileObj = this.files[i];
                    this.progress.text = `Extracting text ${i + 1}/${this.files.length}: ${fileObj.file.name}...`;

                    const fullText = await pymupdf.pdfToText(fileObj.file);
                    const baseName = fileObj.file.name.replace(/\.pdf$/i, '');
                    
                    zip.file(`${baseName}.txt`, fullText);
                }

                this.progress.text = 'Creating ZIP archive...';
                const zipBlob = await zip.generateAsync({ type: 'blob' });

                this.downloadBlob(zipBlob, 'pdf-to-text.zip');
            }

        } catch (e: any) {
            console.error('[PDF to Text] Error:', e);
            toast.error(`An error occurred during extraction: ${e.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

  
}