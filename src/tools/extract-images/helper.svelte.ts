import { BaseEngine } from '$lib/base-engine.svelte';
import { toast } from 'svelte-sonner';

export interface ExtractedImage {
    id: string;
    data: Uint8Array;
    name: string;
    ext: string;
    url: string; // Object URL for preview
}

export class ExtractImagesState extends BaseEngine {
    files = $state<{ id: string; file: File; originalSize: number }[]>([]);
    extractedImages = $state<ExtractedImage[]>([]);


    extractionDone = $state(false);


    addFiles(newFiles: File[]) {
        for (const f of newFiles) {
            this.files.push({ id: crypto.randomUUID(), file: f, originalSize: f.size });
        }
        // Reset extraction state if user adds more files
        this.extractionDone = false;
        this.cleanupUrls();
        this.extractedImages = [];
    }

    removeFile(id: string) {
        this.files = this.files.filter(f => f.id !== id);
        if (this.files.length === 0) this.reset();
    }

    reset() {
        this.files = [];
        this.cleanupUrls();
        this.extractedImages = [];
        this.extractionDone = false;
        this.isProcessing = false;
    }

    private cleanupUrls() {
        this.extractedImages.forEach(img => URL.revokeObjectURL(img.url));
    }

    //  Processing 

    async extract() {
        if (this.files.length === 0) return;
        this.isProcessing = true;
        this.progress.text = 'Loading PDF engine...';

        this.cleanupUrls();
        this.extractedImages = [];

        try {
            let pymupdf: any = null;

            const { loadPyMuPDF } = await import('$utils/pymupdf-loader');
            pymupdf = await loadPyMuPDF();
            let imgCounter = 0;

            for (const fileObj of this.files) {
                this.progress.text = `Extracting images from ${fileObj.file.name}...`;

                const doc = await pymupdf.open(fileObj.file);
                const pageCount = doc.pageCount;

                for (let pageIdx = 0; pageIdx < pageCount; pageIdx++) {
                    const page = doc.getPage(pageIdx);
                    const images = page.getImages();

                    for (const imgInfo of images) {
                        try {
                            const imgData = page.extractImage(imgInfo.xref);
                            if (imgData && imgData.data) {
                                imgCounter++;
                                const ext = imgData.ext || 'png';
                                const name = `image_${imgCounter}.${ext}`;

                                const blob = new Blob([imgData.data]);
                                const url = URL.createObjectURL(blob);

                                this.extractedImages.push({
                                    id: crypto.randomUUID(),
                                    data: imgData.data,
                                    name,
                                    ext,
                                    url
                                });
                            }
                        } catch (e) {
                            console.warn('Failed to extract image:', e);
                        }
                    }
                }
                doc.close();
            }

            this.extractionDone = true;
            if (this.extractedImages.length === 0) {
                toast.error("No embedded images were found in the selected PDF(s).");
            }
        } catch (e: any) {
            console.error(e);
            toast.error(`An error occurred during extraction: ${e.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

// Downloading

    async downloadAll() {
        if (this.extractedImages.length === 0) return;
        this.isProcessing = true;
        this.progress.text = 'Creating ZIP archive...';

        try {
            // Dynamic import to keep bundle size small
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();

            this.extractedImages.forEach((img) => {
                zip.file(img.name, img.data);
            });

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            this.downloadBlob(zipBlob, 'extracted-images.zip');
        } catch (e) {
            console.error(e);
            toast.error("Failed to create ZIP archive.");
        } finally {
            this.isProcessing = false;
        }
    }

    downloadSingle(id: string) {
        const img = this.extractedImages.find(i => i.id === id);
        if (img) {
            const blob = new Blob([img.data as BlobPart]);
            this.downloadBlob(blob, img.name);
        }
    }

}