import { PdfEngine } from "$lib/pdf-engine.svelte";
import { PDFDocument } from "pdf-lib";
import { toast } from "svelte-sonner";
import {
  buildOverlay,
  type OverlayFit,
  type OverlayPages,
  type OverlayPosition,
  overlayPageFor,
  type PageBox,
  placeOverlay,
  visibleSize,
} from "./overlay";

const RANGE_SYNTAX = /^\s*\d+\s*(-\s*\d+\s*)?(,\s*\d+\s*(-\s*\d+\s*)?)*,?\s*$/;

/** A loaded PDF with its bytes and page boxes. */
export interface LoadedPdf {
  file: File;
  bytes: ArrayBuffer;
  boxes: PageBox[];
}

export class OverlayState extends PdfEngine {
  main = $state.raw<LoadedPdf | null>(null);
  overlay = $state.raw<LoadedPdf | null>(null);
  loading = $state<"main" | "overlay" | null>(null);

  position = $state<OverlayPosition>("top");
  pages = $state<OverlayPages>("first");
  applyTo = $state<"all" | "range">("all");
  range = $state("");
  opacity = $state(100);
  fit = $state<OverlayFit>("fit");

  result = $state.raw<{ blob: Blob; name: string; pages: number } | null>(null);

  private renderQueue: Promise<void> = Promise.resolve();

  get rangeError(): string | null {
    if (this.applyTo !== "range" || !this.main) return null;
    if (!this.range.trim()) return "Enter the pages to change, like 1-3, 5";
    if (!RANGE_SYNTAX.test(this.range)) return "Use numbers and ranges, like 1-3, 5";
    if (this.targets.length === 0) return `This PDF has ${this.main.boxes.length} pages`;
    return null;
  }

  get targets(): number[] {
    const count = this.main?.boxes.length ?? 0;
    if (this.applyTo === "all") return Array.from({ length: count }, (_, i) => i);
    if (!RANGE_SYNTAX.test(this.range)) return [];
    return this.parsePageRange(this.range, count);
  }

  /** Pages that will actually get an overlay with the current settings. */
  get coveredCount(): number {
    const count = this.overlay?.boxes.length ?? 0;
    return this.targets.filter((pageIndex, order) => overlayPageFor(this.pages, pageIndex, order, count) !== null).length;
  }

  get preview() {
    if (!this.main || !this.overlay) return null;
    const pageIndex = this.targets[0];
    if (pageIndex === undefined) return null;
    const overlayIndex = overlayPageFor(this.pages, pageIndex, 0, this.overlay.boxes.length);
    const target = visibleSize(this.main.boxes[pageIndex]);
    if (overlayIndex === null) return { pageIndex, overlayIndex, target, rect: null };
    const source = visibleSize(this.overlay.boxes[overlayIndex]);
    const r = placeOverlay(target, source, this.fit);
    const rect = {
      left: (r.x / target.width) * 100,
      top: ((target.height - r.y - r.height) / target.height) * 100,
      width: (r.width / target.width) * 100,
      height: (r.height / target.height) * 100,
    };
    return { pageIndex, overlayIndex, target, rect };
  }

  get resultFiles(): File[] {
    return this.result ? [new File([this.result.blob], this.result.name, { type: "application/pdf" })] : [];
  }

  async setMain(files: File[]) {
    const loaded = await this.load(files, "main");
    if (loaded) {
      this.main = loaded;
      this.result = null;
    }
  }

  async setOverlay(files: File[]) {
    const loaded = await this.load(files, "overlay");
    if (loaded) {
      this.overlay = loaded;
      this.result = null;
    }
  }

  clearOverlay() {
    this.overlay = null;
    this.result = null;
  }

  swap() {
    if (!this.main || !this.overlay) return;
    [this.main, this.overlay] = [this.overlay, this.main];
    this.result = null;
  }

  private async load(files: File[], slot: "main" | "overlay"): Promise<LoadedPdf | null> {
    const file = files.find((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!file) {
      toast.error("Please choose a PDF file.");
      return null;
    }
    this.loading = slot;
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes.slice(0), { ignoreEncryption: true, throwOnInvalidObject: false });
      if (doc.isEncrypted) {
        toast.error(`${file.name} is password protected. Unlock it first with Decrypt PDF.`);
        return null;
      }
      const boxes = doc.getPages().map((page) => {
        const crop = page.getCropBox();
        return { x: crop.x, y: crop.y, width: crop.width, height: crop.height, rotation: page.getRotation().angle };
      });
      return { file, bytes, boxes };
    } catch (e) {
      console.error(e);
      toast.error(`${file.name} couldn't be opened. It may be damaged.`);
      return null;
    } finally {
      this.loading = null;
    }
  }

  /** Renders one page of `pdf` into `canvas`; renders run one at a time because pdf.js shares page state between documents. */
  renderPage(pdf: LoadedPdf, pageIndex: number, canvas: HTMLCanvasElement, cssWidth: number): Promise<void> {
    const run = async () => {
      const pdfjs = await this.getPdfJs();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(pdf.bytes.slice(0)) }).promise;
      try {
        const page = await doc.getPage(pageIndex + 1);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: cssWidth / base.width });
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.floor(viewport.width * ratio));
        canvas.height = Math.max(1, Math.floor(viewport.height * ratio));
        const ctx = canvas.getContext("2d");
        if (ctx) {
          await page.render({
            canvasContext: ctx,
            viewport,
            canvas,
            transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined,
          }).promise;
        }
      } finally {
        await doc.destroy();
      }
    };
    const next = this.renderQueue.then(run, run);
    this.renderQueue = next.catch((e) => console.error(e));
    return next;
  }

  async apply() {
    if (!this.main || !this.overlay || this.rangeError || this.coveredCount === 0) return;
    this.isProcessing = true;
    try {
      const out = await buildOverlay(this.main.bytes.slice(0), this.overlay.bytes.slice(0), {
        position: this.position,
        pages: this.pages,
        targets: this.targets,
        opacity: this.opacity / 100,
        fit: this.fit,
      });
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const name = `${this.main.file.name.replace(/\.pdf$/i, "")}_overlay.pdf`;
      this.result = { blob, name, pages: this.coveredCount };
      this.downloadBlob(blob, name);
    } catch (e) {
      console.error(e);
      toast.error("The overlay couldn't be applied to this PDF.");
    } finally {
      this.isProcessing = false;
    }
  }

  downloadResult() {
    if (this.result) this.downloadBlob(this.result.blob, this.result.name);
  }

  reset() {
    this.main = null;
    this.overlay = null;
    this.result = null;
    this.range = "";
    this.applyTo = "all";
    this.isProcessing = false;
  }
}
