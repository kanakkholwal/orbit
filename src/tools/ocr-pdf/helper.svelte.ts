import { BaseEngine } from '$lib/base-engine.svelte';
import { performOcr } from '$utils/ocr';
import { toast } from 'svelte-sonner';

export const whitelistPresets: Record<string, string> = {
    none: '',
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?-\'"',
    'numbers-currency': '0123456789$€£¥.,- ',
    'letters-only': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ',
    'numbers-only': '0123456789',
    invoice: '0123456789$.,/-#: ',
    forms: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,()-_/@#:',
};

export class OcrPdfState  extends BaseEngine{
    file = $state<{ file: File; originalSize: number } | null>(null);
    
    // Settings
    selectedLangs = $state<string[]>(['eng']); // Default to English
    resolution = $state('3.0');
    binarize = $state(false);
    whitelistPreset = $state('none');
    customWhitelist = $state('');

    // Processing State
    progressStatus = $state('');
    progressPercent = $state(0);
    progressLog = $state<string[]>([]);
    
    // Results
    extractedText = $state('');
    searchablePdfBytes = $state<Uint8Array | null>(null);

    //  Actions 

    loadFile(files: File[]) {
        const validFile = files.find(
            f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );

        if (!validFile) {
            toast.error('Please upload a valid PDF file.');
            return;
        }

        this.file = { file: validFile, originalSize: validFile.size };
        this.resetResults();
    }

    reset() {
        this.file = null;
        this.resetResults();
    }

    private resetResults() {
        this.isProcessing = false;
        this.progressStatus = '';
        this.progressPercent = 0;
        this.progressLog = [];
        this.extractedText = '';
        this.searchablePdfBytes = null;
    }

    toggleLanguage(code: string) {
        if (this.selectedLangs.includes(code)) {
            this.selectedLangs = this.selectedLangs.filter(l => l !== code);
        } else {
            this.selectedLangs = [...this.selectedLangs, code];
        }
    }

    handlePresetChange(presetKey: string) {
        this.whitelistPreset = presetKey;
        if (presetKey === 'custom' || presetKey === 'none') {
            this.customWhitelist = '';
        } else {
            this.customWhitelist = whitelistPresets[presetKey] || '';
        }
    }

    //  Processing 

    async process() {
        if (!this.file) return;
        if (this.selectedLangs.length === 0) {
            toast.error('Please select at least one language for OCR.');
            return;
        }

        this.resetResults();
        this.isProcessing = true;
        this.progressStatus = 'Initializing engine...';
        
        try {
            const arrayBuffer = await this.file.file.arrayBuffer();
            const langString = this.selectedLangs.join('+');

            const result = await performOcr(new Uint8Array(arrayBuffer), {
                language: langString,
                resolution: parseFloat(this.resolution),
                binarize: this.binarize,
                whitelist: this.customWhitelist,
                onProgress: (status: string, progress: number) => {
                    this.progressStatus = status;
                    this.progressPercent = Math.min(100, progress * 100);
                    // Keep log bounded to last 50 lines to prevent memory issues
                    this.progressLog = [...this.progressLog, `Status: ${status}`].slice(-50); 
                },
            });

            this.searchablePdfBytes = result.pdfBytes;
            this.extractedText = result.fullText.trim();

        } catch (e: any) {
            console.error('[OCR Error]', e);
            toast.error(`An error occurred during OCR: ${e.message || 'Worker may have failed to load.'}`);
        } finally {
            this.isProcessing = false;
        }
    }

    //Export 

    copyText() {
        navigator.clipboard.writeText(this.extractedText);
    }

    downloadTxt() {
        if (!this.extractedText) return;
        const blob = new Blob([this.extractedText], { type: 'text/plain' });
        this.downloadBlob(blob, 'ocr-text.txt');
    }

    downloadPdf() {
        if (!this.searchablePdfBytes) return;
        const blob = new Blob([this.searchablePdfBytes as BlobPart], { type: 'application/pdf' });
        const originalName = this.file?.file.name.replace('.pdf', '') || 'document';
        this.downloadBlob(blob, `${originalName}_searchable.pdf`);
    }


}