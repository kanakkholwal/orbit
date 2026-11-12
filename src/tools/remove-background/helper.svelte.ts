import { BaseEngine } from '$lib/base-engine.svelte';
import { decode, createSurface } from '$lib/image/codec';
import { toast } from 'svelte-sonner';

export type Backdrop = 'transparent' | 'white' | 'color';

export interface CutoutItem {
    id: string;
    file: File;
    previewUrl: string;
    status: 'ready' | 'processing' | 'done' | 'error';
    error?: string;
    /** Transparent PNG straight from the model. */
    cutout?: Blob;
    width: number;
    height: number;
}

/** Background removal with a segmentation model that runs on the device. */
export class RemoveBackgroundState extends BaseEngine {
    items = $state<CutoutItem[]>([]);
    backdrop = $state<Backdrop>('transparent');
    color = $state('#ffffff');
    /** Shown while the model downloads on first use. */
    stage = $state('');
    fraction = $state(0);
    resultUrls = $state<Record<string, string>>({});

    get done() {
        return this.items.filter((i) => i.status === 'done' && i.cutout);
    }

    async addFiles(files: File[]) {
        const next: CutoutItem[] = [];
        for (const file of files) {
            if (!/^image\//.test(file.type) && !/\.(heic|heif|avif)$/i.test(file.name)) {
                toast.error(`${file.name} is not an image.`);
                continue;
            }
            try {
                const bmp = await decode(file);
                const { width, height } = bmp;
                bmp.close();
                next.push({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file), status: 'ready', width, height });
            } catch {
                toast.error(`${file.name} could not be opened.`);
            }
        }
        this.items.push(...next);
    }

    removeItem(id: string) {
        const item = this.items.find((i) => i.id === id);
        if (item) this.revoke(item);
        this.items = this.items.filter((i) => i.id !== id);
    }

    private revoke(item: CutoutItem) {
        URL.revokeObjectURL(item.previewUrl);
        const url = this.resultUrls[item.id];
        if (url) URL.revokeObjectURL(url);
        delete this.resultUrls[item.id];
    }

    reset() {
        for (const i of this.items) this.revoke(i);
        this.items = [];
    }

    async process() {
        const queue = this.items.filter((i) => i.status !== 'done');
        if (queue.length === 0) return;
        this.isProcessing = true;
        this.progress = { current: 0, total: queue.length, text: 'Removing background' };
        // Lazy: the library and the model are only fetched when this tool is used.
        const { removeBackground } = await import('@imgly/background-removal');
        for (const item of queue) {
            item.status = 'processing';
            this.fraction = 0;
            this.stage = 'Preparing';
            try {
                item.cutout = await removeBackground(item.file, {
                    model: 'isnet_quint8',
                    output: { format: 'image/png' },
                    progress: (key: string, current: number, total: number) => {
                        this.stage = key.startsWith('fetch') ? 'Downloading the model (first time only)' : 'Removing background';
                        if (total > 0) this.fraction = current / total;
                    }
                });
                this.resultUrls[item.id] = URL.createObjectURL(item.cutout);
                item.status = 'done';
            } catch (err) {
                item.status = 'error';
                item.error = err instanceof Error ? err.message : 'Could not remove the background.';
            }
            this.progress.current += 1;
        }
        this.stage = '';
        this.isProcessing = false;
    }

    /** The cut-out on the chosen backdrop. Transparent keeps the model's PNG. */
    async render(item: CutoutItem): Promise<{ blob: Blob; name: string }> {
        const base = item.file.name.replace(/\.[^.]+$/, '');
        if (!item.cutout) throw new Error('Nothing to export yet.');
        if (this.backdrop === 'transparent') return { blob: item.cutout, name: `${base}-no-background.png` };
        const bmp = await createImageBitmap(item.cutout);
        const surface = createSurface(bmp.width, bmp.height);
        const ctx = surface.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
        ctx.fillStyle = this.backdrop === 'white' ? '#ffffff' : this.color;
        ctx.fillRect(0, 0, bmp.width, bmp.height);
        ctx.drawImage(bmp, 0, 0);
        bmp.close();
        const blob =
            surface instanceof OffscreenCanvas
                ? await surface.convertToBlob({ type: 'image/png' })
                : await new Promise<Blob>((res, rej) => (surface as HTMLCanvasElement).toBlob((b) => (b ? res(b) : rej(new Error('Export failed'))), 'image/png'));
        return { blob, name: `${base}-${this.backdrop === 'white' ? 'white' : 'colour'}-background.png` };
    }

    async download(item: CutoutItem) {
        const { blob, name } = await this.render(item);
        this.downloadBlob(blob, name);
    }

    async downloadAll() {
        const { downloadMany } = await import('$lib/download-many');
        const files = await Promise.all(this.done.map((i) => this.render(i)));
        await downloadMany(files, 'orbit-cutouts.zip', (blob, name) => this.downloadBlob(blob, name));
    }
}
