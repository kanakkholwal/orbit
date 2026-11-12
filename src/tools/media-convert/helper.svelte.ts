import { BaseEngine } from '$lib/base-engine.svelte';
import { deviceProfile, formatCap } from '$lib/device-profile.svelte';
import { downloadMany } from '$lib/download-many';
import { cleanupStaleOutputs, getMediaFormat, MediaJob, type MediaFormatId, type MediaQuality } from '$lib/media/convert';
import { settings } from '$lib/settings/settings.svelte';
import { toast } from 'svelte-sonner';
import { getMediaDef, type MediaDef } from './defs';

export interface MediaItem {
    id: string;
    file: File;
    status: 'ready' | 'processing' | 'done' | 'error';
    /** 0 to 1 while processing. */
    progress: number;
    error?: string;
    result?: { blob: Blob; name: string; cleanup?: () => Promise<void> };
}

/** Video and audio conversion, one file at a time because each job already saturates the device. */
export class MediaConvertState extends BaseEngine {
    items = $state<MediaItem[]>([]);
    to = $state<MediaFormatId>('mp4');
    quality = $state<MediaQuality>('medium');
    maxHeight = $state<number | undefined>(undefined);
    /** Compress jobs are judged green or red by how much smaller the file got. */
    judged = $state(false);
    private current: MediaJob | null = null;
    private stopped = false;

    configure(slug: string) {
        const def = getMediaDef(slug);
        if (def) this.apply(def);
    }

    private apply(def: MediaDef) {
        this.to = def.to ?? (def.kind === 'audio' ? (settings.value.defaultFormats.audio as MediaFormatId) : (settings.value.defaultFormats.video as MediaFormatId));
        if (!getMediaFormat(this.to)) this.to = def.kind === 'audio' ? 'mp3' : 'mp4';
        this.quality = def.quality ?? 'medium';
        this.maxHeight = def.maxHeight;
        this.judged = def.judged ?? false;
        this.kind = def.kind;
    }

    get done() {
        return this.items.filter((i) => i.status === 'done' && i.result);
    }

    get totalSaved() {
        return this.done.reduce((sum, i) => sum + (i.file.size - (i.result?.blob.size ?? i.file.size)), 0);
    }

    /** Largest file this device is asked to convert, from its memory, cores and disk. */
    get cap() {
        return deviceProfile.capFor(this.kind);
    }

    kind: 'video' | 'audio' = 'video';

    async prepare() {
        await deviceProfile.init();
        void cleanupStaleOutputs();
    }

    addFiles(files: File[]) {
        const ok: File[] = [];
        for (const file of files) {
            if (file.size > this.cap) toast.error('File too large for this device', { description: `${file.name} is over ${formatCap(this.cap)}. Try a smaller file.` });
            else ok.push(file);
        }
        this.items.push(...ok.map((file) => ({ id: crypto.randomUUID(), file, status: 'ready' as const, progress: 0 })));
    }

    private release(item: MediaItem) {
        void item.result?.cleanup?.();
    }

    removeItem(id: string) {
        const item = this.items.find((i) => i.id === id);
        if (item) this.release(item);
        this.items = this.items.filter((i) => i.id !== id);
    }

    reset() {
        for (const i of this.items) this.release(i);
        this.items = [];
    }

    /** Changing the target format or quality makes finished results stale. */
    invalidate() {
        for (const i of this.items) {
            if (i.status === 'done' || i.status === 'error') {
                this.release(i);
                i.status = 'ready';
                i.result = undefined;
                i.progress = 0;
            }
        }
    }

    async process() {
        const queue = this.items.filter((i) => i.status !== 'done');
        if (queue.length === 0) return;
        this.isProcessing = true;
        this.stopped = false;
        this.progress = { current: 0, total: queue.length, text: 'Converting' };
        const format = getMediaFormat(this.to);

        for (const item of queue) {
            if (this.stopped) break;
            item.status = 'processing';
            item.progress = 0;
            try {
                this.current = new MediaJob(item.file, { to: this.to, quality: this.quality, maxHeight: this.maxHeight, stream: deviceProfile.streaming }, (p) => (item.progress = p));
                const { blob, cleanup } = await this.current.run();
                item.result = { cleanup, blob, name: settings.outputName(item.file.name, format?.id ?? this.to) };
                item.status = 'done';
            } catch (err) {
                item.status = this.stopped ? 'ready' : 'error';
                if (!this.stopped) item.error = err instanceof Error ? err.message : 'Failed';
            }
            this.progress.current += 1;
        }
        this.current = null;
        this.isProcessing = false;
    }

    async cancel() {
        this.stopped = true;
        await this.current?.cancel();
    }

    download(item: MediaItem) {
        if (item.result) this.downloadBlob(item.result.blob, item.result.name);
    }

    async downloadAll() {
        const files = this.done.flatMap((i) => (i.result ? [{ blob: i.result.blob, name: i.result.name }] : []));
        await downloadMany(files, 'orbit-media.zip', (blob, name) => this.downloadBlob(blob, name));
    }
}
