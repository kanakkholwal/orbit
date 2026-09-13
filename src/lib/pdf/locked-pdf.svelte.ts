import { decryptPdfBytes, PdfPasswordError } from './unlock';

/** Holds a password-protected file while the user types its password. */
export class LockedPdf {
    file = $state.raw<File | null>(null);
    error = $state('');
    busy = $state(false);

    hold(file: File) {
        this.file = file;
        this.error = '';
        this.busy = false;
    }

    clear() {
        this.file = null;
        this.error = '';
        this.busy = false;
    }

    /** Resolves to an unlocked in-memory copy, or null with `error` set. The password is not kept. */
    async unlock(password: string): Promise<File | null> {
        const source = this.file;
        if (!source || !password || this.busy) return null;
        this.busy = true;
        this.error = '';
        try {
            const bytes = await decryptPdfBytes(new Uint8Array(await source.arrayBuffer()), password);
            return new File([bytes as BlobPart], source.name, { type: 'application/pdf', lastModified: source.lastModified });
        } catch (e) {
            if (!(e instanceof PdfPasswordError)) console.error(e);
            this.error = e instanceof PdfPasswordError
                ? 'That password did not unlock this file. Check it and try again.'
                : 'Orbit could not unlock this file. It may be damaged.';
            this.busy = false;
            return null;
        }
    }
}
