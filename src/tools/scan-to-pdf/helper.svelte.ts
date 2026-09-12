import { PdfEngine } from '$lib/pdf-engine.svelte';
import { toast } from 'svelte-sonner';

export type PageSize = 'a4' | 'letter' | 'fit';
export type Rotation = 0 | 90 | 180 | 270;

export interface ScanPage {
    id: string;
    source: Blob;
    name: string;
    rotation: Rotation;
    thumbUrl?: string;
}

export const ACCEPTED_IMAGES = 'image/*,.heic,.heif';

const PAGE_POINTS: Record<Exclude<PageSize, 'fit'>, [number, number]> = {
    a4: [595.28, 841.89],
    letter: [612, 792],
};

const OUTPUT_MAX_SIDE = 2400;
const THUMB_MAX_SIDE = 360;

async function toDecodable(file: Blob, name: string): Promise<Blob> {
    const heic = /\.(heic|heif)$/i.test(name) || file.type === 'image/heic' || file.type === 'image/heif';
    if (!heic) return file;
    const heic2any = (await import('heic2any')).default;
    const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    return Array.isArray(result) ? result[0] : result;
}

function enhance(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const image = ctx.getImageData(0, 0, width, height);
    const px = image.data;
    const count = px.length / 4;
    const lum = new Uint8ClampedArray(count);
    const histogram = new Uint32Array(256);
    for (let i = 0; i < count; i++) {
        const o = i * 4;
        const v = (px[o] * 77 + px[o + 1] * 150 + px[o + 2] * 29) >> 8;
        lum[i] = v;
        histogram[v]++;
    }
    const percentile = (p: number) => {
        let seen = 0;
        for (let v = 0; v < 256; v++) {
            seen += histogram[v];
            if (seen >= count * p) return v;
        }
        return 255;
    };
    const low = percentile(0.02);
    const high = Math.max(percentile(0.9), low + 32);
    const curve = new Uint8ClampedArray(256);
    for (let v = 0; v < 256; v++) {
        const t = Math.min(1, Math.max(0, (v - low) / (high - low)));
        curve[v] = Math.round(255 * t ** 1.4);
    }
    for (let i = 0; i < count; i++) {
        const o = i * 4;
        const v = curve[lum[i]];
        px[o] = v;
        px[o + 1] = v;
        px[o + 2] = v;
    }
    ctx.putImageData(image, 0, 0);
}

async function drawPage(source: Blob, rotation: Rotation, enhanced: boolean, maxSide: number) {
    const bitmap = await createImageBitmap(source);
    try {
        const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
        const w = Math.round(bitmap.width * scale);
        const h = Math.round(bitmap.height * scale);
        const sideways = rotation === 90 || rotation === 270;
        const canvas = document.createElement('canvas');
        canvas.width = sideways ? h : w;
        canvas.height = sideways ? w : h;
        const ctx = canvas.getContext('2d', { willReadFrequently: enhanced });
        if (!ctx) throw new Error('Canvas is not available');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(bitmap, -w / 2, -h / 2, w, h);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (enhanced) enhance(ctx, canvas.width, canvas.height);
        return canvas;
    } finally {
        bitmap.close();
    }
}

const toJpeg = (canvas: HTMLCanvasElement, quality: number) =>
    new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Image could not be encoded'))), 'image/jpeg', quality)
    );

export class ScanToPdfState extends PdfEngine {
    pages = $state<ScanPage[]>([]);
    settings = $state<{ pageSize: PageSize; enhance: boolean }>({ pageSize: 'a4', enhance: false });
    result = $state.raw<{ blob: Blob; name: string; pages: number } | null>(null);
    adding = $state(0);

    async addImages(files: File[]) {
        const skipped: string[] = [];
        this.adding += files.length;
        for (const file of files) {
            try {
                await this.addPage(await toDecodable(file, file.name), file.name);
            } catch (e) {
                console.error('[Scan to PDF] Could not read', file.name, e);
                skipped.push(file.name);
            } finally {
                this.adding--;
            }
        }
        if (skipped.length > 0) {
            toast.warning(`Skipped ${skipped.length === 1 ? 'a photo' : `${skipped.length} photos`} that couldn't be read: ${skipped.join(', ')}`);
        }
    }

    async addCapture(blob: Blob) {
        await this.addPage(blob, `Scan ${this.pages.length + 1}.jpg`);
    }

    private async addPage(source: Blob, name: string) {
        const page: ScanPage = { id: crypto.randomUUID(), source, name, rotation: 0 };
        page.thumbUrl = await this.thumbnail(page);
        this.pages.push(page);
        this.result = null;
    }

    private async thumbnail(page: Pick<ScanPage, 'source' | 'rotation'>) {
        const canvas = await drawPage(page.source, page.rotation, this.settings.enhance, THUMB_MAX_SIDE);
        return URL.createObjectURL(await toJpeg(canvas, 0.8));
    }

    private async refresh(page: ScanPage) {
        const wanted = `${page.rotation}:${this.settings.enhance}`;
        try {
            const url = await this.thumbnail(page);
            if (wanted !== `${page.rotation}:${this.settings.enhance}` || !this.pages.includes(page)) {
                URL.revokeObjectURL(url);
                return;
            }
            if (page.thumbUrl) URL.revokeObjectURL(page.thumbUrl);
            page.thumbUrl = url;
        } catch (e) {
            console.error('[Scan to PDF] Thumbnail failed', e);
        }
    }

    async rotate(id: string) {
        const page = this.pages.find(p => p.id === id);
        if (!page) return;
        page.rotation = ((page.rotation + 90) % 360) as Rotation;
        this.result = null;
        await this.refresh(page);
    }

    async setEnhance(on: boolean) {
        this.settings.enhance = on;
        this.result = null;
        await Promise.all(this.pages.map(page => this.refresh(page)));
    }

    reorder(pages: ScanPage[]) {
        this.pages = pages;
        this.result = null;
    }

    movePage(index: number, delta: -1 | 1) {
        const target = index + delta;
        if (target < 0 || target >= this.pages.length) return;
        const next = [...this.pages];
        [next[index], next[target]] = [next[target], next[index]];
        this.reorder(next);
    }

    removePage(id: string) {
        const page = this.pages.find(p => p.id === id);
        if (page?.thumbUrl) URL.revokeObjectURL(page.thumbUrl);
        this.pages = this.pages.filter(p => p.id !== id);
        this.result = null;
    }

    reset() {
        for (const page of this.pages) if (page.thumbUrl) URL.revokeObjectURL(page.thumbUrl);
        this.pages = [];
        this.result = null;
        this.isProcessing = false;
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    async convert() {
        if (this.pages.length === 0) return;
        this.isProcessing = true;
        this.result = null;
        this.progress = { current: 0, total: this.pages.length, text: 'Preparing pages' };

        try {
            const { PDFDocument } = await import('pdf-lib');
            const pdf = await PDFDocument.create();
            const { pageSize, enhance: enhanced } = this.settings;
            const pages = [...this.pages];

            for (let i = 0; i < pages.length; i++) {
                this.progress = { current: i + 1, total: pages.length, text: `Adding page ${i + 1}` };
                const canvas = await drawPage(pages[i].source, pages[i].rotation, enhanced, OUTPUT_MAX_SIDE);
                const image = await pdf.embedJpg(new Uint8Array(await (await toJpeg(canvas, enhanced ? 0.8 : 0.85)).arrayBuffer()));
                const landscape = image.width > image.height;

                let w: number;
                let h: number;
                if (pageSize === 'fit') {
                    const short = PAGE_POINTS.a4[0];
                    [w, h] = landscape ? [short * (image.width / image.height), short] : [short, short * (image.height / image.width)];
                } else {
                    [w, h] = PAGE_POINTS[pageSize];
                    if (landscape) [w, h] = [h, w];
                }
                const scale = Math.min(w / image.width, h / image.height);
                const dw = image.width * scale;
                const dh = image.height * scale;
                pdf.addPage([w, h]).drawImage(image, { x: (w - dw) / 2, y: (h - dh) / 2, width: dw, height: dh });
            }

            pdf.setTitle('Scanned document');
            pdf.setCreator('Orbit');
            const bytes = await pdf.save();
            const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
            const name = `scan-${new Date().toISOString().slice(0, 10)}.pdf`;
            this.result = { blob, name, pages: pdf.getPageCount() };
            this.downloadBlob(blob, name);
        } catch (e) {
            console.error('[Scan to PDF] Error:', e);
            toast.error("The PDF couldn't be created. Try removing the last photo you added.");
        } finally {
            this.isProcessing = false;
        }
    }
}
