import { BaseEngine } from '$lib/base-engine.svelte';

export class PdfToWordState extends BaseEngine {
    files = $state<{ id: string; file: File; originalSize: number }[]>([]);
  


    addFiles(newFiles: File[]) {
        const validFiles = newFiles.filter(
            f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );

        if (validFiles.length < newFiles.length) {
            alert('Some files were skipped. Only PDF files are allowed.');
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

    // --- Processing ---

    async process() {
        if (this.files.length === 0) return;
        
        this.isProcessing = true;
        this.progress.text = 'Loading converter engine...';

        try {
              let pymupdf: any = null;

            const { loadPyMuPDF } = await import('$utils/pymupdf-loader');
            pymupdf = await loadPyMuPDF();


            if (this.files.length === 1) {
                // Single file conversion
                const fileObj = this.files[0];
                this.progress.text = `Converting ${fileObj.file.name}...`;

                const docxBlob = await pymupdf.pdfToDocx(fileObj.file);
                const outName = fileObj.file.name.replace(/\.pdf$/i, '') + '.docx';

                this.downloadBlob(docxBlob, outName);
                
                // Keep file in list but stop processing, or auto-clear based on preference
                // this.reset(); 
            } else {
                // Multi-file conversion -> ZIP
                this.progress.text = 'Loading ZIP creator...';
                const JSZip = (await import('jszip')).default;
                const zip = new JSZip();

                for (let i = 0; i < this.files.length; i++) {
                    const fileObj = this.files[i];
                    this.progress.text = `Converting ${i + 1}/${this.files.length}: ${fileObj.file.name}...`;

                    const docxBlob = await pymupdf.pdfToDocx(fileObj.file);
                    const baseName = fileObj.file.name.replace(/\.pdf$/i, '');
                    const arrayBuffer = await docxBlob.arrayBuffer();
                    
                    zip.file(`${baseName}.docx`, arrayBuffer);
                }

                this.progress.text = 'Creating ZIP archive...';
                const zipBlob = await zip.generateAsync({ type: 'blob' });

                this.downloadBlob(zipBlob, 'converted-documents.zip');
            }

        } catch (e: any) {
            console.error('[PDF to Word] Error:', e);
            alert(`An error occurred during conversion: ${e.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

}