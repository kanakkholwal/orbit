import { browser } from '$app/environment';

/**
 * Native file-drop bridge for Tauri.
 *
 * On desktop, Tauri's native drag-drop intercepts the webview's HTML5
 * drag/drop, so `UploadArea`'s `ondrop` never fires. Instead Tauri emits
 * `onDragDropEvent` with file *paths*. This module listens once, reads those
 * paths from disk, rebuilds `File` objects, and hands them to whichever intake
 * handler is currently active (last registered wins — i.e. the visible tool's
 * upload area). On web this module is inert.
 */

type Handler = (files: File[]) => void;

export const fileDropState = $state({ isDragging: false });

const handlers: Handler[] = [];
let initialized = false;

/** Register an intake handler (e.g. the active UploadArea). Returns an unregister fn. */
export function registerFileDrop(handler: Handler): () => void {
    handlers.push(handler);
    return () => {
        const i = handlers.indexOf(handler);
        if (i !== -1) handlers.splice(i, 1);
    };
}

const MIME: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    heic: 'image/heic',
    txt: 'text/plain',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

function mimeFor(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    return MIME[ext] ?? 'application/octet-stream';
}

async function pathsToFiles(paths: string[]): Promise<File[]> {
    const { readFile } = await import('@tauri-apps/plugin-fs');
    const files: File[] = [];
    for (const path of paths) {
        try {
            const bytes = await readFile(path);
            const name = path.split(/[\\/]/).pop() || 'file';
            files.push(new File([bytes as BlobPart], name, { type: mimeFor(name) }));
        } catch (e) {
            console.error('file-drop: failed to read', path, e);
        }
    }
    return files;
}

/** Wire up the Tauri drag-drop listener once. No-op on web. Returns a teardown fn. */
export async function initTauriFileDrop(): Promise<() => void> {
    if (!browser || initialized) return () => {};
    initialized = true;
    try {
        const { getCurrentWebview } = await import('@tauri-apps/api/webview');
        const unlisten = await getCurrentWebview().onDragDropEvent(async (event) => {
            const payload = event.payload;
            if (payload.type === 'enter' || payload.type === 'over') {
                fileDropState.isDragging = true;
            } else if (payload.type === 'leave') {
                fileDropState.isDragging = false;
            } else if (payload.type === 'drop') {
                fileDropState.isDragging = false;
                const paths = payload.paths ?? [];
                if (!paths.length || !handlers.length) return;
                const files = await pathsToFiles(paths);
                if (files.length) handlers[handlers.length - 1](files);
            }
        });
        return () => {
            unlisten();
            initialized = false;
        };
    } catch (e) {
        console.error('file-drop: init failed', e);
        initialized = false;
        return () => {};
    }
}
