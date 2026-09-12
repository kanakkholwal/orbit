import { PdfEngine } from "$lib/pdf-engine.svelte";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { toast } from "svelte-sonner";
import { type AttachmentInfo, applyAttachmentChanges, listAttachments, uniqueName } from "./attachments";

/** A file the user picked to attach on the next save. */
export interface PendingFile {
  id: string;
  file: File;
  description: string;
}

export class AttachmentsState extends PdfEngine {
  file = $state.raw<File | null>(null);
  loading = $state(false);
  locked = $state(false);
  pageCount = $state(0);
  attachments = $state.raw<AttachmentInfo[]>([]);
  selected = $state<string[]>([]);
  removed = $state<string[]>([]);
  pending = $state<PendingFile[]>([]);
  result = $state.raw<{ blob: Blob; name: string; added: number; removed: number } | null>(null);

  private bytes: ArrayBuffer | null = null;

  get hasChanges() {
    return this.removed.length > 0 || this.pending.length > 0;
  }

  get totalSize() {
    return this.attachments.reduce((sum, a) => sum + a.size, 0);
  }

  get resultFiles(): File[] {
    return this.result ? [new File([this.result.blob], this.result.name, { type: "application/pdf" })] : [];
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
      await this.readBytes(await picked.arrayBuffer());
    } catch (e) {
      console.error(e);
      toast.error("This PDF couldn't be opened. It may be damaged.");
      this.reset();
    } finally {
      this.loading = false;
    }
  }

  private async readBytes(bytes: ArrayBuffer) {
    const doc = await PDFDocument.load(bytes.slice(0), { ignoreEncryption: true, throwOnInvalidObject: false });
    this.pageCount = doc.getPageCount();
    this.locked = doc.isEncrypted;
    this.bytes = bytes;
    this.attachments = this.locked ? [] : listAttachments(doc);
    this.selected = [];
    this.removed = [];
  }

  toggleSelected(id: string, on: boolean) {
    this.selected = on ? [...new Set([...this.selected, id])] : this.selected.filter((s) => s !== id);
  }

  selectAll(on: boolean) {
    this.selected = on ? this.attachments.filter((a) => !this.removed.includes(a.id)).map((a) => a.id) : [];
  }

  removeSelected() {
    this.removed = [...new Set([...this.removed, ...this.selected])];
    this.selected = [];
    this.result = null;
  }

  toggleRemoved(id: string) {
    this.removed = this.removed.includes(id) ? this.removed.filter((r) => r !== id) : [...this.removed, id];
    this.selected = this.selected.filter((s) => s !== id);
    this.result = null;
  }

  addFiles(files: File[]) {
    this.pending.push(...files.map((file) => ({ id: crypto.randomUUID(), file, description: "" })));
    this.result = null;
  }

  removePending(id: string) {
    this.pending = this.pending.filter((p) => p.id !== id);
  }

  download(attachment: AttachmentInfo) {
    this.downloadBlob(new Blob([attachment.data as BlobPart], { type: attachment.mimeType || "application/octet-stream" }), attachment.name);
  }

  async downloadAll() {
    if (this.attachments.length === 0) return;
    if (this.attachments.length === 1) {
      this.download(this.attachments[0]);
      return;
    }
    const zip = new JSZip();
    const taken = new Set<string>();
    for (const a of this.attachments) {
      const name = uniqueName(a.name, taken);
      taken.add(name);
      zip.file(name, a.data, { date: a.modified });
    }
    const blob = await zip.generateAsync({ type: "blob" });
    this.downloadBlob(blob, `${this.baseName}_attachments.zip`);
  }

  async save() {
    if (!this.bytes || !this.file || !this.hasChanges) return;
    this.isProcessing = true;
    try {
      const doc = await PDFDocument.load(this.bytes.slice(0), { throwOnInvalidObject: false });
      const added = await Promise.all(
        this.pending.map(async (p) => ({
          name: p.file.name,
          data: new Uint8Array(await p.file.arrayBuffer()),
          mimeType: p.file.type || undefined,
          description: p.description,
          modified: p.file.lastModified ? new Date(p.file.lastModified) : undefined,
        }))
      );
      const removedCount = this.removed.length;
      await applyAttachmentChanges(doc, this.removed, added);
      const out = await doc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const name = `${this.baseName}_attachments.pdf`;
      this.downloadBlob(blob, name);
      await this.readBytes(out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer);
      this.pending = [];
      this.result = { blob, name, added: added.length, removed: removedCount };
    } catch (e) {
      console.error(e);
      toast.error("The attachments couldn't be saved.");
    } finally {
      this.isProcessing = false;
    }
  }

  downloadResult() {
    if (this.result) this.downloadBlob(this.result.blob, this.result.name);
  }

  private get baseName() {
    return (this.file?.name ?? "document").replace(/\.pdf$/i, "");
  }

  reset() {
    this.file = null;
    this.bytes = null;
    this.locked = false;
    this.pageCount = 0;
    this.attachments = [];
    this.selected = [];
    this.removed = [];
    this.pending = [];
    this.result = null;
    this.isProcessing = false;
  }
}
