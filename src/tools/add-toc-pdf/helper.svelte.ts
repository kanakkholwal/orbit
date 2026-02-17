
export interface TocStateData {
    file: File | null;
    title: string;
    fontSize: string;
    fontFamily: string;
    addBookmark: boolean;
    isProcessing: boolean;
    progress: string;
}

export class TableOfContentsState {
    state = $state<TocStateData>({
        file: null,
        title: 'Table of Contents',
        fontSize: '12',
        fontFamily: '4', 
        addBookmark: true,
        isProcessing: false,
        progress: ''
    });

    private worker: Worker | null = null;

    loadFile(file: File) {
        if (!file) return;
        this.state.file = file;
    }

    reset() {
        this.state.file = null;
        this.state.isProcessing = false;
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }

    async generateTOC() {
        if (!this.state.file) return;
        
        this.state.isProcessing = true;
        this.state.progress = 'Initializing...';

        try {
            if (!this.worker) {
                // 1. Fetch the library code in the Main Thread
                // This bypasses Worker restrictions and CORS issues often encountered inside workers
                this.state.progress = 'Downloading Library...';
                const libUrl = await this.fetchLibraryUrl();
                
                // 2. Create the worker with the local Blob URL
                this.worker = this.createInlineWorker(libUrl);
                this.worker.onmessage = this.handleWorkerMessage.bind(this);
                this.worker.onerror = this.handleWorkerError.bind(this);
            }

            const arrayBuffer = await this.state.file.arrayBuffer();

            this.state.progress = 'Generating Table of Contents...';
            
            const message = {
                command: 'generate-toc',
                pdfData: arrayBuffer,
                title: this.state.title,
                fontSize: parseInt(this.state.fontSize, 10),
                fontFamily: parseInt(this.state.fontFamily, 10),
                addBookmark: this.state.addBookmark
            };

            this.worker.postMessage(message, [arrayBuffer]);

        } catch (e: any) {
            console.error(e);
            alert(`Error: ${e.message}`);
            this.state.isProcessing = false;
        }
    }

    // --- Helper: Fetch Library locally and convert to Blob ---
    private async fetchLibraryUrl(): Promise<string> {
        const cdnUrl = 'https://cdn.jsdelivr.net/npm/coherentpdf/dist/coherentpdf.min.js';
        
        const response = await fetch(cdnUrl);
        if (!response.ok) throw new Error("Failed to download PDF library");
        
        const text = await response.text();
        const blob = new Blob([text], { type: 'application/javascript' });
        return URL.createObjectURL(blob);
    }

    // --- Inline Worker Creation ---
    private createInlineWorker(localLibUrl: string): Worker {
        const workerCode = `
            // Load CoherentPDF from the local Blob URL we created
            importScripts('${localLibUrl}');

            self.onmessage = async (e) => {
                const { command, pdfData, title, fontSize, fontFamily, addBookmark } = e.data;

                if (command !== 'generate-toc') return;

                try {
                    // Initialize CPDF
                    // Note: We point to the WASM file on the CDN explicitly
                    const cpdf = await self.coherentpdf.create({
                    });

                    // Load PDF
                    const pdfBytes = new Uint8Array(pdfData);
                    
                    // Write to virtual FS
                    const inputName = '/input.pdf';
                    const outputName = '/output.pdf';
                    cpdf.FS.writeFile(inputName, pdfBytes);

                    // Construct Arguments
                    const args = [
                        '-add-text-toc', 
                        '-toc-title', title, 
                        '-font-size', String(fontSize),
                        inputName, 
                        '-o', outputName
                    ];

                    if (addBookmark) {
                        args.splice(1, 0, '-toc-bookmark');
                    }

                    // Run CPDF
                    const exitCode = cpdf.run(args);
                    
                    if (exitCode !== 0) {
                        throw new Error('CPDF exited with code ' + exitCode);
                    }

                    // Read Result
                    const resultBytes = cpdf.FS.readFile(outputName);
                    
                    // Cleanup
                    try { cpdf.FS.unlink(inputName); cpdf.FS.unlink(outputName); } catch(e) {}

                    // Return Success
                    self.postMessage(
                        { status: 'success', pdfBytes: resultBytes.buffer }, 
                        [resultBytes.buffer]
                    );

                } catch (error) {
                    console.error(error);
                    self.postMessage({ 
                        status: 'error', 
                        message: error.message || 'Unknown worker error' 
                    });
                }
            };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        return new Worker(URL.createObjectURL(blob));
    }

    private handleWorkerMessage(e: MessageEvent) {
        if (e.data.status === 'success') {
            this.state.progress = 'Downloading...';
            
            const pdfBytes = new Uint8Array(e.data.pdfBytes);
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const name = this.state.file?.name.replace('.pdf', '_toc.pdf') || 'document_toc.pdf';
            
            this.downloadFile(blob, name);
            this.state.isProcessing = false;
            
        } else if (e.data.status === 'error') {
            console.error("Worker Error:", e.data.message);
            alert(`Generation Failed: ${e.data.message}`);
            this.state.isProcessing = false;
        }
    }

    private handleWorkerError(e: ErrorEvent) {
        console.error("Worker System Error:", e);
        // Don't alert here immediately as the explicit error message usually follows
        this.state.isProcessing = false;
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