import { deviceProfile } from '$lib/device-profile.svelte';
import { toast } from 'svelte-sonner';

export interface NamedBlob {
    blob: Blob;
    name: string;
}

/** `photo.jpg` taken twice becomes `photo-2.jpg`. */
function uniqueName(name: string, used: Set<string>): string {
    let out = name;
    for (let n = 2; used.has(out); n++) out = name.replace(/(\.[^.]+)?$/, `-${n}$1`);
    used.add(out);
    return out;
}

/**
 * Saves one file directly, or several as a ZIP. A ZIP is built in memory, so batches larger
 * than this device's cap are saved one by one instead.
 */
export async function downloadMany(files: NamedBlob[], zipName: string, save: (blob: Blob, name: string) => void) {
    if (files.length === 0) return;
    if (files.length === 1) return save(files[0].blob, files[0].name);

    const total = files.reduce((sum, f) => sum + f.blob.size, 0);
    if (total > deviceProfile.capFor('zip')) {
        toast.info('Saving one by one', { description: 'These files are large, so they download individually instead of as a ZIP.' });
        for (const file of files) save(file.blob, file.name);
        return;
    }

    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    const used = new Set<string>();
    for (const file of files) zip.file(uniqueName(file.name, used), file.blob);
    save(await zip.generateAsync({ type: 'blob' }), zipName);
}
