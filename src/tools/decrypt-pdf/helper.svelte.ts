
import { BaseEngine } from '$lib/base-engine.svelte';
import { initializeQpdf } from '$utils/helper';
import { toast } from 'svelte-sonner';

export interface DecryptState {
    file: File | null;
    password: string;
    isProcessing: boolean;
    progress: string;
}

export class DecryptPdfState extends BaseEngine {
    // Reactive State
    state = $state<DecryptState>({
        file: null,
        password: '',
        isProcessing: false,
        progress: ''
    });

// Actions

    setFile(file: File) {
        this.state.file = file;
    }

    removeFile() {
        this.state.file = null;
        this.state.password = '';
    }

// Processing Logic

    async decrypt() {
        if (!this.state.file) return;
        if (!this.state.password) {
            toast.error("Please enter the PDF password.");
            return;
        }

        this.state.isProcessing = true;
        this.state.progress = 'Initializing...';

        try {
            // 1. Load QPDF
            const qpdf = await initializeQpdf();
            
            // 2. Prepare Files
            this.state.progress = 'Reading PDF...';
            const arrayBuffer = await this.state.file.arrayBuffer();
            const inputPath = '/input.pdf';
            const outputPath = '/output.pdf';
            
            // Write input file to WASM virtual filesystem
            qpdf.FS.writeFile(inputPath, new Uint8Array(arrayBuffer));

            // 3. Construct Command
            this.state.progress = 'Decrypting...';
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
            this.state.progress = 'Finalizing...';
            try {
                const outputFile = qpdf.FS.readFile(outputPath);
                if (!outputFile || outputFile.length === 0) {
                    throw new Error("Decryption failed (empty output).");
                }
                
                const blob = new Blob([outputFile], { type: 'application/pdf' });
                this.downloadBlob(blob, `unlocked_${this.state.file.name}`);
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
            toast.error(`Decryption Failed: ${e.message}`);
        } finally {
            this.state.isProcessing = false;
        }
    }

}