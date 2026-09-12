import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument, PDFName } from 'pdf-lib';
import { toast } from 'svelte-sonner';

export interface RemoveAnnotationsStateData {
    file: File | null;
    pageCount: number;
    annotationCount: number;
    originalSize: number;
    isProcessing: boolean;
}

export class RemoveAnnotationsState extends PdfEngine {
    state = $state<RemoveAnnotationsStateData>({
        file: null,
        pageCount: 0,
        annotationCount: 0,
        originalSize: 0,
        isProcessing: false
    });

    result = $state.raw<{ blob: Blob; name: string; removed: number } | null>(null);

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    private pdfLibDoc: PDFDocument | null = null;

    // Actions

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
            this.state.annotationCount = this.pdfLibDoc
                .getPages()
                .reduce((sum, page) => sum + (page.node.Annots()?.size() ?? 0), 0);
            this.result = null;
        } catch (e) {
            console.error("Error loading PDF", e);
            toast.error("Failed to load the PDF file.");
        } finally {
            this.state.isProcessing = false;
        }
    }

    reset() {
        this.state.file = null;
        this.pdfLibDoc = null;
        this.state.pageCount = 0;
        this.state.annotationCount = 0;
        this.state.originalSize = 0;
        this.result = null;
    }

    // Processing

    async process() {
        if (!this.pdfLibDoc || !this.state.file) return;
        this.state.isProcessing = true;
        this.isProcessing = true;

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
            const name = `${originalName}_no_annotations.pdf`;
            this.downloadBlob(blob, name);
            this.result = { blob, name, removed: this.state.annotationCount };
            this.state.annotationCount = 0;

        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Could not remove annotations.");
        } finally {
            this.state.isProcessing = false;
            this.isProcessing = false;
        }
    }

}