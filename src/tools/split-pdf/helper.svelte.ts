import { PdfEngine } from '$lib/pdf-engine.svelte';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import type * as PDFJS from 'pdfjs-dist';

export const SPLIT_STATE_KEY = Symbol('SPLIT_STATE');

export type SplitMode = 'range' | 'extract' | 'visual' | 'n-times' | 'bookmarks';

export class SplitState extends PdfEngine {
  file = $state<File | null>(null);
  fileName = $state('');
  pageCount = $state(0);
  pdfDoc: PDFDocument | null = null;

  // UI States
  mode = $state<SplitMode>('range');

  // Mode Specific Inputs
  rangeInput = $state(''); // e.g. "1-5, 8"
  nTimesValue = $state(2); // Split every N pages
  selectedPages = $state<Set<number>>(new Set()); // For Visual Mode

  private pdfJsDoc: PDFJS.PDFDocumentProxy | null = null;



  async loadFile(newFile: File) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.progress = { text: 'Loading PDF...', current: 10, total: 100 };

    try {
      const arrayBuffer = await newFile.arrayBuffer();

      // 1. Load pdf-lib (for splitting)
      this.pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      this.pageCount = this.pdfDoc.getPageCount();

      // 2. Load PDF.js (for thumbnails)
      const pdfjs = await this.getPdfJs();
      const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer.slice(0)));
      this.pdfJsDoc = await loadingTask.promise;

      this.file = newFile;
      this.fileName = newFile.name;
      this.selectedPages.clear();
      this.rangeInput = '';

    } catch (error) {
      console.error(error);
      alert("Failed to load PDF. It might be password protected or corrupted.");
    } finally {
      this.isProcessing = false;
    }
  }

  async renderThumbnail(canvas: HTMLCanvasElement, pageIndex: number) {
    if (!this.pdfJsDoc) return;
    await this.renderPageToCanvas(canvas, this.pdfJsDoc, pageIndex);
  }

  togglePageSelection(index: number) {
    if (this.selectedPages.has(index)) {
      this.selectedPages.delete(index);
    } else {
      this.selectedPages.add(index);
    }
    this.selectedPages = new Set(this.selectedPages); // Reactivity trigger
  }

  // --- Split Logic ---

  async processSplit() {
    if (!this.pdfDoc || !this.file) return;
    this.isProcessing = true;
    this.progress = { text: 'Splitting...', current: 0, total: 100 };

    try {
      if (this.mode === 'range') {
        await this.splitByRange();
      } else if (this.mode === 'visual' || this.mode === 'extract') {
        await this.splitBySelection();
      } else if (this.mode === 'n-times') {
        await this.splitNTimes();
      }
      // Add 'bookmarks' logic if needed later (requires complex parsing)
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error splitting PDF");
    } finally {
      this.isProcessing = false;
    }
  }

  private async splitByRange() {
    const indices = this.parsePageRange(this.rangeInput, this.pageCount);
    if (indices.length === 0) throw new Error("Invalid page range");

    // Extract specific pages into ONE new file (Standard "Extract" behavior)
    // Or if the user wanted separate files per range, logic differs. 
    // Usually "Split by Range" implies extracting those pages.
    await this.extractPages(indices, `split_${this.fileName}`);
  }

  private async splitBySelection() {
    const indices = Array.from(this.selectedPages).sort((a, b) => a - b);
    if (indices.length === 0) throw new Error("No pages selected");
    await this.extractPages(indices, `selected_${this.fileName}`);
  }

  private async splitNTimes() {
    const n = Math.max(1, Math.floor(this.nTimesValue));
    const zip = new JSZip();
    const total = this.pageCount;
    const numChunks = Math.ceil(total / n);

    this.progress = { text: 'Creating chunks...', current: 10, total: 100 };

    for (let i = 0; i < numChunks; i++) {
      const start = i * n;
      const end = Math.min(start + n, total);

      // Create new PDF for this chunk
      const newPdf = await PDFDocument.create();
      const indices = Array.from({ length: end - start }, (_, k) => start + k);
      const copiedPages = await newPdf.copyPages(this.pdfDoc!, indices);
      copiedPages.forEach(p => newPdf.addPage(p));

      const pdfBytes = await newPdf.save();
      zip.file(`part_${i + 1}.pdf`, pdfBytes);

      this.progress = { text: `Processing part ${i + 1}/${numChunks}`, current: Math.floor(10 + ((i / numChunks) * 80)), total: 100 };
    }

    const content = await zip.generateAsync({ type: "blob" });
    this.downloadBlob(content, `split_every_${n}_pages.zip`);
  }

  private async extractPages(indices: number[], filename: string) {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(this.pdfDoc!, indices);
    copiedPages.forEach(p => newPdf.addPage(p));

    const pdfBytes = await newPdf.save();
    this.downloadBlob(new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }), filename);
  }



  reset() {
    this.file = null;
    this.pdfDoc = null;
    this.pdfJsDoc = null;
    this.rangeInput = '';
    this.selectedPages.clear();
  }
}