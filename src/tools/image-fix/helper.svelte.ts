import { BaseEngine } from '$lib/base-engine.svelte';
import { createSurface, decode, EXT, toBlob, type OutputFormat, type Surface } from '$lib/image/codec';
import { releaseCanvas, yieldToMain } from '$lib/device-limits';
import { downloadMany } from '$lib/download-many';
import { toast } from 'svelte-sonner';
import { getFixDef, type FixOp } from './defs';

export interface FixItem {
    id: string;
    file: File;
    status: 'ready' | 'processing' | 'done' | 'error';
    error?: string;
    result?: { blob: Blob; name: string };
}

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const formatOf = (file: File): OutputFormat => {
    if (file.type === 'image/png') return 'png';
    if (file.type === 'image/webp') return 'webp';
    return 'jpeg';
};

/** Rotate, flip, strip metadata or watermark photos, one at a time on the device. */
export class ImageFixState extends BaseEngine {
    items = $state<FixItem[]>([]);
    op = $state<FixOp>('rotate');
    angle = $state<0 | 90 | 180 | 270>(90);
    mirrorX = $state(true);
    mirrorY = $state(false);
    text = $state('© Your name');
    opacity = $state(0.35);
    /** Text height as a share of the shorter image side. */
    size = $state(0.06);
    tile = $state(true);

    configure(slug: string) {
        const def = getFixDef(slug);
        if (!def) return;
        this.op = def.op;
        this.angle = def.op === 'rotate' ? 90 : 0;
        this.mirrorX = def.op === 'flip';
    }

    get done() {
        return this.items.filter((i) => i.status === 'done' && i.result);
    }

    addFiles(files: File[]) {
        const ok = files.filter((f) => {
            const good = /^image\//.test(f.type) || /\.(heic|heif|avif)$/i.test(f.name);
            if (!good) toast.error(`${f.name} is not an image.`);
            return good;
        });
        this.items.push(...ok.map((file) => ({ id: crypto.randomUUID(), file, status: 'ready' as const })));
    }

    removeItem(id: string) {
        this.items = this.items.filter((i) => i.id !== id);
    }

    reset() {
        this.items = [];
    }

    /** Changing an option makes finished results stale. */
    invalidate() {
        for (const i of this.items) if (i.status !== 'processing') Object.assign(i, { status: 'ready', result: undefined, error: undefined });
    }

    private draw(bmp: ImageBitmap): Surface {
        const quarter = this.op === 'rotate' && (this.angle === 90 || this.angle === 270);
        const w = quarter ? bmp.height : bmp.width;
        const h = quarter ? bmp.width : bmp.height;
        const surface = createSurface(w, h);
        const ctx = surface.getContext('2d') as Ctx;
        ctx.imageSmoothingQuality = 'high';
        ctx.translate(w / 2, h / 2);
        if (this.op === 'rotate') ctx.rotate((this.angle * Math.PI) / 180);
        if (this.op === 'flip') ctx.scale(this.mirrorX ? -1 : 1, this.mirrorY ? -1 : 1);
        ctx.drawImage(bmp, -bmp.width / 2, -bmp.height / 2);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (this.op === 'watermark' && this.text.trim()) this.stamp(ctx, w, h);
        return surface;
    }

    private stamp(ctx: Ctx, w: number, h: number) {
        const px = Math.max(10, Math.round(Math.min(w, h) * this.size));
        ctx.font = `600 ${px}px system-ui, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.lineWidth = Math.max(1, px / 14);
        ctx.globalAlpha = this.opacity;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = this.text.trim();
        if (!this.tile) {
            ctx.strokeText(label, w / 2, h / 2);
            ctx.fillText(label, w / 2, h / 2);
            ctx.globalAlpha = 1;
            return;
        }
        const stepX = ctx.measureText(label).width + px * 3;
        const stepY = px * 4;
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-Math.PI / 6);
        const reach = Math.hypot(w, h) / 2;
        for (let y = -reach, row = 0; y < reach; y += stepY, row++) {
            for (let x = -reach + (row % 2 ? stepX / 2 : 0); x < reach; x += stepX) {
                ctx.strokeText(label, x, y);
                ctx.fillText(label, x, y);
            }
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
    }

    async process() {
        const queue = this.items.filter((i) => i.status !== 'done');
        if (queue.length === 0) return;
        this.isProcessing = true;
        this.progress = { current: 0, total: queue.length, text: 'Working' };
        for (const item of queue) {
            item.status = 'processing';
            try {
                const bmp = await decode(item.file);
                const format = formatOf(item.file);
                const surface = this.draw(bmp);
                bmp.close();
                const blob = await toBlob(surface, format, 0.95);
                releaseCanvas(surface);
                const base = item.file.name.replace(/\.[^.]+$/, '');
                const suffix = { rotate: 'rotated', flip: 'flipped', strip: 'clean', watermark: 'watermarked' }[this.op];
                item.result = { blob, name: `${base}-${suffix}.${EXT[format]}` };
                item.status = 'done';
            } catch (err) {
                item.status = 'error';
                item.error = err instanceof Error ? err.message : 'Could not process this image.';
            }
            this.progress.current += 1;
            await yieldToMain();
        }
        this.isProcessing = false;
    }

    download(item: FixItem) {
        if (item.result) this.downloadBlob(item.result.blob, item.result.name);
    }

    async downloadAll() {
        const files = this.done.flatMap((i) => (i.result ? [i.result] : []));
        await downloadMany(files, 'orbit-photos.zip', (blob, name) => this.downloadBlob(blob, name));
    }
}

