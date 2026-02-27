import { BaseEngine } from '$lib/base-engine.svelte';
import { loadPyMuPDF } from '$utils/pymupdf-loader';
import { toast } from 'svelte-sonner';

const RTL_PATTERN = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u08A0-\u08FF\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]/;

export class TxtToPdfState extends BaseEngine {
  mode = $state<'upload' | 'text'>('upload');
  files = $state<{ id: string; file: File; originalSize: number }[]>([]);
  textContent = $state('');

  settings = $state({
    fontFamily: 'helv',
    fontSize: 12,
    textColor: '#000000',
    pageSize: 'A4'
  });


  // Derived value to auto-detect text direction based on content
  textDirection = $derived(RTL_PATTERN.test(this.textContent) ? 'rtl' : 'ltr') as 'rtl' | 'ltr';

  // --- Actions ---

  addFiles(newFiles: File[]) {
    const validFiles = newFiles.filter(
      f => f.name.toLowerCase().endsWith('.txt') || f.type === 'text/plain'
    );

    if (validFiles.length < newFiles.length) {
      alert('Some files were skipped. Only text (.txt) files are allowed.');
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

    this.progress.text = 'Loading engine...';
    this.handleProcess(async () => {
      const pymupdf = await loadPyMuPDF();
      let finalContent = '';

      if (this.mode === 'upload') {
        this.progress.text = 'Reading files...';
        for (const fileObj of this.files) {
          const text = await fileObj.file.text();
          finalContent += text + '\n\n';
        }
      } else {
        finalContent = this.textContent;
      }

      this.progress.text = 'Creating PDF...';

      const pdfBlob = await pymupdf.textToPdf(finalContent, {
        fontSize: this.settings.fontSize,
        pageSize: this.settings.pageSize.toLowerCase() as any, // 'a4', 'letter', etc.
        fontName: this.settings.fontFamily as any,
        textColor: this.settings.textColor,
        margins: 72,
      });

      this.downloadBlob(pdfBlob, 'text_to_pdf.pdf');
    }, {
      loading: 'Converting text to PDF...',
      success: 'PDF created successfully!',
      error: (e) => `Failed to convert text to PDF. ${e.message || ''}`
    })

  }


}