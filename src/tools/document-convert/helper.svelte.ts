import { BaseEngine } from '$lib/base-engine.svelte';
import { deviceProfile } from '$lib/device-profile.svelte';
import { downloadMany } from '$lib/download-many';
import { DocEngine, isPandocCached } from '$lib/docs/convert';
import { formatOf } from '$lib/docs/formats';
import { settings } from '$lib/settings/settings.svelte';
import { toast } from 'svelte-sonner';
import { getDocDef } from './defs';

export interface DocItem {
    id: string;
    file: File;
    status: 'ready' | 'processing' | 'done' | 'error';
    error?: string;
    result?: { blob: Blob; name: string };
}

/** Document conversion through pandoc running in a worker; the converter itself is a one-time download. */
export class DocConvertState extends BaseEngine {
    items = $state<DocItem[]>([]);
    to = $state('docx');
    /** True once the converter is stored on this device. */
    cached = $state(false);
    /** 0 to 1 while the converter downloads, null when the size is unknown, undefined when idle. */
    downloadFraction = $state<number | null | undefined>(undefined);
    private engine = new DocEngine();
    private stopped = false;

    configure(slug: string) {
        const def = getDocDef(slug);
        this.to = def?.to ?? 'docx';
    }

    async prepare() {
        await deviceProfile.init();
        this.cached = await isPandocCached();
    }

    get done() {
        return this.items.filter((i) => i.status === 'done' && i.result);
    }

    addFiles(files: File[]) {
        const ok: File[] = [];
        for (const file of files) {
            if (formatOf(file.name)?.reader) ok.push(file);
            else toast.error('Cannot open this file', { description: `${file.name} is not a document format this tool reads.` });
        }
        this.items.push(...ok.map((file) => ({ id: crypto.randomUUID(), file, status: 'ready' as const })));
    }

    removeItem(id: string) {
        this.items = this.items.filter((i) => i.id !== id);
    }

    reset() {
        this.items = [];
    }

    invalidate() {
        for (const i of this.items) {
            if (i.status === 'done' || i.status === 'error') {
                i.status = 'ready';
                i.result = undefined;
            }
        }
    }

    async process() {
        const queue = this.items.filter((i) => i.status !== 'done');
        if (queue.length === 0) return;
        this.isProcessing = true;
        this.stopped = false;
        this.progress = { current: 0, total: queue.length, text: 'Converting' };
        try {
            await this.engine.prepare((fraction) => (this.downloadFraction = fraction));
            this.downloadFraction = undefined;
            this.cached = true;
        } catch (err) {
            this.downloadFraction = undefined;
            this.isProcessing = false;
            if (!this.stopped) toast.error('Converter unavailable', { description: err instanceof Error ? err.message : 'Try again.' });
            return;
        }

        for (const item of queue) {
            if (this.stopped) break;
            item.status = 'processing';
            try {
                const result = await this.engine.convert(item.file, this.to);
                item.result = { blob: result.blob, name: result.name.endsWith('.zip') ? result.name : settings.outputName(item.file.name, this.to) };
                item.status = 'done';
            } catch (err) {
                item.status = this.stopped ? 'ready' : 'error';
                if (!this.stopped) item.error = err instanceof Error ? err.message : 'Failed';
            }
            this.progress.current += 1;
        }
        this.isProcessing = false;
    }

    cancel() {
        this.stopped = true;
        this.engine.dispose();
        this.downloadFraction = undefined;
    }

    destroy() {
        this.cancel();
        this.items = [];
    }

    download(item: DocItem) {
        if (item.result) this.downloadBlob(item.result.blob, item.result.name);
    }

    async downloadAll() {
        const files = this.done.flatMap((i) => (i.result ? [i.result] : []));
        await downloadMany(files, 'orbit-documents.zip', (blob, name) => this.downloadBlob(blob, name));
    }
}
