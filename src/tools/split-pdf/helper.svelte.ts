import { PdfEngine } from '$lib/pdf-engine.svelte';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import type * as PDFJS from 'pdfjs-dist';

export const SPLIT_STATE_KEY = Symbol('SPLIT_STATE');

const RANGE_SYNTAX = /^\s*\d+\s*(-\s*\d+\s*)?(,\s*\d+\s*(-\s*\d+\s*)?)*,?\s*$/;

export type SplitMode = 'range' | 'extract' | 'visual' | 'n-times' | 'bookmarks';

export interface SplitResult {
  blob: Blob;
  name: string;
  kind: 'pdf' | 'zip';
  pages: number;
  parts: number;
}

export class SplitState extends PdfEngine {
  file = $state<File | null>(null);
  fileName = $state('');
  pageCount = $state(0);
  pdfDoc: PDFDocument | null = null;

  mode = $state<SplitMode>('visual');

  rangeInput = $state('');
  nTimesValue = $state(2);
  selectedPages = $state<Set<number>>(new Set());

  result = $state.raw<SplitResult | null>(null);

  private pdfJsDoc: PDFJS.PDFDocumentProxy | null = null;

  /** Explains why the typed page numbers can't be used, or returns null when they're fine. */
  get rangeIssue(): string | null {
    const text = this.rangeInput.trim();
    if (!text) return null;
    if (!RANGE_SYNTAX.test(text)) return 'Use page numbers and ranges, like 1-5, 8';
    const outOfRange = text.match(/\d+/g)?.some(n => Number(n) < 1 || Number(n) > this.pageCount);
    if (outOfRange) return `This file has ${this.pageCount} ${this.pageCount === 1 ? 'page' : 'pages'}`;
    return null;
  }

  get chunkSize() {
    return Math.max(1, Math.floor(this.nTimesValue || 0));
  }

  get nTimesIssue(): string | null {
    const n = Number(this.nTimesValue);
    if (!Number.isInteger(n) || n < 1) return 'Enter a whole number, 1 or more';
    if (n >= this.pageCount) return `Use a number smaller than ${this.pageCount} to get more than one file`;
    return null;
  }

  get partCount() {
    return Math.ceil(this.pageCount / this.chunkSize);
  }

  get resultFiles(): File[] {
    if (!this.result || this.result.kind !== 'pdf') return [];
    return [new File([this.result.blob], this.result.name, { type: 'application/pdf' })];
  }

  async loadFile(newFile: File) {
    if (!newFile) return;
    this.result = null;

    await this.handleProcess(async () => {
      const arrayBuffer = await newFile.arrayBuffer();

      this.pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      this.pageCount = this.pdfDoc.getPageCount();

      const pdfjs = await this.getPdfJs();
      const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer.slice(0)));
      this.pdfJsDoc = await loadingTask.promise;

      this.file = newFile;
      this.fileName = newFile.name;
      this.selectedPages = new Set();
      this.rangeInput = '';
    }, {
      loading: 'Opening PDF…',
      success: 'PDF ready',
      error: 'This PDF could not be opened. It might be password protected or damaged.'
    });
  }

  async renderThumbnail(canvas: HTMLCanvasElement, pageIndex: number) {
    if (!this.pdfJsDoc) return;
    await this.renderPageToCanvas(canvas, this.pdfJsDoc, pageIndex);
  }

  togglePageSelection(index: number) {
    const next = new Set(this.selectedPages);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    this.selectedPages = next;
    this.syncRangeFromSelection();
  }

  selectAll() {
    this.selectedPages = new Set(Array.from({ length: this.pageCount }, (_, i) => i));
    this.syncRangeFromSelection();
  }

  clearSelection() {
    this.selectedPages = new Set();
    this.syncRangeFromSelection();
  }

  setRangeInput(text: string) {
    this.rangeInput = text;
    this.selectedPages = new Set(this.parsePageRange(text, this.pageCount));
    this.result = null;
  }

  private syncRangeFromSelection() {
    const sorted = Array.from(this.selectedPages).sort((a, b) => a - b);
    const parts: string[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const start = sorted[i];
      while (sorted[i + 1] === sorted[i] + 1) i++;
      parts.push(start === sorted[i] ? `${start + 1}` : `${start + 1}-${sorted[i] + 1}`);
    }
    this.rangeInput = parts.join(', ');
    this.result = null;
  }

  async processSplit() {
    if (!this.pdfDoc || !this.file) return;
    this.result = null;

    await this.handleProcess(async () => {
      if (this.mode === 'range') {
        await this.splitByRange();
      } else if (this.mode === 'visual' || this.mode === 'extract') {
        await this.splitBySelection();
      } else if (this.mode === 'n-times') {
        await this.splitNTimes();
      }
    }, {
      loading: 'Splitting PDF…',
      success: 'PDF split',
      error: 'The PDF could not be split.'
    });
  }

  private async splitByRange() {
    const indices = this.parsePageRange(this.rangeInput, this.pageCount);
    if (indices.length === 0) throw new Error('Invalid page range');
    await this.extractPages(indices, `split_${this.fileName}`);
  }

  private async splitBySelection() {
    const indices = Array.from(this.selectedPages).sort((a, b) => a - b);
    if (indices.length === 0) throw new Error('No pages selected');
    await this.extractPages(indices, `selected_${this.fileName}`);
  }

  private async splitNTimes() {
    const n = this.chunkSize;
    const zip = new JSZip();
    const total = this.pageCount;
    const numChunks = Math.ceil(total / n);

    this.progress = { text: 'Making files', current: 0, total: numChunks };

    for (let i = 0; i < numChunks; i++) {
      const start = i * n;
      const end = Math.min(start + n, total);

      const newPdf = await PDFDocument.create();
      const indices = Array.from({ length: end - start }, (_, k) => start + k);
      const copiedPages = await newPdf.copyPages(this.pdfDoc!, indices);
      for (const p of copiedPages) newPdf.addPage(p);

      const pdfBytes = await newPdf.save();
      zip.file(`part_${i + 1}.pdf`, pdfBytes);

      this.progress = { text: 'Making files', current: i + 1, total: numChunks };
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const name = `split_every_${n}_pages.zip`;
    this.result = { blob: content, name, kind: 'zip', pages: total, parts: numChunks };
    this.downloadBlob(content, name);
  }

  private async extractPages(indices: number[], filename: string) {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(this.pdfDoc!, indices);
    for (const p of copiedPages) newPdf.addPage(p);

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    this.result = { blob, name: filename, kind: 'pdf', pages: indices.length, parts: 1 };
    this.downloadBlob(blob, filename);
  }

  downloadResult() {
    if (this.result) this.downloadBlob(this.result.blob, this.result.name);
  }

  reset() {
    this.file = null;
    this.pdfDoc = null;
    this.pdfJsDoc = null;
    this.rangeInput = '';
    this.selectedPages = new Set();
    this.result = null;
    this.progress = { text: '', current: 0, total: 0 };
  }
}
