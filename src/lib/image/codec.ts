import { MAX_CANVAS_PIXELS, MAX_CANVAS_SIDE, releaseCanvas, yieldToMain } from '$lib/device-limits';

export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'avif';

export const MIME: Record<OutputFormat, string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif'
};

export const EXT: Record<OutputFormat, string> = { jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif' };

export const isHeic = (file: File) =>
    /\.(heic|heif)$/i.test(file.name) || file.type === 'image/heic' || file.type === 'image/heif';

export interface Crop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type Surface = HTMLCanvasElement | OffscreenCanvas;
type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export function createSurface(width: number, height: number): Surface {
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
}

function context(surface: Surface): Ctx {
    const ctx = surface.getContext('2d') as Ctx | null;
    if (!ctx) throw new Error('Canvas is not available on this device.');
    return ctx;
}

/** Decodes any browser-readable image, HEIC included. Caller must close() the bitmap. */
export async function decode(file: File): Promise<ImageBitmap> {
    let source: Blob = file;
    if (isHeic(file)) {
        const heic2any = (await import('heic2any')).default;
        const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.95 });
        source = Array.isArray(out) ? out[0] : out;
    }
    return createImageBitmap(source, { imageOrientation: 'from-image' });
}

/** Largest size that fits the device canvas budget, keeping the aspect ratio. */
export function fitToBudget(width: number, height: number) {
    let scale = Math.min(1, MAX_CANVAS_SIDE / width, MAX_CANVAS_SIDE / height);
    const pixels = width * height * scale * scale;
    if (pixels > MAX_CANVAS_PIXELS) scale *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);
    return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)) };
}

export interface RenderOptions {
    crop?: Crop;
    /** Output pixel size. Defaults to the crop (or source) size. */
    width?: number;
    height?: number;
    /** How the crop fills the output when aspect ratios differ. */
    fit?: 'fill' | 'contain' | 'cover';
    /** Fill for JPEG output and `contain` bars. */
    background?: string;
}

/** Draws a bitmap into a new surface with optional crop, resize and flat background. */
export function render(bitmap: ImageBitmap, opts: RenderOptions = {}): Surface {
    const crop = opts.crop ?? { x: 0, y: 0, width: bitmap.width, height: bitmap.height };
    const target = fitToBudget(opts.width ?? crop.width, opts.height ?? crop.height);
    const surface = createSurface(target.width, target.height);
    const ctx = context(surface);
    ctx.imageSmoothingQuality = 'high';
    if (opts.background) {
        ctx.fillStyle = opts.background;
        ctx.fillRect(0, 0, target.width, target.height);
    }

    const fit = opts.fit ?? 'fill';
    let dx = 0;
    let dy = 0;
    let dw = target.width;
    let dh = target.height;
    let { x: sx, y: sy, width: sw, height: sh } = crop;

    if (fit === 'contain') {
        const s = Math.min(dw / sw, dh / sh);
        dw = sw * s;
        dh = sh * s;
        dx = (target.width - dw) / 2;
        dy = (target.height - dh) / 2;
    } else if (fit === 'cover') {
        const s = Math.max(dw / sw, dh / sh);
        const cw = dw / s;
        const ch = dh / s;
        sx += (sw - cw) / 2;
        sy += (sh - ch) / 2;
        sw = cw;
        sh = ch;
    }
    ctx.drawImage(bitmap, sx, sy, sw, sh, dx, dy, dw, dh);
    return surface;
}

export async function toBlob(surface: Surface, format: OutputFormat, quality = 0.9): Promise<Blob> {
    const type = MIME[format];
    const q = format === 'png' ? undefined : quality;
    const blob =
        surface instanceof HTMLCanvasElement
            ? await new Promise<Blob | null>((resolve) => surface.toBlob(resolve, type, q))
            : await surface.convertToBlob({ type, quality: q });
    if (!blob) throw new Error('Could not encode the image.');
    // Browsers silently fall back to PNG for formats they cannot encode.
    if (blob.type !== type) throw new Error(`This browser cannot save ${format.toUpperCase()} images.`);
    return blob;
}

export interface TargetSize {
    maxBytes: number;
    /** Forms often reject files that are too small as well. */
    minBytes?: number;
}

export interface EncodeResult {
    blob: Blob;
    width: number;
    height: number;
    quality: number;
    /** False when even the smallest attempt stayed above maxBytes. */
    metTarget: boolean;
}

const MIN_QUALITY = 0.05;
const MIN_SIDE = 16;

/**
 * Encodes under a byte budget: binary search on quality, then shrink pixels and repeat.
 * PNG has no quality knob, so it only shrinks pixels.
 */
export async function encodeToTarget(
    bitmap: ImageBitmap,
    format: OutputFormat,
    target: TargetSize,
    opts: RenderOptions = {},
    startQuality = 0.92
): Promise<EncodeResult> {
    const base = render(bitmap, opts);
    let width = base.width;
    let height = base.height;
    let surface: Surface = base;
    let best: EncodeResult | null = null;

    try {
        for (let round = 0; round < 8; round++) {
            let lo = MIN_QUALITY;
            let hi = startQuality;
            let fitting: Blob | null = null;
            let fittingQ = lo;
            const steps = format === 'png' ? 1 : 7;

            for (let i = 0; i < steps; i++) {
                const q = format === 'png' ? 1 : i === 0 ? hi : (lo + hi) / 2;
                const blob = await toBlob(surface, format, q);
                if (!best || blob.size < best.blob.size) {
                    best = { blob, width, height, quality: q, metTarget: blob.size <= target.maxBytes };
                }
                if (blob.size <= target.maxBytes) {
                    fitting = blob;
                    fittingQ = q;
                    if (i === 0 || (target.minBytes && blob.size >= target.minBytes)) break;
                    lo = q;
                } else {
                    hi = q;
                }
                await yieldToMain();
            }

            if (fitting) {
                return { blob: fitting, width, height, quality: fittingQ, metTarget: true };
            }

            // Still too big at the lowest quality: shrink pixels by the byte ratio.
            const ratio = Math.sqrt(target.maxBytes / (best?.blob.size ?? target.maxBytes));
            const next = Math.max(0.5, Math.min(0.9, ratio));
            const nw = Math.floor(width * next);
            const nh = Math.floor(height * next);
            if (nw < MIN_SIDE || nh < MIN_SIDE) break;
            const smaller = createSurface(nw, nh);
            const ctx = context(smaller);
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(surface as CanvasImageSource, 0, 0, nw, nh);
            if (surface !== base) releaseCanvas(surface);
            surface = smaller;
            width = nw;
            height = nh;
        }
    } finally {
        releaseCanvas(base, surface);
    }
    return best ?? { blob: await toBlob(base, format, MIN_QUALITY), width, height, quality: MIN_QUALITY, metTarget: false };
}

/** Writes a JFIF density block so form checkers that read DPI see the requested value. */
export async function setJpegDpi(blob: Blob, dpi: number): Promise<Blob> {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff || bytes[3] !== 0xe0) return blob;
    // APP0 JFIF: units at offset 13 (1 = dpi), X density 14-15, Y density 16-17.
    bytes[13] = 1;
    bytes[14] = dpi >> 8;
    bytes[15] = dpi & 0xff;
    bytes[16] = dpi >> 8;
    bytes[17] = dpi & 0xff;
    return new Blob([bytes], { type: blob.type });
}
