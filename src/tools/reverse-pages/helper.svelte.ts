import { BaseEngine } from '$lib/base-engine.svelte';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'svelte-sonner';

export class ReversePagesState extends BaseEngine {
  files = $state<{ id: string; file: File; originalSize: number }[]>([]);



  addFiles(newFiles: File[]) {
    const validFiles = newFiles.filter(
      f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (validFiles.length < newFiles.length) {
      toast.error('Some files were skipped. Only PDF files are allowed.');
    }

    for (const f of validFiles) {
      this.files.push({ id: crypto.randomUUID(), file: f, originalSize: f.size });
    }
  }

  removeFile(id: string) {
    this.files = this.files.filter(f => f.id !== id);
  }

  reset() {
    this.files = [];
    this.isProcessing = false;
    this.progress.text = '';
  }

  //  Processing 

  async process() {
    if (this.files.length === 0) return;

    this.isProcessing = true;
    this.progress.text = 'Reversing page order...';

    this.handleProcess(async () => {
      let zip: any;
      if (this.files.length > 1) {
        // Lazy load JSZip only if multiple files are selected
        const JSZip = (await import('jszip')).default;
        zip = new JSZip();
      }

      for (let j = 0; j < this.files.length; j++) {
        const fileObj = this.files[j];
        if (this.files.length > 1) {
          this.progress.text = `Processing ${fileObj.file.name} (${j + 1}/${this.files.length})...`;
        } else {
          this.progress.text = `Processing ${fileObj.file.name}...`;
        }

        const arrayBuffer = await fileObj.file.arrayBuffer();

        // Load original PDF
        const pdfDoc = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
          throwOnInvalidObject: false
        });

        // Create a new blank PDF
        const newPdf = await PDFDocument.create();

        // Generate reversed indices array: e.g. [2, 1, 0]
        const pageCount = pdfDoc.getPageCount();
        const reversedIndices = Array.from({ length: pageCount }, (_, i) => pageCount - 1 - i);

        // Copy and add pages in the reversed order
        const copiedPages = await newPdf.copyPages(pdfDoc, reversedIndices);
        copiedPages.forEach(page => newPdf.addPage(page));

        const newPdfBytes = await newPdf.save();
        const originalName = fileObj.file.name.replace(/\.pdf$/i, '');
        const fileName = `${originalName}_reversed.pdf`;

        if (this.files.length === 1) {
          // Single file -> Download immediately
          const blob = new Blob([newPdfBytes as BlobPart], { type: 'application/pdf' });
          this.downloadBlob(blob, fileName);
        } else {
          // Multiple files -> Add to ZIP
          zip.file(fileName, newPdfBytes);
        }
      }

      if (this.files.length > 1) {
        this.progress.text = 'Creating ZIP archive...';
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        this.downloadBlob(zipBlob, 'reversed_pdfs.zip');
      }
    }, {
      loading: 'Reversing pages...',
      success: 'Pages reversed successfully!',
      error: (e: any) => `Error reversing pages: ${e.message}`
    })

  }


}