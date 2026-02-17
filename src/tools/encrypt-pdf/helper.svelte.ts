
import {
    initializeQpdf
} from '$utils/helper';

export interface EncryptState {
    file: File | null;
    userPassword: string;
    ownerPassword: string;
    isProcessing: boolean;
    progress: string;
}

export class EncryptPdfState {
    // Reactive State
    state = $state<EncryptState>({
        file: null,
        userPassword: '',
        ownerPassword: '',
        isProcessing: false,
        progress: ''
    });

    // --- Actions ---

    setFile(file: File) {
        this.state.file = file;
    }

    removeFile() {
        this.state.file = null;
        this.state.userPassword = '';
        this.state.ownerPassword = '';
    }

    // --- Processing Logic ---

    async encrypt() {
        if (!this.state.file) return;
        if (!this.state.userPassword) {
            alert("Please enter a User Password to protect the PDF.");
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
            
            // Write to MEMFS
            qpdf.FS.writeFile(inputPath, new Uint8Array(arrayBuffer));

            // 3. Construct Command
            this.state.progress = 'Encrypting...';
            const userPwd = this.state.userPassword;
            const ownerPwd = this.state.ownerPassword || userPwd; // Fallback to user pwd if owner not set
            
            // Basic encryption args
            const args = [inputPath, '--encrypt', userPwd, ownerPwd, '256'];

            // Add restrictions only if a distinct owner password is set
            // (Standard behavior: owner pwd allows bypassing restrictions)
            if (this.state.ownerPassword && this.state.ownerPassword !== this.state.userPassword) {
                args.push(
                    '--modify=none',
                    '--extract=n',
                    '--print=none',
                    '--accessibility=n',
                    '--annotate=n',
                    '--assemble=n',
                    '--form=n',
                    '--modify-other=n'
                );
            }

            args.push('--', outputPath);

            // 4. Execute
            const result = qpdf.callMain(args);
            if (result !== 0) {
                throw new Error(`QPDF exited with code ${result}`);
            }

            // 5. Read Output & Download
            this.state.progress = 'Finalizing...';
            const outputFile = qpdf.FS.readFile(outputPath);
            
            const blob = new Blob([outputFile], { type: 'application/pdf' });
            this.downloadFile(blob, `encrypted_${this.state.file.name}`);

            // Cleanup MEMFS
            try {
                qpdf.FS.unlink(inputPath);
                qpdf.FS.unlink(outputPath);
            } catch (ignore) {}

        } catch (e: any) {
            console.error(e);
            alert(`Encryption failed: ${e.message}`);
        } finally {
            this.state.isProcessing = false;
        }
    }

    private downloadFile(blob: Blob, fileName: string) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
}