import type { WorkerRequest, WorkerResponse } from './pandoc.worker';

/** Version of the pandoc-wasm package this URL must match. */
const PANDOC_VERSION = '1.1.0';
/** unpkg has no 50 MB file cap (jsDelivr does), and the service worker caches it for offline use. */
export const PANDOC_WASM_URL = `https://unpkg.com/pandoc-wasm@${PANDOC_VERSION}/src/pandoc.wasm`;
export const PANDOC_WASM_MB = 58;

/** True when the converter is already stored on this device. */
export async function isPandocCached(): Promise<boolean> {
    if (typeof caches === 'undefined') return false;
    return !!(await caches.match(PANDOC_WASM_URL));
}

async function downloadWasm(onProgress: (fraction: number | null) => void): Promise<ArrayBuffer> {
    const response = await fetch(PANDOC_WASM_URL);
    if (!response.ok || !response.body) throw new Error('The converter could not be downloaded. Check your connection and try again.');
    const total = Number(response.headers.get('content-length')) || 0;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        onProgress(total ? received / total : null);
    }
    const out = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
        out.set(chunk, offset);
        offset += chunk.length;
    }
    return out.buffer;
}

export interface DocResult {
    blob: Blob;
    name: string;
}

/** One pandoc worker, loaded once and reused for every file in a session. */
export class DocEngine {
    private worker: Worker | null = null;
    private ready: Promise<void> | null = null;
    private pending = new Set<(error: Error) => void>();

    private request<T extends WorkerResponse>(message: WorkerRequest, transfer: Transferable[] = []): Promise<T> {
        const worker = this.worker;
        if (!worker) return Promise.reject(new Error('Cancelled'));
        return new Promise<T>((resolve, reject) => {
            const settle = () => {
                worker.removeEventListener('message', done);
                worker.removeEventListener('error', fail);
                this.pending.delete(reject);
            };
            const done = (event: MessageEvent<WorkerResponse>) => {
                settle();
                if (event.data.type === 'error') reject(new Error(event.data.error));
                else resolve(event.data as T);
            };
            const fail = (event: ErrorEvent) => {
                settle();
                reject(new Error(event.message || 'The converter stopped unexpectedly.'));
            };
            this.pending.add(reject);
            worker.addEventListener('message', done);
            worker.addEventListener('error', fail, { once: true });
            worker.postMessage(message, transfer);
        });
    }

    /** Downloads the converter if needed and starts it. Safe to call again. */
    prepare(onProgress: (fraction: number | null) => void): Promise<void> {
        return (this.ready ??= (async () => {
            this.worker = new Worker(new URL('./pandoc.worker.ts', import.meta.url), { type: 'module' });
            const wasm = await downloadWasm(onProgress);
            onProgress(null);
            await this.request({ type: 'load', wasm }, [wasm]);
        })().catch((err) => {
            this.dispose();
            throw err;
        }));
    }

    async convert(file: File, to: string): Promise<DocResult> {
        const response = await this.request<Extract<WorkerResponse, { type: 'done' }>>({ type: 'convert', file, to });
        return { blob: new Blob([response.buffer]), name: response.name };
    }

    /** Stops the worker immediately; the next prepare() starts a fresh one. */
    dispose() {
        for (const reject of this.pending) reject(new Error('Cancelled'));
        this.pending.clear();
        this.worker?.terminate();
        this.worker = null;
        this.ready = null;
    }
}
