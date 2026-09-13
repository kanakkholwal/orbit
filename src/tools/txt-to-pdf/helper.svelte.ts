import { PdfEngine } from '$lib/pdf-engine.svelte';
import { toast } from 'svelte-sonner';
import { buildTextPdf, type TextFont } from './layout';

const RTL_PATTERN = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u08A0-\u08FF\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]/;

export class TxtToPdfState extends PdfEngine {
  mode = $state<'upload' | 'text'>('upload');
  files = $state<{ id: string; file: File; originalSize: number }[]>([]);
  textContent = $state('');
  result = $state.raw<{ blob: Blob; name: string; mode: 'upload' | 'text'; source: string } | null>(null);

  settings = $state({
    fontFamily: 'helv' as TextFont,
    fontSize: 12,
    textColor: '#000000',
    pageSize: 'A4'
  });


  // Derived value to auto-detect text direction based on content
  textDirection = $derived(RTL_PATTERN.test(this.textContent) ? 'rtl' : 'ltr') as 'rtl' | 'ltr';

// Actions

  private validTextFiles(newFiles: File[]) {
    const validFiles = newFiles.filter(
      f => f.name.toLowerCase().endsWith('.txt') || f.type === 'text/plain'
    );
    if (validFiles.length < newFiles.length) {
      toast.error('Some files were skipped. Only text (.txt) files are allowed.');
    }
    return validFiles;
  }

  async openInEditor(newFiles: File[]) {
    const validFiles = this.validTextFiles(newFiles);
    if (validFiles.length === 0) return;
    const texts = await Promise.all(validFiles.map(f => f.text()));
    this.textContent = texts.join('\n\n');
  }

  addFiles(newFiles: File[]) {
    const validFiles = this.validTextFiles(newFiles);
    if (validFiles.length > 0) this.result = null;

    for (const f of validFiles) {
      this.files.push({ id: crypto.randomUUID(), file: f, originalSize: f.size });
    }
  }

  removeFile(id: string) {
    this.result = null;
    this.files = this.files.filter(f => f.id !== id);
  }

  get resultFiles(): File[] {
    return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
  }

  downloadResult() {
    if (this.result) this.downloadBlob(this.result.blob, this.result.name);
  }

  reset() {
    this.result = null;
    this.files = [];
    this.textContent = '';
    this.isProcessing = false;
  }


  async process() {
    if (this.mode === 'upload' && this.files.length === 0) {
      toast.error('Please select at least one text file.');
      return;
    }

    if (this.mode === 'text' && !this.textContent.trim()) {
      toast.error('Please enter some text to convert.');
      return;
    }

    const mode = this.mode;
    const source = this.textContent;
    this.progress.text = 'Reading text...';
    await this.handleProcess(async () => {
      const texts = mode === 'upload' ? await Promise.all(this.files.map((f) => f.file.text())) : [source];

      this.progress.text = 'Creating PDF...';
      const { bytes, replaced } = await buildTextPdf(texts, {
        font: this.settings.fontFamily,
        fontSize: this.settings.fontSize,
        textColor: this.settings.textColor,
        pageSize: this.settings.pageSize
      });

      let pdfBlob = new Blob([bytes as BlobPart], { type: 'application/pdf' });

      // The built-in fonts only cover Western scripts; PyMuPDF's fonts render Arabic, Hebrew, Cyrillic, CJK and more.
      if (replaced > 0) {
        this.progress.text = 'Loading fonts for your language...';
        const { loadPyMuPDF } = await import('$utils/pymupdf-loader');
        const pymupdf = await loadPyMuPDF();
        pdfBlob = await pymupdf.textToPdf(texts.join('\n\n'), {
          fontSize: this.settings.fontSize,
          pageSize: this.settings.pageSize.toLowerCase(),
          fontName: this.settings.fontFamily,
          textColor: this.settings.textColor,
          margins: 72
        });
      }
      this.result = { blob: pdfBlob, name: 'text_to_pdf.pdf', mode, source };
      this.downloadBlob(pdfBlob, 'text_to_pdf.pdf');
    }, {
      loading: 'Converting text to PDF...',
      success: 'PDF created successfully!',
      error: (e) => `Failed to convert text to PDF. ${e.message || ''}`
    }).catch(() => {});
  }


}