import { PDFDocument, PDFName } from 'pdf-lib';

export interface RemoveAnnotationsStateData {
    file: File | null;
    pageCount: number;
    originalSize: number;
    isProcessing: boolean;
}

export class RemoveAnnotationsState {
    state = $state<RemoveAnnotationsStateData>({
        file: null,
        pageCount: 0,
        originalSize: 0,
        isProcessing: false
    });

    private pdfLibDoc: PDFDocument | null = null;

    // --- Actions ---

    async loadFile(files: File[]) {
        if (!files || files.length === 0) return;
        const file = files[0];
        
        this.state.isProcessing = true;
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.pdfLibDoc = await PDFDocument.load(arrayBuffer);
            
            this.state.file = file;
            this.state.originalSize = file.size;
            this.state.pageCount = this.pdfLibDoc.getPageCount();
        } catch (e) {
            console.error("Error loading PDF", e);
            alert("Failed to load the PDF file.");
        } finally {
            this.state.isProcessing = false;
        }
    }

    reset() {
        this.state.file = null;
        this.pdfLibDoc = null;
        this.state.pageCount = 0;
        this.state.originalSize = 0;
    }

    // --- Processing ---

    async process() {
        if (!this.pdfLibDoc || !this.state.file) return;
        this.state.isProcessing = true;

        try {
            const pages = this.pdfLibDoc.getPages();

            // Iterate through all pages and delete the annotations dictionary
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                // Check if the page has annotations
                const annotRefs = page.node.Annots()?.asArray() || [];
                if (annotRefs.length > 0) {
                    // Delete the entire 'Annots' entry from the page dictionary
                    page.node.delete(PDFName.of('Annots'));
                }
            }

            const newPdfBytes = await this.pdfLibDoc.save();
            const blob = new Blob([newPdfBytes as BlobPart], { type: 'application/pdf' });
            
            const originalName = this.state.file.name.replace('.pdf', '');
            this.downloadFile(blob, `${originalName}_no_annotations.pdf`);

        } catch (e: any) {
            console.error(e);
            alert(e.message || "Could not remove annotations.");
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