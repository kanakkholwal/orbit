import { PdfEngine } from '$lib/pdf-engine.svelte';
import type { PDFDocument, PDFImage } from 'pdf-lib';
import { toast } from 'svelte-sonner';

export interface ImageFile {
    id: string;
    file: File;
    previewUrl?: string;
}

export type PageSize = 'fit' | 'a4' | 'letter' | 'legal';
export type Orientation = 'auto' | 'portrait' | 'landscape';
export type MarginSize = 'none' | 'small' | 'large';

const PAGE_POINTS: Record<Exclude<PageSize, 'fit'>, [number, number]> = {
    a4: [595.28, 841.89],
    letter: [612, 792],
    legal: [612, 1008],
};

const MARGIN_POINTS: Record<MarginSize, number> = { none: 0, small: 18, large: 36 };

// Images are measured at 96 pixels per inch; a PDF point is 1/72 inch.
const PX_TO_PT = 72 / 96;

export const ACCEPTED_FORMATS = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/avif',
    'image/x-icon', 'image/heic', 'image/heif',
    '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif', '.ico', '.heic', '.heif'
];

export class JpgToPdfState extends PdfEngine {
    files = $state<ImageFile[]>([]);
    settings = $state<{ pageSize: PageSize; orientation: Orientation; margin: MarginSize }>({
        pageSize: 'fit',
        orientation: 'auto',
        margin: 'none',
    });
    result = $state.raw<{ blob: Blob; name: string; pages: number } | null>(null);
    isProcessing = $state(false);
    progress = $state({ current: 0, total: 0, text: '' });

// Actions

    addFiles(newFiles: File[]) {
        const entries = newFiles.map(f => ({
            id: crypto.randomUUID(),
            file: f,
            // Only create preview for browser-supported types
            previewUrl: this.isBrowserViewable(f) ? URL.createObjectURL(f) : undefined
        }));

        this.files.push(...entries);
        if (entries.length > 0) this.result = null;
    }

    reorder(files: ImageFile[]) {
        this.files = files;
        this.result = null;
    }

    moveFile(index: number, delta: -1 | 1) {
        const target = index + delta;
        if (target < 0 || target >= this.files.length) return;
        const next = [...this.files];
        [next[index], next[target]] = [next[target], next[index]];
        this.reorder(next);
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    removeFile(id: string) {
        this.result = null;
        const index = this.files.findIndex(f => f.id === id);
        if (index !== -1) {
            if (this.files[index].previewUrl) URL.revokeObjectURL(this.files[index].previewUrl!);
            this.files.splice(index, 1);
        }
    }

    reset() {
        this.files.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
        this.files = [];
        this.result = null;
        this.isProcessing = false;
    }

    async convert() {
        if (this.files.length === 0) return;
        this.isProcessing = true;
        this.result = null;
        this.progress = { current: 0, total: this.files.length, text: 'Preparing images' };

        try {
            const { PDFDocument } = await import('pdf-lib');
            const pdf = await PDFDocument.create();
            const skipped: string[] = [];

            for (let i = 0; i < this.files.length; i++) {
                const { file } = this.files[i];
                this.progress = { current: i + 1, total: this.files.length, text: `Adding ${file.name}` };
                try {
                    const image = await this.embedImage(pdf, file);
                    this.addImagePage(pdf, image);
                } catch (e) {
                    console.error('Image could not be added', file.name, e);
                    skipped.push(file.name);
                }
            }

            if (pdf.getPageCount() === 0) {
                throw new Error('None of the images could be read. Try JPG or PNG files.');
            }

            const bytes = await pdf.save();
            const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
            const name = 'converted_images.pdf';
            this.result = { blob, name, pages: pdf.getPageCount() };
            this.downloadBlob(blob, name);

            if (skipped.length > 0) {
                toast.warning(`Skipped ${skipped.length} ${skipped.length === 1 ? 'image' : 'images'} that couldn't be read: ${skipped.join(', ')}`);
            }
        } catch (e) {
            console.error(e);
            toast.error(e instanceof Error ? e.message : "The PDF couldn't be created.");
        } finally {
            this.isProcessing = false;
        }
    }

    private async embedImage(pdf: PDFDocument, original: File): Promise<PDFImage> {
        const file = await this.handleHeic(original);
        const name = file.name.toLowerCase();
        const type = file.type.toLowerCase();

        if (type === 'image/jpeg' || type === 'image/jpg' || /\.jpe?g$/.test(name)) {
            return pdf.embedJpg(new Uint8Array(await file.arrayBuffer()));
        }
        if (type === 'image/png' || name.endsWith('.png')) {
            return pdf.embedPng(new Uint8Array(await file.arrayBuffer()));
        }

        const bitmap = await createImageBitmap(file);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas is not available');
            ctx.drawImage(bitmap, 0, 0);
            const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
            if (!png) throw new Error('Image could not be encoded');
            return pdf.embedPng(new Uint8Array(await png.arrayBuffer()));
        } finally {
            bitmap.close();
        }
    }

    private addImagePage(pdf: PDFDocument, image: PDFImage) {
        const { pageSize, orientation, margin } = this.settings;
        const m = MARGIN_POINTS[margin];
        const iw = image.width * PX_TO_PT;
        const ih = image.height * PX_TO_PT;

        let w: number;
        let h: number;
        if (pageSize === 'fit') {
            [w, h] = [iw + m * 2, ih + m * 2];
        } else {
            [w, h] = PAGE_POINTS[pageSize];
            const landscape = orientation === 'landscape' || (orientation === 'auto' && iw > ih);
            if (landscape) [w, h] = [h, w];
        }

        const scale = pageSize === 'fit' ? 1 : Math.min((w - m * 2) / iw, (h - m * 2) / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        pdf.addPage([w, h]).drawImage(image, { x: (w - dw) / 2, y: (h - dh) / 2, width: dw, height: dh });
    }

    private async handleHeic(file: File): Promise<File> {
        if (/\.(heic|heif)$/i.test(file.name) || file.type === 'image/heic' || file.type === 'image/heif') {
            try {
                // Dynamic import to avoid SSR window error
                const heic2any = (await import('heic2any')).default;

                const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
                const blob = Array.isArray(result) ? result[0] : result;

                return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
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