import { PdfEngine } from "$lib/pdf-engine.svelte";
import { PDFDocument } from "pdf-lib";
import type * as PDFJS from "pdfjs-dist";
import { toast } from "svelte-sonner";
import {
  countChanges,
  type FieldValue,
  type FormSummary,
  fillForm,
  findUnsupportedText,
  readForm,
  standardCharacterSet,
  unsupportedCharacters,
} from "./form";

export type SaveMode = "editable" | "flatten";

/** A widget box on the preview, as percentages of the rendered page. */
export interface PreviewBox {
  field: string;
  option?: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

export class FillFormState extends PdfEngine {
  file = $state.raw<File | null>(null);
  loading = $state(false);
  pageCount = $state(0);
  locked = $state(false);
  summary = $state.raw<FormSummary | null>(null);
  values = $state<Record<string, FieldValue>>({});
  saveMode = $state<SaveMode>("editable");
  previewPage = $state(0);
  previewBoxes = $state.raw<PreviewBox[]>([]);
  previewReady = $state(false);
  activeField = $state<string | null>(null);
  result = $state.raw<{ blob: Blob; name: string } | null>(null);

  private original: Record<string, FieldValue> = {};
  private bytes: ArrayBuffer | null = null;
  private proxy: PDFJS.PDFDocumentProxy | null = null;
  private renderTask: PDFJS.RenderTask | null = null;
  private supported = $state.raw<Set<number> | null>(null);

  get fields() {
    return this.summary?.fields ?? [];
  }

  get changedCount() {
    return countChanges(this.original, this.values);
  }

  get problems() {
    return this.supported ? findUnsupportedText(this.original, this.values, this.supported) : [];
  }

  get resultFiles(): File[] {
    return this.result ? [new File([this.result.blob], this.result.name, { type: "application/pdf" })] : [];
  }

  /** Characters in this text field that the saved PDF can't show. */
  badCharacters(name: string): string[] {
    const value = this.values[name];
    if (!this.supported || typeof value !== "string" || value === this.original[name]) return [];
    return unsupportedCharacters(value, this.supported);
  }

  isChanged(name: string): boolean {
    return countChanges({ [name]: this.original[name] }, { [name]: this.values[name] }) > 0;
  }

  async loadFile(files: File[]) {
    const picked = files.find((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!picked) {
      toast.error("Please choose a PDF file.");
      return;
    }
    this.reset();
    this.file = picked;
    this.loading = true;
    try {
      const bytes = await picked.arrayBuffer();
      const doc = await PDFDocument.load(bytes.slice(0), { ignoreEncryption: true, throwOnInvalidObject: false });
      this.pageCount = doc.getPageCount();
      if (doc.isEncrypted) {
        this.locked = true;
        return;
      }
      const summary = readForm(doc);
      this.original = Object.fromEntries(summary.fields.map((f) => [f.name, snapshot(f.value)]));
      this.values = Object.fromEntries(summary.fields.map((f) => [f.name, snapshot(f.value)]));
      this.summary = summary;
      this.bytes = bytes;
      this.previewPage = summary.fields.find((f) => f.pageIndex >= 0)?.pageIndex ?? 0;
      this.supported = await standardCharacterSet();

      if (summary.fields.length > 0) {
        const pdfjs = await this.getPdfJs();
        this.proxy = await pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)) }).promise;
      }
    } catch (e) {
      console.error(e);
      toast.error("This PDF couldn't be opened. It may be damaged.");
      this.reset();
    } finally {
      this.loading = false;
    }
  }

  setValue(name: string, value: FieldValue) {
    this.values[name] = value;
    this.result = null;
  }

  resetValues() {
    this.values = Object.fromEntries(Object.entries(this.original).map(([k, v]) => [k, snapshot(v)]));
    this.result = null;
  }

  focusField(name: string) {
    this.activeField = name;
    const field = this.fields.find((f) => f.name === name);
    if (field && field.pageIndex >= 0 && !field.widgets.some((w) => w.pageIndex === this.previewPage)) {
      this.previewPage = field.pageIndex;
    }
  }

  /** Renders the preview page at `cssWidth` and works out where each field's boxes sit. */
  async renderPreview(canvas: HTMLCanvasElement, pageIndex: number, cssWidth: number) {
    if (!this.proxy || cssWidth <= 0) return;
    this.renderTask?.cancel();
    this.previewReady = false;
    try {
      const page = await this.proxy.getPage(pageIndex + 1);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: cssWidth / base.width });
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const boxes: PreviewBox[] = [];
      for (const field of this.fields) {
        for (const w of field.widgets) {
          if (w.pageIndex !== pageIndex) continue;
          const [x1, y1, x2, y2] = base.convertToViewportRectangle([w.x, w.y, w.x + w.width, w.y + w.height]);
          boxes.push({
            field: field.name,
            option: w.option,
            left: (Math.min(x1, x2) / base.width) * 100,
            top: (Math.min(y1, y2) / base.height) * 100,
            width: (Math.abs(x2 - x1) / base.width) * 100,
            height: (Math.abs(y2 - y1) / base.height) * 100,
          });
        }
      }
      this.previewBoxes = boxes;

      const task = page.render({
        canvasContext: ctx,
        viewport,
        canvas,
        transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined,
        annotationMode: 0,
      });
      this.renderTask = task;
      await task.promise;
      if (this.renderTask === task) this.previewReady = true;
    } catch (e) {
      if ((e as Error)?.name !== "RenderingCancelledException") console.error(e);
    }
  }

  async save() {
    if (!this.bytes || !this.file || this.fields.length === 0) return;
    if (this.problems.length > 0) {
      toast.error("Some fields contain characters the PDF can't show. Remove them to continue.");
      return;
    }
    this.isProcessing = true;
    try {
      const doc = await PDFDocument.load(this.bytes.slice(0), { ignoreEncryption: true, throwOnInvalidObject: false });
      const values = $state.snapshot(this.values) as Record<string, FieldValue>;
      await fillForm(doc, this.original, values, { flatten: this.saveMode === "flatten" });
      const out = await doc.save({ updateFieldAppearances: false });
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const name = `${this.file.name.replace(/\.pdf$/i, "")}_filled.pdf`;
      this.result = { blob, name };
      this.downloadBlob(blob, name);
    } catch (e) {
      console.error(e);
      const message = e instanceof Error && e.message.startsWith("Some fields") ? e.message : "The form couldn't be saved.";
      toast.error(message);
    } finally {
      this.isProcessing = false;
    }
  }

  downloadResult() {
    if (this.result) this.downloadBlob(this.result.blob, this.result.name);
  }

  reset() {
    this.renderTask?.cancel();
    this.renderTask = null;
    this.proxy?.destroy();
    this.proxy = null;
    this.bytes = null;
    this.file = null;
    this.summary = null;
    this.values = {};
    this.original = {};
    this.pageCount = 0;
    this.locked = false;
    this.previewPage = 0;
    this.previewBoxes = [];
    this.previewReady = false;
    this.activeField = null;
    this.result = null;
    this.isProcessing = false;
  }
}

function snapshot(value: FieldValue): FieldValue {
  return Array.isArray(value) ? [...value] : value;
}
