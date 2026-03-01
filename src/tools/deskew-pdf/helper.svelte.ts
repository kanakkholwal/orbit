import { BaseEngine } from '$lib/base-engine.svelte';
import { loadPyMuPDF } from '$utils/pymupdf-loader';
import { toast } from 'svelte-sonner';

export interface DeskewResult {
    totalPages: number;
    correctedPages: number;
    angles: number[];
    corrected: boolean[];
}

export class DeskewPdfState extends BaseEngine {
    files = $state<{ id: string; file: File; originalSize: number }[]>([]);
    
    // Settings
    threshold = $state('0.5');
    dpi = $state('150');

    // Results state 
    lastResult = $state<DeskewResult | null>(null);
    lastProcessedFileName = $state('');

    //  Actions 

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
        
        // Hide results if we add new files
        this.lastResult = null;
    }

    removeFile(id: string) {
        this.files = this.files.filter(f => f.id !== id);
        if (this.files.length === 0) {
            this.lastResult = null;
        }
    }

    reset() {
        this.files = [];
        this.lastResult = null;
        this.lastProcessedFileName = '';
    }

// Processing

    async process() {
        if (this.files.length === 0) return;

        await this.handleProcess(async () => {
            const pymupdf = await loadPyMuPDF();

            const thresholdVal = parseFloat(this.threshold);
            const dpiVal = parseInt(this.dpi, 10);

            for (let i = 0; i < this.files.length; i++) {
                const fileObj = this.files[i];
                
                this.progress.text = `Deskewing ${fileObj.file.name}...`;

                // Deskew via PyMuPDF extension
                const { pdf: resultPdf, result } = await (pymupdf as any).deskewPdf(fileObj.file, {
                    threshold: thresholdVal,
                    dpi: dpiVal,
                });

                // Update UI to show results for the *last* processed file
                // If multiple, it updates rapidly, but usually users deskew 1 at a time.
                this.lastResult = result;
                this.lastProcessedFileName = fileObj.file.name;

                const filename = fileObj.file.name.replace(/\.pdf$/i, '_deskewed.pdf');
                this.downloadBlob(resultPdf, filename);
            }
        }, {
            loading: 'Correcting document tilt...',
            success: `Deskewed ${this.files.length} file(s) successfully!`,
            error: 'An error occurred during deskewing.'
        });
    }
}