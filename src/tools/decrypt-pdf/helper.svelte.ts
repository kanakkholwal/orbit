
import { PdfEngine } from '$lib/pdf-engine.svelte';
import { initializeQpdf } from '$utils/helper';
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
            // 1. Load QPDF
            const qpdf = await initializeQpdf();
            
            // 2. Prepare Files
            this.state.progress = 'Reading your PDF…';
            const arrayBuffer = await this.state.file.arrayBuffer();
            const inputPath = '/input.pdf';
            const outputPath = '/output.pdf';
            
            // Write input file to WASM virtual filesystem
            qpdf.FS.writeFile(inputPath, new Uint8Array(arrayBuffer));

            // 3. Construct Command
            this.state.progress = 'Removing the password…';
            // qpdf input.pdf --password=SECRET --decrypt output.pdf
            const args = [
                inputPath, 
                '--password=' + this.state.password, 
                '--decrypt', 
                outputPath
            ];

            // 4. Execute
            // qpdf usually throws an error or exit code if password is wrong
            try {
                const exitCode = qpdf.callMain(args);
                if (exitCode !== 0) {
                    // Check for specific error message if captured, otherwise assume password/file error
                    throw new Error("Invalid password or corrupt file.");
                }
            } catch (e: any) {
                // Catch WASM-level errors
                if (e.message?.includes('password')) {
                    throw new Error("Incorrect Password.");
                }
                throw e;
            }

            // 5. Read Output
            this.state.progress = 'Saving…';
            try {
                const outputFile = qpdf.FS.readFile(outputPath);
                if (!outputFile || outputFile.length === 0) {
                    throw new Error("Decryption failed (empty output).");
                }
                
                const blob = new Blob([outputFile], { type: 'application/pdf' });
                const name = `unlocked_${this.state.file.name}`;
                this.downloadBlob(blob, name);
                this.result = { blob, name };
            } catch (readError) {
                // If readFile fails, it means QPDF didn't write the output (likely invalid password)
                throw new Error("Incorrect Password or Decryption Failed.");
            }

            // Cleanup
            try {
                qpdf.FS.unlink(inputPath);
                qpdf.FS.unlink(outputPath);
            } catch (ignore) {}

        } catch (e: any) {
            console.error(e);
            this.error = /password/i.test(e?.message ?? '')
                ? 'That password did not unlock this file. Check it and try again.'
                : 'Orbit could not unlock this file. It may be damaged.';
            toast.error(`Decryption Failed: ${e.message}`);
        } finally {
            this.state.isProcessing = false;
            this.isProcessing = false;
        }
    }

}