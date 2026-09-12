import { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export type FilterKind = 'grayscale' | 'blackwhite' | 'invert' | 'sepia' | 'scanner' | 'adjust';

/** Settings for a pixel filter. Brightness, contrast and saturation run from -100 to 100. */
export interface FilterSettings {
    kind: FilterKind;
    threshold: number;
    brightness: number;
    contrast: number;
    saturation: number;
}

export type ImageKind = 'jpeg' | 'png';

/** Options for turning every page of a PDF into an image page. */
export interface RasterOptions {
    dpi: number;
    format: ImageKind;
    quality: number;
    filter?: FilterSettings | null;
    onPage?: (done: number, total: number) => void;
}

const MAX_SIDE = 16384;
const MAX_PIXELS = 16_000_000;
const SCANNER_CONTRAST = 30;
const SCANNER_NOISE = 14;
const ANNOTATION_MODE_ENABLE_STORAGE = 3;

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function contrastFactor(amount: number) {
    const c = Math.max(-254, Math.min(254, amount * 2.55));
    return (259 * (c + 255)) / (255 * (259 - c));
}

/** Tilt in degrees the scanner effect gives a page, stable for the same page. */
export function scannerAngle(seed: number): number {
    const rand = mulberry32(seed * 7919 + 17);
    const size = 0.2 + rand() * 0.4;
    return rand() < 0.5 ? -size : size;
}

/** Applies a filter to RGBA pixels in place. The seed keeps scanner noise stable per page. */
export function applyPixelFilter(data: Uint8ClampedArray, settings: FilterSettings, seed = 1): void {
    const n = data.length;
    switch (settings.kind) {
        case 'grayscale':
            for (let i = 0; i < n; i += 4) {
                const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                data[i] = data[i + 1] = data[i + 2] = y;
            }
            break;
        case 'blackwhite': {
            const t = settings.threshold;
            for (let i = 0; i < n; i += 4) {
                const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                data[i] = data[i + 1] = data[i + 2] = y >= t ? 255 : 0;
            }
            break;
        }
        case 'invert':
            for (let i = 0; i < n; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            break;
        case 'sepia':
            for (let i = 0; i < n; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                data[i] = 0.393 * r + 0.769 * g + 0.189 * b;
                data[i + 1] = 0.349 * r + 0.686 * g + 0.168 * b;
                data[i + 2] = 0.272 * r + 0.534 * g + 0.131 * b;
            }
            break;
        case 'scanner': {
            const f = contrastFactor(SCANNER_CONTRAST);
            const rand = mulberry32(seed);
            for (let i = 0; i < n; i += 4) {
                const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                const v = clamp(f * (y - 128) + 128 + (rand() - 0.5) * SCANNER_NOISE);
                data[i] = data[i + 1] = data[i + 2] = v;
            }
            break;
        }
        case 'adjust': {
            const add = settings.brightness * 2.55;
            const f = contrastFactor(settings.contrast);
            const sat = 1 + settings.saturation / 100;
            for (let i = 0; i < n; i += 4) {
                let r = f * (data[i] + add - 128) + 128;
                let g = f * (data[i + 1] + add - 128) + 128;
                let b = f * (data[i + 2] + add - 128) + 128;
                const y = 0.299 * r + 0.587 * g + 0.114 * b;
                r = y + (r - y) * sat;
                g = y + (g - y) * sat;
                b = y + (b - y) * sat;
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
            }
            break;
        }
    }
}

/** Filters a canvas in place, including the scanner tilt. */
export function filterCanvas(canvas: HTMLCanvasElement, settings: FilterSettings, seed = 1): void {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const { width, height } = canvas;
    if (settings.kind === 'scanner') {
        const copy = document.createElement('canvas');
        copy.width = width;
        copy.height = height;
        copy.getContext('2d')?.drawImage(canvas, 0, 0);
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.translate(width / 2, height / 2);
        ctx.rotate((scannerAngle(seed) * Math.PI) / 180);
        ctx.drawImage(copy, -width / 2, -height / 2);
        ctx.restore();
        copy.width = copy.height = 0;
    }
    const image = ctx.getImageData(0, 0, width, height);
    applyPixelFilter(image.data, settings, seed);
    ctx.putImageData(image, 0, 0);
}

/** Pixel scale for a page so the canvas stays inside browser limits. */
export function renderScale(widthPt: number, heightPt: number, dpi: number): number {
    let scale = dpi / 72;
    scale = Math.min(scale, MAX_SIDE / widthPt, MAX_SIDE / heightPt);
    const pixels = widthPt * scale * heightPt * scale;
    if (pixels > MAX_PIXELS) scale *= Math.sqrt(MAX_PIXELS / pixels);
    return scale;
}

function toBlob(canvas: HTMLCanvasElement, format: ImageKind, quality: number) {
    return new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('The page could not be turned into an image.'))),
            format === 'png' ? 'image/png' : 'image/jpeg',
            quality
        )
    );
}

/** Renders every page to an image and builds a new PDF from those images at the original page sizes. */
export async function rasterizeToPdf(pdf: PDFDocumentProxy, options: RasterOptions): Promise<Uint8Array> {
    const out = await PDFDocument.create();
    const total = pdf.numPages;
    for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: renderScale(base.width, base.height, options.dpi) });
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        try {
            const ctx = canvas.getContext('2d', { willReadFrequently: Boolean(options.filter) });
            if (!ctx) throw new Error('This browser could not draw the page.');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({
                canvasContext: ctx,
                viewport,
                canvas,
                annotationMode: ANNOTATION_MODE_ENABLE_STORAGE
            }).promise;
            if (options.filter) filterCanvas(canvas, options.filter, i);
            const bytes = new Uint8Array(await (await toBlob(canvas, options.format, options.quality)).arrayBuffer());
            const image = options.format === 'png' ? await out.embedPng(bytes) : await out.embedJpg(bytes);
            const outPage = out.addPage([base.width, base.height]);
            outPage.drawImage(image, { x: 0, y: 0, width: base.width, height: base.height });
        } finally {
            canvas.width = canvas.height = 0;
            page.cleanup();
        }
        options.onPage?.(i, total);
        await new Promise((r) => setTimeout(r, 0));
    }
    return out.save();
}
