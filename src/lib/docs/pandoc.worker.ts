import { createPandocInstance } from 'pandoc-wasm/core';
import { DOC_FORMATS, formatOf } from './formats';

type Instance = Awaited<ReturnType<typeof createPandocInstance>>;

export type WorkerRequest =
    | { type: 'load'; wasm: ArrayBuffer }
    | { type: 'convert'; file: File; to: string };

export type WorkerResponse =
    | { type: 'loaded' }
    | { type: 'done'; buffer: ArrayBuffer; name: string; zip: boolean }
    | { type: 'error'; error: string };

let instance: Promise<Instance> | null = null;
let wasm: ArrayBuffer | null = null;

const ensure = () => {
    if (!wasm) throw new Error('The converter is not loaded yet.');
    return (instance ??= createPandocInstance(wasm).catch((err: unknown) => {
        instance = null;
        throw err;
    }));
};

async function convert(file: File, to: string): Promise<WorkerResponse> {
    const from = formatOf(file.name);
    const target = DOC_FORMATS.find((f) => f.id === to);
    if (!from?.reader) return { type: 'error', error: `${file.name} is not a format this converter can open.` };
    if (!target?.writer) return { type: 'error', error: `Saving as ${to.toUpperCase()} is not supported.` };

    const pandoc = await ensure();
    const base = file.name.replace(/\.[^.]+$/, '');
    const outName = `${base}.${target.id}`;
    // A fixed temp name, so converting a file to its own format cannot overwrite the input.
    const fsOut = `orbit-output.${target.id}`;
    const options: Record<string, unknown> = {
        from: from.reader,
        to: target.writer,
        'input-files': [file.name],
        'output-file': fsOut,
        'extract-media': '.'
    };
    if (target.standalone) options.standalone = true;

    const result = await pandoc.convert(options, null, { [file.name]: file });
    const stderr = result.stderr.trim();
    if (stderr) return { type: 'error', error: stderr };
    const output = result.files[fsOut];
    if (!output) return { type: 'error', error: `Nothing was produced for ${from.label} to ${target.label}.` };

    const media = Object.entries(result.mediaFiles ?? {});
    if (media.length > 0) {
        // Documents with pictures come back as a ZIP so the images are kept next to the text.
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        zip.file(outName, output);
        for (const [name, blob] of media) zip.file(name, blob);
        const buffer = await zip.generateAsync({ type: 'arraybuffer' });
        return { type: 'done', buffer, name: `${base}.zip`, zip: true };
    }
    return { type: 'done', buffer: await output.arrayBuffer(), name: outName, zip: false };
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    const message = event.data;
    try {
        if (message.type === 'load') {
            wasm = message.wasm;
            await ensure();
            (self as unknown as Worker).postMessage({ type: 'loaded' } satisfies WorkerResponse);
            return;
        }
        const response = await convert(message.file, message.to);
        const transfer = response.type === 'done' ? [response.buffer] : [];
        (self as unknown as Worker).postMessage(response, transfer);
    } catch (err) {
        (self as unknown as Worker).postMessage({ type: 'error', error: err instanceof Error ? err.message : String(err) } satisfies WorkerResponse);
    }
};
