import { BaseEngine } from '$lib/base-engine.svelte';

export interface ImageFile {
    id: string;
    file: File;
    previewUrl?: string;
}

export type Quality = 'high' | 'medium' | 'low';

// Match original supported list
export const ACCEPTED_FORMATS = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/gif',
    'image/tiff', 'image/webp', 'image/heic', 'image/heif',
    'image/x-icon', 'image/vnd.adobe.photoshop', // PSD
    '.jp2', '.jpx', '.jxr', '.tif', '.tiff', '.psd'
];

export class JpgToPdfState extends BaseEngine {
    files = $state<ImageFile[]>([]);
    quality = $state<Quality>('medium');
    isProcessing = $state(false);
    progress = $state({ current: 0, total: 0, text: '' });

    // --- Actions ---

    addFiles(newFiles: File[]) {
        const entries = newFiles.map(f => ({
            id: crypto.randomUUID(),
            file: f,
            // Only create preview for browser-supported types
            previewUrl: this.isBrowserViewable(f) ? URL.createObjectURL(f) : undefined
        }));

        this.files.push(...entries);
    }

    removeFile(id: string) {
        const index = this.files.findIndex(f => f.id === id);
        if (index !== -1) {
            if (this.files[index].previewUrl) URL.revokeObjectURL(this.files[index].previewUrl!);
            this.files.splice(index, 1);
        }
    }

    reset() {
        this.files.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
        this.files = [];
        this.isProcessing = false;
    }

    // Processing 

    async convert() {
        if (this.files.length === 0) return;
        this.isProcessing = true;
        this.progress = { current: 0, total: this.files.length, text: 'Initializing Engine...' };

        try {
            let pymupdf: any = null;

            const { loadPyMuPDF } = await import('$utils/pymupdf-loader');
            pymupdf = await loadPyMuPDF();

            const processedFiles: File[] = [];

            // 2. Pre-process Loop
            for (let i = 0; i < this.files.length; i++) {
                const imgEntry = this.files[i];
                this.progress = {
                    current: i + 1,
                    total: this.files.length,
                    text: `Processing ${imgEntry.file.name}...`
                };

                // Convert HEIC if necessary
                let readyFile = await this.handleHeic(imgEntry.file);

                // Note: If you want to resize/compress JPGs before PDF creation 
                // (like 'compressImageFile' in your legacy code), add that logic here.

                processedFiles.push(readyFile);
            }

            // 3. Convert using built-in PyMuPDF helper
            this.progress.text = 'Generating PDF...';

            // FIX: Use the method from your legacy code directly
            // This avoids the "mupdf.Document is not a constructor" error
            const pdfBlob = await pymupdf.imagesToPdf(processedFiles);

            this.downloadBlob(pdfBlob, 'converted_images.pdf');

        } catch (e: any) {
            console.error(e);
            alert(`Conversion failed: ${e.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    // --- Helpers ---

    private async handleHeic(file: File): Promise<File> {
        if (file.name.match(/\.(heic|heif)$/i) || file.type === 'image/heic') {
            try {
                // Dynamic import to avoid SSR window error
                const heic2any = (await import('heic2any')).default;

                const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
                const blob = Array.isArray(result) ? result[0] : result;

                return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
            } catch (e) {
                console.error("HEIC conversion failed", e);
            }
        }
        return file;
    }

    private isBrowserViewable(file: File) {
        return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'].includes(file.type);
    }


}