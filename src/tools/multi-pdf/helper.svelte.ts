import { PdfEngine } from '$lib/pdf-engine.svelte';
import { repairPdfFile } from '$utils/repair-pdf';
import JSZip from 'jszip';
import { nanoid } from 'nanoid';
import { degrees, PDFDocument as PDFLibDocument } from 'pdf-lib';


import type * as PDFJS from 'pdfjs-dist';
import { toast } from 'svelte-sonner';

export interface PageData {
  id: string;
  pdfIndex: number;
  pageIndex: number;
  rotation: number;
  visualRotation: number;
  originalPageIndex: number;
  fileName: string;
}

type Snapshot = {
  pages: PageData[];
  selectedIds: string[];
  splitMarkers: string[];
};


// Context Key for passing state to children
export const PDF_STATE_KEY = Symbol('MULTI_PDF_STATE');


export class PdfEditorState extends PdfEngine {
  pages = $state<PageData[]>([]);
  selectedIds = $state<Set<string>>(new Set());
  splitMarkers = $state<Set<string>>(new Set());

  // Non-reactive internal storage
  pdfLibDocs: PDFLibDocument[] = [];

  private pdfJsDocs: PDFJS.PDFDocumentProxy[] = [];

  loader = $state({ show: false, progress: 0, text: '' });

  private undoStack: Snapshot[] = [];
  private redoStack: Snapshot[] = [];
  canUndo = $state(false);
  canRedo = $state(false);
  result = $state.raw<{ blob: Blob; name: string; documents: number } | null>(null);

  private syncHistory() {
    this.canUndo = this.undoStack.length > 0;
    this.canRedo = this.redoStack.length > 0;
    this.result = null;
  }



// Actions
  snapshot() {
    const snap: Snapshot = {
      pages: $state.snapshot(this.pages),
      selectedIds: Array.from(this.selectedIds),
      splitMarkers: Array.from(this.splitMarkers),
    };
    this.undoStack.push(snap);
    this.redoStack = [];
    this.syncHistory();
  }

  restore(snap: Snapshot) {
    this.pages = snap.pages.map(p => ({ ...p }));
    this.selectedIds = new Set(snap.selectedIds);
    this.splitMarkers = new Set(snap.splitMarkers);
  }

  undo() {
    const last = this.undoStack.pop();
    if (last) {
      this.redoStack.push({
        pages: $state.snapshot(this.pages),
        selectedIds: Array.from(this.selectedIds),
        splitMarkers: Array.from(this.splitMarkers),
      });
      this.restore(last);
    }
    this.syncHistory();
  }

  redo() {
    const next = this.redoStack.pop();
    if (next) {
      this.undoStack.push({
        pages: $state.snapshot(this.pages),
        selectedIds: Array.from(this.selectedIds),
        splitMarkers: Array.from(this.splitMarkers),
      });
      this.restore(next);
    }
    this.syncHistory();
  }

  async loadPdfs(files: File[]) {
    if (this.loader.show) return;
    this.snapshot();
    this.loader.show = true;
    this.loader.progress = 0;

    try {
      const pdfjs = await this.getPdfJs();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.loader.text = `Processing ${file.name}...`;
        this.loader.progress = Math.round((i / files.length) * 100);

        let arrayBuffer: ArrayBuffer;
        try {
          const repaired = await repairPdfFile(file);
          arrayBuffer = (repaired ? repaired.buffer : await file.arrayBuffer()) as ArrayBuffer;
        } catch (e) {
          console.warn('Repair failed, using original', e);
          arrayBuffer = await file.arrayBuffer();
        }

        const pdfLibDoc = await PDFLibDocument.load(arrayBuffer, { ignoreEncryption: true });
        this.pdfLibDocs.push(pdfLibDoc);
        const pdfIndex = this.pdfLibDocs.length - 1;

        const pdfBytes = await pdfLibDoc.save();
        const loadingTask = pdfjs.getDocument(new Uint8Array(pdfBytes));
        const pdfJsDoc = await loadingTask.promise;

        this.pdfJsDocs.push(pdfJsDoc);

        const newPages: PageData[] = [];
        for (let j = 0; j < pdfLibDoc.getPageCount(); j++) {
          newPages.push({
            id: nanoid(),
            pdfIndex,
            pageIndex: j,
            originalPageIndex: j,
            rotation: 0,
            visualRotation: 0,
            fileName: file.name,
          });
        }
        this.pages.push(...newPages);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load PDF');
    } finally {
      this.loader.show = false;
    }
  }




  //  Manipulation 
  toggleSelection(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.selectedIds = new Set(this.selectedIds);
  }

  selectAll() {
    for (const p of this.pages) this.selectedIds.add(p.id);
    this.selectedIds = new Set(this.selectedIds);
  }

  deselectAll() {
    this.selectedIds.clear();
    this.selectedIds = new Set(this.selectedIds);
  }

  rotatePage(id: string, delta: number) {
    this.snapshot();
    const page = this.pages.find(p => p.id === id);
    if (page) {
      page.visualRotation = (page.visualRotation + delta + 360) % 360;
      page.rotation = (page.rotation + delta + 360) % 360;
    }
  }

  bulkRotate(delta: number) {
    if (this.selectedIds.size === 0) return;
    this.snapshot();
    this.pages.forEach(p => {
      if (this.selectedIds.has(p.id)) {
        p.visualRotation = (p.visualRotation + delta + 360) % 360;
        p.rotation = (p.rotation + delta + 360) % 360;
      }
    });
  }

  deletePage(id: string) {
    this.snapshot();
    this.pages = this.pages.filter(p => p.id !== id);
    this.selectedIds.delete(id);
    this.splitMarkers.delete(id);
    this.selectedIds = new Set(this.selectedIds);
    this.splitMarkers = new Set(this.splitMarkers);
  }

  bulkDelete() {
    if (this.selectedIds.size === 0) return;
    this.snapshot();
    this.pages = this.pages.filter(p => !this.selectedIds.has(p.id));
    this.selectedIds.clear();
    this.selectedIds = new Set();
  }

  duplicatePage(id: string) {
    this.snapshot();
    const index = this.pages.findIndex(p => p.id === id);
    if (index === -1) return;
    const original = this.pages[index];

    const clone: PageData = {
      ...original,
      id: nanoid()
    };
    this.pages.splice(index + 1, 0, clone);
  }

  toggleSplit(id: string) {
    this.snapshot();
    if (this.splitMarkers.has(id)) {
      this.splitMarkers.delete(id);
    } else {
      this.splitMarkers.add(id);
    }
    this.splitMarkers = new Set(this.splitMarkers);
  }

  addBlankPage() {
    this.snapshot();
    this.pages.push({
      id: nanoid(),
      pdfIndex: -1,
      pageIndex: -1,
      rotation: 0,
      visualRotation: 0,
      originalPageIndex: -1,
      fileName: 'Blank'
    });
  }

  get documentCount() {
    if (this.pages.length === 0) return 0;
    const lastId = this.pages[this.pages.length - 1].id;
    return 1 + this.pages.filter(p => this.splitMarkers.has(p.id) && p.id !== lastId).length;
  }

  get resultFiles(): File[] {
    return this.result && this.result.documents === 1
      ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })]
      : [];
  }

  downloadResult() {
    if (this.result) this.downloadBlob(this.result.blob, this.result.name);
  }

  reset() {
    this.pages = [];
    this.selectedIds = new Set();
    this.splitMarkers = new Set();
    this.pdfLibDocs = [];
    this.pdfJsDocs = [];
    this.undoStack = [];
    this.redoStack = [];
    this.syncHistory();
  }
  async renderThumbnail(
    canvas: HTMLCanvasElement,
    pdfIndex: number,
    pageIndex: number,
    _rotation: number = 0
  ) {
    if (pdfIndex === -1) return;
    const pdfDoc = this.pdfJsDocs[pdfIndex];

    if (!pdfDoc) {
      console.error(`[PdfEditor] PDF Document at index ${pdfIndex} not found.`);
      return;
    }

    await super.renderPageToCanvas(canvas, pdfDoc, pageIndex);
  }

// Export
  async download() {
    if (this.pages.length === 0) return;
    this.loader.show = true;
    this.loader.text = "Generating PDF...";

    try {
      if (this.splitMarkers.size > 0) {
        await this.downloadSplitPdfs();
      } else {
        await this.downloadSinglePdf(this.pages, 'orbit-document.pdf');
      }
    } catch (e) {
      console.error(e);
      toast.error("Error generating PDF");
    } finally {
      this.loader.show = false;
    }
  }

  async downloadSinglePdf(pagesToDownload: PageData[], filename: string) {
    const newPdf = await PDFLibDocument.create();

    for (const pageData of pagesToDownload) {
      if (pageData.pdfIndex === -1) {
        newPdf.addPage([595, 842]);
      } else {
        const sourceDoc = this.pdfLibDocs[pageData.pdfIndex];
        const [copiedPage] = await newPdf.copyPages(sourceDoc, [pageData.originalPageIndex]);
        const page = newPdf.addPage(copiedPage);

        if (pageData.rotation !== 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + pageData.rotation));
        }
      }
    }
    const pdfBytes = await newPdf.save();
    const pdfBlob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    this.result = { blob: pdfBlob, name: filename, documents: 1 };
    this.downloadBlob(pdfBlob, filename);
  }

  async downloadSplitPdfs() {
    const zip = new JSZip();
    let currentSegment: PageData[] = [];
    let segmentCount = 1;

    for (const page of this.pages) {
      currentSegment.push(page);
      if (this.splitMarkers.has(page.id)) {
        const pdfBytes = await this.createPdfBytes(currentSegment);
        zip.file(`document-${segmentCount}.pdf`, pdfBytes);
        currentSegment = [];
        segmentCount++;
      }
    }
    if (currentSegment.length > 0) {
      const pdfBytes = await this.createPdfBytes(currentSegment);
      zip.file(`document-${segmentCount}.pdf`, pdfBytes);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    this.result = { blob: zipBlob, name: 'split-documents.zip', documents: segmentCount - (currentSegment.length > 0 ? 0 : 1) };
    this.downloadBlob(zipBlob, 'split-documents.zip');
  }

  private async createPdfBytes(pages: PageData[]): Promise<Uint8Array> {
    const newPdf = await PDFLibDocument.create();
    for (const pageData of pages) {
      if (pageData.pdfIndex === -1) {
        newPdf.addPage([595, 842]);
      } else {
        const sourceDoc = this.pdfLibDocs[pageData.pdfIndex];
        const [copiedPage] = await newPdf.copyPages(sourceDoc, [pageData.originalPageIndex]);
        const page = newPdf.addPage(copiedPage);
        if (pageData.rotation !== 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + pageData.rotation));
        }
      }
    }
    return newPdf.save();
  }

 
}

export const pdfState = new PdfEditorState();

