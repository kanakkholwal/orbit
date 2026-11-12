import { BaseEngine } from '$lib/base-engine.svelte';
import { mapLimit } from '$lib/device-limits';
import { downloadMany } from '$lib/download-many';
import {
    EXT,
    decode,
    encodeToTarget,
    render,
    setJpegDpi,
    toBlob,
    type Crop,
    type OutputFormat,
    type RenderOptions
} from '$lib/image/codec';
import { ASPECTS, getPreset, presetPixels, type Unit } from '$lib/image/presets';
import { settings } from '$lib/settings/settings.svelte';
import { toast } from 'svelte-sonner';
import { getStudioDef, type StudioDef, type StudioMode } from './defs';

export interface StudioItem {
    id: string;
    file: File;
    /** Small preview, never the full-size image. */
    previewUrl: string;
    width: number;
    height: number;
    crop: Crop;
    status: 'ready' | 'processing' | 'done' | 'error';
    error?: string;
    /** Object URL of the result, for the before and after view. */
    resultUrl?: string;
    result?: { blob: Blob; name: string; width: number; height: number; metTarget: boolean };
}

export interface StudioOptions {
    format: OutputFormat;
    /** 0-100, used when no byte limit is set. */
    quality: number;
    unit: Unit;
    dpi: number;
    width: number;
    height: number;
    lockAspect: boolean;
    fit: 'cover' | 'contain' | 'fill';
    background: string;
    aspectId: string;
    useSize: boolean;
    useLimit: boolean;
    maxKB: number;
    minKB: number;
}

const PREVIEW_SIDE = 1280;
const normaliseFormat = (f: string): OutputFormat => (f === 'jpg' || f === 'jpeg' ? 'jpeg' : (f as OutputFormat));

export const MM_PER_INCH = 25.4;

/** Largest centred crop of the source that has the given width / height ratio. */
export function centredCrop(width: number, height: number, ratio?: number): Crop {
    if (!ratio) return { x: 0, y: 0, width, height };
    let w = width;
    let h = w / ratio;
    if (h > height) {
        h = height;
        w = h * ratio;
    }
    return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}

/** One engine for every image tool; the mode and presets decide which controls apply. */
export class ImageStudioState extends BaseEngine {
    items = $state<StudioItem[]>([]);
    activeId = $state<string | null>(null);
    mode = $state<StudioMode>('resize');
    presetId = $state<string | undefined>();
    opts = $state<StudioOptions>({
        format: 'jpeg',
        quality: 90,
        unit: 'px',
        dpi: 300,
        width: 0,
        height: 0,
        lockAspect: true,
        fit: 'cover',
        background: '#ffffff',
        aspectId: 'free',
        useSize: false,
        useLimit: false,
        maxKB: 100,
        minKB: 0
    });

    configure(slug: string) {
        const def = getStudioDef(slug);
        if (!def) return;
        this.apply(def);
    }

    private apply(def: StudioDef) {
        this.mode = def.mode;
        this.opts.quality = settings.value.imageQuality;
        this.opts.format = def.format ?? normaliseFormat(settings.value.defaultFormats.image);
        this.opts.useSize = def.mode === 'resize' || def.mode === 'form';
        this.opts.useLimit = def.mode === 'compress' || def.mode === 'form';
        this.opts.aspectId = def.aspect ?? 'free';
        if (def.mode === 'compress') this.opts.format = def.format ?? 'jpeg';
        if (def.presetId) this.selectPreset(def.presetId);
        else if (def.mode === 'form') this.selectPreset('passport-35x45');
    }

    selectPreset(id: string) {
        const p = getPreset(id);
        if (!p) return;
        this.presetId = id;
        if (p.format) this.opts.format = p.format;
        const px = presetPixels(p);
        if (px) {
            this.opts.unit = p.unit ?? 'px';
            this.opts.dpi = p.dpi ?? 300;
            this.opts.width = p.unit === 'px' || !p.unit ? px.width : (p.width as number);
            this.opts.height = p.unit === 'px' || !p.unit ? px.height : (p.height as number);
            this.opts.useSize = true;
            this.opts.lockAspect = false;
        }
        if (p.maxKB) {
            this.opts.maxKB = p.maxKB;
            this.opts.useLimit = true;
        } else if (this.mode !== 'compress') {
            this.opts.useLimit = false;
        }
        this.opts.minKB = p.minKB ?? 0;
        this.resetCrops();
    }

    // Output spec

    /** Output size in pixels from the width and height fields and their unit. */
    get outputPixels(): { width: number; height: number } | undefined {
        if (!this.opts.useSize || !this.opts.width || !this.opts.height) return undefined;
        const f = this.unitFactor;
        return { width: Math.max(1, Math.round(this.opts.width * f)), height: Math.max(1, Math.round(this.opts.height * f)) };
    }

    private get unitFactor() {
        const { unit, dpi } = this.opts;
        return unit === 'mm' ? dpi / MM_PER_INCH : unit === 'in' ? dpi : 1;
    }

    /** With the aspect locked, only the width is set and each image keeps its own ratio. */
    private outputFor(item: StudioItem) {
        if (this.mode === 'resize' && this.opts.useSize && this.opts.lockAspect && this.opts.width) {
            const width = Math.max(1, Math.round(this.opts.width * this.unitFactor));
            return { width, height: Math.max(1, Math.round((width * item.height) / item.width)) };
        }
        return this.outputPixels;
    }

    /** Width / height the crop box must keep, or undefined for free crop. */
    get cropRatio(): number | undefined {
        if (this.mode === 'form') {
            const px = this.outputPixels;
            return px ? px.width / px.height : undefined;
        }
        if (this.mode === 'crop') return ASPECTS.find((a) => a.id === this.opts.aspectId)?.ratio;
        return undefined;
    }

    get usesCrop() {
        return this.mode === 'crop' || this.mode === 'form';
    }

    get active(): StudioItem | undefined {
        return this.items.find((i) => i.id === this.activeId) ?? this.items[0];
    }

    get done() {
        return this.items.filter((i) => i.status === 'done' && i.result);
    }

    get totalSaved() {
        return this.done.reduce((sum, i) => sum + (i.file.size - (i.result?.blob.size ?? i.file.size)), 0);
    }

    // Items

    async addFiles(files: File[]) {
        const added = await mapLimit(files, async (file): Promise<StudioItem | null> => {
            try {
                const bitmap = await decode(file);
                try {
                    const surface = render(bitmap, {
                        ...this.previewSize(bitmap.width, bitmap.height),
                        background: '#ffffff'
                    });
                    const preview = await toBlob(surface, 'jpeg', 0.8);
                    return {
                        id: crypto.randomUUID(),
                        file,
                        previewUrl: URL.createObjectURL(preview),
                        width: bitmap.width,
                        height: bitmap.height,
                        crop: centredCrop(bitmap.width, bitmap.height, this.cropRatio),
                        status: 'ready'
                    };
                } finally {
                    bitmap.close();
                }
            } catch (err) {
                toast.error('Could not open image', { description: `${file.name}. ${err instanceof Error ? err.message : ''}`.trim() });
                return null;
            }
        });
        const ok = added.filter((i): i is StudioItem => i !== null);
        this.items.push(...ok);
        if (!this.activeId && ok[0]) this.activeId = ok[0].id;
    }

    private previewSize(w: number, h: number) {
        const s = Math.min(1, PREVIEW_SIDE / Math.max(w, h));
        return { width: Math.round(w * s), height: Math.round(h * s) };
    }

    removeItem(id: string) {
        const item = this.items.find((i) => i.id === id);
        if (item) this.release(item);
        this.items = this.items.filter((i) => i.id !== id);
        if (this.activeId === id) this.activeId = this.items[0]?.id ?? null;
    }

    reset() {
        for (const i of this.items) this.release(i);
        this.items = [];
        this.activeId = null;
    }

    private release(item: StudioItem) {
        URL.revokeObjectURL(item.previewUrl);
        if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    }

    resetCrops() {
        for (const i of this.items) {
            i.crop = centredCrop(i.width, i.height, this.cropRatio);
            this.invalidate(i);
        }
    }

    /** Any option or crop change makes an earlier result stale. */
    invalidate(item: StudioItem) {
        if (item.status === 'done' || item.status === 'error') {
            if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
            item.status = 'ready';
            item.result = undefined;
            item.resultUrl = undefined;
        }
    }

    // Processing

    private renderOptions(item: StudioItem): RenderOptions {
        const out = this.outputFor(item);
        const base: RenderOptions = { background: this.opts.background, fit: this.opts.fit };
        if (this.usesCrop) base.crop = item.crop;
        if (out) {
            base.width = out.width;
            base.height = out.height;
        }
        if (this.usesCrop && out) base.fit = 'fill';
        return base;
    }

    private async processItem(item: StudioItem) {
        item.status = 'processing';
        const { format, quality } = this.opts;
        const bitmap = await decode(item.file);
        try {
            const opts = this.renderOptions(item);
            const flat = format === 'jpeg' ? { ...opts, background: opts.background || '#ffffff' } : opts;
            let blob: Blob;
            let width: number;
            let height: number;
            let metTarget = true;

            if (this.opts.useLimit && this.opts.maxKB > 0) {
                const r = await encodeToTarget(
                    bitmap,
                    format,
                    { maxBytes: this.opts.maxKB * 1024, minBytes: this.opts.minKB ? this.opts.minKB * 1024 : undefined },
                    flat,
                    quality / 100
                );
                ({ blob, width, height, metTarget } = r);
            } else {
                const surface = render(bitmap, flat);
                width = surface.width;
                height = surface.height;
                blob = await toBlob(surface, format, quality / 100);
                surface.width = surface.height = 0;
            }

            if (format === 'jpeg' && this.opts.useSize && this.opts.dpi) blob = await setJpegDpi(blob, this.opts.dpi);
            item.result = { blob, name: settings.outputName(item.file.name, EXT[format]), width, height, metTarget };
            if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
            item.resultUrl = URL.createObjectURL(blob);
            item.status = 'done';
        } finally {
            bitmap.close();
        }
    }

    async process() {
        const queue = this.items.filter((i) => i.status !== 'done');
        if (queue.length === 0) return;
        this.isProcessing = true;
        this.progress = { current: 0, total: queue.length, text: 'Processing' };
        let finished = 0;
        await mapLimit(queue, async (item) => {
            try {
                await this.processItem(item);
            } catch (err) {
                item.status = 'error';
                item.error = err instanceof Error ? err.message : 'Failed';
            }
            this.progress.current = ++finished;
        });
        this.isProcessing = false;

        const missed = this.done.filter((i) => !i.result?.metTarget).length;
        if (missed > 0) toast.warning('Over the size limit', { description: `${missed} image${missed > 1 ? 's' : ''} could not get under it. Try a smaller size.` });
    }

    download(item: StudioItem) {
        if (item.result) this.downloadBlob(item.result.blob, item.result.name);
    }

    async downloadAll() {
        const files = this.done.flatMap((i) => (i.result ? [{ blob: i.result.blob, name: i.result.name }] : []));
        await downloadMany(files, 'orbit-images.zip', (blob, name) => this.downloadBlob(blob, name));
    }
}
