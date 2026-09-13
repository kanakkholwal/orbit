
import { PdfEngine } from '$lib/pdf-engine.svelte';
import { decryptPdfBytes, PdfPasswordError } from '$lib/pdf/unlock';
import { toast } from 'svelte-sonner';

export interface DecryptState {
    file: File | null;
    password: string;
    isProcessing: boolean;
    progress: string;
}

export class DecryptPdfState extends PdfEngine {
    // Reactive State
    state = $state<DecryptState>({
        file: null,
        password: '',
        isProcessing: false,
        progress: ''
    });

    result = $state.raw<{ blob: Blob; name: string } | null>(null);
    error = $state('');

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

// Actions

    setFile(file: File) {
        this.state.file = file;
    }

    removeFile() {
        this.state.file = null;
        this.state.password = '';
        this.result = null;
        this.error = '';
    }

// Processing Logic

    async decrypt() {
        if (!this.state.file) return;
        if (!this.state.password) {
            toast.error("Please enter the PDF password.");
            return;
        }

        this.state.isProcessing = true;
        this.isProcessing = true;
        this.result = null;
        this.error = '';
        this.state.progress = 'Getting ready…';

        try {
            this.state.progress = 'Removing the password…';
            const input = new Uint8Array(await this.state.file.arrayBuffer());
            const output = await decryptPdfBytes(input, this.state.password);

            this.state.progress = 'Saving…';
            const blob = new Blob([output as BlobPart], { type: 'application/pdf' });
            const name = `unlocked_${this.state.file.name}`;
            this.downloadBlob(blob, name);
            this.result = { blob, name };
        } catch (e: any) {
            console.error(e);
            const wrongPassword = e instanceof PdfPasswordError;
            this.error = wrongPassword
                ? 'That password did not unlock this file. Check it and try again.'
                : 'Orbit could not unlock this file. It may be damaged.';
            toast.error(wrongPassword ? 'Incorrect password.' : `Decryption failed: ${e.message}`);
        } finally {
            this.state.isProcessing = false;
            this.isProcessing = false;
        }
    }

}