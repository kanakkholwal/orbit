import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'svelte-sonner';

export interface ReverseFile {
  id: string;
  file: File;
  originalSize: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  pages?: number;
  resultBlob?: Blob;
  error?: string;
}

const outputName = (file: File) => `${file.name.replace(/\.pdf$/i, '')}_reversed.pdf`;

export class ReversePagesState extends PdfEngine {
  files = $state<ReverseFile[]>([]);

  addFiles(newFiles: File[]) {
    const validFiles = newFiles.filter(
      f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (validFiles.length < newFiles.length) {
      toast.error('Some files were skipped. Only PDF files are allowed.');
    }

    for (const f of validFiles) {
      this.files.push({ id: crypto.randomUUID(), file: f, originalSize: f.size, status: 'pending' });
    }
  }

  removeFile(id: string) {
    this.files = this.files.filter(f => f.id !== id);
  }

  reset() {
    this.files = [];
    this.isProcessing = false;
    this.progress = { current: 0, total: 0, text: '' };
  }

  get doneFiles() {
    return this.files.filter(f => f.status === 'done' && f.resultBlob);
  }

  get totalSize() {
    return this.files.reduce((sum, f) => sum + f.originalSize, 0);
  }

  get resultFiles(): File[] {
    return this.doneFiles.map(f => new File([f.resultBlob!], outputName(f.file), { type: 'application/pdf' }));
  }

  async process() {
    const queue = this.files.filter(f => f.status === 'pending');
    if (queue.length === 0) return;

    this.isProcessing = true;

    try {
      for (let i = 0; i < queue.length; i++) {
        const entry = queue[i];
        entry.status = 'processing';
        this.progress = { current: i + 1, total: queue.length, text: `Reversing ${entry.file.name}` };

        try {
          const pdfDoc = await PDFDocument.load(await entry.file.arrayBuffer(), {
            ignoreEncryption: true,
            throwOnInvalidObject: false
          });
          const newPdf = await PDFDocument.create();
          const pageCount = pdfDoc.getPageCount();
          const reversedIndices = Array.from({ length: pageCount }, (_, i) => pageCount - 1 - i);

          const copiedPages = await newPdf.copyPages(pdfDoc, reversedIndices);
          for (const page of copiedPages) newPdf.addPage(page);

          entry.resultBlob = new Blob([(await newPdf.save()) as BlobPart], { type: 'application/pdf' });
          entry.pages = pageCount;
          entry.status = 'done';
        } catch (e: any) {
          console.error('[Reverse Pages] Error:', e);
          entry.status = 'error';
          entry.error = 'Could not open this file';
        }
      }

      await this.downloadResults(queue.filter(f => f.status === 'done'));
    } catch (e: any) {
      console.error('[Reverse Pages] Error:', e);
      toast.error(`Error reversing pages: ${e.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  downloadOne(id: string) {
    const entry = this.doneFiles.find(f => f.id === id);
    if (entry) this.downloadBlob(entry.resultBlob!, outputName(entry.file));
  }

  async downloadResults(entries: ReverseFile[] = this.doneFiles) {
    const done = entries.filter(f => f.resultBlob);
    if (done.length === 0) return;

    if (done.length === 1) {
      this.downloadOne(done[0].id);
      return;
    }

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    for (const f of done) zip.file(outputName(f.file), await f.resultBlob!.arrayBuffer());
    this.downloadBlob(await zip.generateAsync({ type: 'blob' }), 'reversed_pdfs.zip');
  }
}
