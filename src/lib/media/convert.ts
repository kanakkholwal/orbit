import type { Conversion, Quality } from 'mediabunny';

export type MediaFormatId = 'mp4' | 'webm' | 'mkv' | 'mov' | 'mp3' | 'wav' | 'ogg' | 'flac' | 'm4a';
export type MediaKind = 'video' | 'audio';
export type MediaQuality = 'high' | 'medium' | 'low';

export interface MediaFormat {
    id: MediaFormatId;
    label: string;
    kind: MediaKind;
    mime: string;
}

export const MEDIA_FORMATS: MediaFormat[] = [
    { id: 'mp4', label: 'MP4', kind: 'video', mime: 'video/mp4' },
    { id: 'webm', label: 'WebM', kind: 'video', mime: 'video/webm' },
    { id: 'mkv', label: 'MKV', kind: 'video', mime: 'video/x-matroska' },
    { id: 'mov', label: 'MOV', kind: 'video', mime: 'video/quicktime' },
    { id: 'mp3', label: 'MP3', kind: 'audio', mime: 'audio/mpeg' },
    { id: 'm4a', label: 'M4A', kind: 'audio', mime: 'audio/mp4' },
    { id: 'wav', label: 'WAV', kind: 'audio', mime: 'audio/wav' },
    { id: 'ogg', label: 'OGG', kind: 'audio', mime: 'audio/ogg' },
    { id: 'flac', label: 'FLAC', kind: 'audio', mime: 'audio/flac' }
];

export const getMediaFormat = (id: string) => MEDIA_FORMATS.find((f) => f.id === id);

export interface ConvertOptions {
    to: MediaFormatId;
    quality: MediaQuality;
    /** Shrinks video taller than this. Smaller videos are never scaled up. */
    maxHeight?: number;
    /** Write the output to a temporary file on disk (OPFS) instead of memory. */
    stream?: boolean;
}

export interface MediaResult {
    blob: Blob;
    /** Deletes the temporary file when the result is no longer needed. */
    cleanup?: () => Promise<void>;
}

const TEMP_PREFIX = 'orbit-';

/** Removes temporary output left behind by a closed tab or a crash. */
export async function cleanupStaleOutputs() {
    try {
        const root = await navigator.storage?.getDirectory?.();
        if (!root) return;
        for await (const name of (root as unknown as { keys(): AsyncIterable<string> }).keys()) {
            if (name.startsWith(TEMP_PREFIX) && !name.startsWith('orbit-probe')) await root.removeEntry(name).catch(() => {});
        }
    } catch {
        /* nothing to clean */
    }
}

async function openDiskSink(mb: typeof import('mediabunny'), ext: string) {
    const root = await navigator.storage.getDirectory();
    const name = `${TEMP_PREFIX}${crypto.randomUUID()}.${ext}`;
    const handle = await root.getFileHandle(name, { create: true });
    const file = await handle.createWritable();
    const writable = new WritableStream({
        write: (chunk) => file.write(chunk),
        close: () => file.close(),
        abort: (reason) => file.abort(reason)
    });
    return {
        target: new mb.StreamTarget(writable, { chunked: true, chunkSize: 16 * 1024 * 1024 }),
        read: () => handle.getFile(),
        remove: () => root.removeEntry(name).catch(() => {})
    };
}

type Mediabunny = typeof import('mediabunny');

function outputFormat(mb: Mediabunny, id: MediaFormatId) {
    switch (id) {
        case 'mp4':
        case 'm4a':
            return new mb.Mp4OutputFormat();
        case 'webm':
            return new mb.WebMOutputFormat();
        case 'mkv':
            return new mb.MkvOutputFormat();
        case 'mov':
            return new mb.MovOutputFormat();
        case 'mp3':
            return new mb.Mp3OutputFormat();
        case 'wav':
            return new mb.WavOutputFormat();
        case 'ogg':
            return new mb.OggOutputFormat();
        case 'flac':
            return new mb.FlacOutputFormat();
    }
}

/** Browsers rarely ship MP3 or FLAC encoders, so these load on demand. */
async function ensureEncoder(mb: Mediabunny, id: MediaFormatId) {
    if (id === 'mp3' && !(await mb.canEncodeAudio('mp3'))) {
        (await import('@mediabunny/mp3-encoder')).registerMp3Encoder();
    }
    if (id === 'flac' && !(await mb.canEncodeAudio('flac'))) {
        (await import('@mediabunny/flac-encoder')).registerFlacEncoder();
    }
}

const quality = (mb: Mediabunny, q: MediaQuality): Quality =>
    q === 'high' ? mb.QUALITY_HIGH : q === 'low' ? mb.QUALITY_LOW : mb.QUALITY_MEDIUM;

/** One conversion that can report progress and be cancelled. Output is held in memory. */
export class MediaJob {
    private conversion?: Conversion;

    constructor(
        private file: File,
        private opts: ConvertOptions,
        private onProgress: (fraction: number) => void
    ) {}

    async run(): Promise<MediaResult> {
        const mb = await import('mediabunny');
        const { to } = this.opts;
        const format = getMediaFormat(to);
        if (!format) throw new Error(`Unsupported format ${to}`);
        await ensureEncoder(mb, to);

        const input = new mb.Input({ source: new mb.BlobSource(this.file), formats: mb.ALL_FORMATS });
        let sink: Awaited<ReturnType<typeof openDiskSink>> | null = null;
        if (this.opts.stream) {
            try {
                sink = await openDiskSink(mb, to);
            } catch {
                sink = null;
            }
        }
        const buffer = sink ? null : new mb.BufferTarget();
        const output = new mb.Output({ format: outputFormat(mb, to), target: sink?.target ?? (buffer as InstanceType<typeof mb.BufferTarget>) });

        try {
            const q = quality(mb, this.opts.quality);
            let video: Record<string, unknown> = { discard: true };
            if (format.kind === 'video') {
                video = { quality: q };
                const max = this.opts.maxHeight;
                const track = max ? await input.getPrimaryVideoTrack() : null;
                if (max && track && track.displayHeight > max) video.height = max;
            }

            this.conversion = await mb.Conversion.init({ input, output, video, audio: { bitrate: q } });
            if (!this.conversion.isValid) {
                const reasons = this.conversion.discardedTracks.map((d) => d.reason).join(', ');
                throw new Error(`This browser cannot convert that file${reasons ? ` (${reasons})` : ''}.`);
            }
            this.conversion.onProgress = (p) => this.onProgress(p);
            await this.conversion.execute();
            if (sink) return { blob: await sink.read(), cleanup: sink.remove };
            if (!buffer?.buffer) throw new Error('The conversion produced no output.');
            return { blob: new Blob([buffer.buffer], { type: format.mime }) };
        } catch (err) {
            await sink?.remove();
            throw err;
        } finally {
            input.dispose();
        }
    }

    async cancel() {
        await this.conversion?.cancel();
    }
}
