import { PdfEngine } from "$lib/pdf-engine.svelte";
import { toast } from "svelte-sonner";
import { deleteDraft, isCreatorDoc, listDrafts, saveDraft } from "./drafts";
import { createBlock } from "./model/blocks";
import { findFields } from "./model/fields";
import { docFromPreset, type Preset } from "./model/presets";
import type { Block, BlockPropsMap, BlockType, CreatorDoc } from "./model/types";

const HISTORY_LIMIT = 60;
const COALESCE_MS = 700;

const FOCUS_PATH: Partial<Record<BlockType, string>> = {
  title: "title",
  heading: "text",
  paragraph: "text",
  quote: "text",
  card: "title",
  callout: "title",
  letterhead: "brand",
  bullets: "items.0",
  numbered: "items.0",
  checklist: "items.0",
  badges: "items.0",
};

export class CreatorState extends PdfEngine {
  doc = $state<CreatorDoc | null>(null);
  selectedId = $state<string | null>(null);
  showValues = $state(false);
  drafts = $state.raw<CreatorDoc[]>([]);
  engineLoading = $state(false);
  saveState = $state<"saved" | "saving" | "error">("saved");
  /** `blockId:path` of the text field that should take focus next. */
  focusKey = $state<string | null>(null);

  #past = $state.raw<string[]>([]);
  #future = $state.raw<string[]>([]);
  #lastTag = "";
  #lastAt = 0;
  #saveTimer: ReturnType<typeof setTimeout> | null = null;

  readonly canUndo = $derived(this.#past.length > 0);
  readonly canRedo = $derived(this.#future.length > 0);
  readonly selected = $derived(this.doc?.blocks.find((b) => b.id === this.selectedId) ?? null);
  readonly fields = $derived(this.doc ? findFields(this.doc) : []);

  async loadDrafts() {
    try {
      this.drafts = await listDrafts();
    } catch {
      this.drafts = [];
    }
  }

  open(doc: CreatorDoc) {
    this.doc = doc;
    this.selectedId = null;
    this.#past = [];
    this.#future = [];
    this.#lastTag = "";
  }

  openPreset(preset: Preset) {
    this.open(docFromPreset(preset));
    this.scheduleSave();
  }

  async close() {
    await this.flushSave();
    this.doc = null;
    this.selectedId = null;
    await this.loadDrafts();
  }

  async removeDraft(id: string) {
    await deleteDraft(id);
    this.drafts = this.drafts.filter((d) => d.id !== id);
  }

  /**
   * Records an undo step, then applies `mutate`. Calls sharing a `tag` within
   * a short window merge into one step, so typing isn't undone letter by letter.
   */
  change(tag: string, mutate: (doc: CreatorDoc) => void) {
    const doc = this.doc;
    if (!doc) return;
    const now = Date.now();
    if (tag !== this.#lastTag || now - this.#lastAt > COALESCE_MS) {
      this.#past = [...this.#past.slice(-HISTORY_LIMIT + 1), JSON.stringify($state.snapshot(doc))];
      this.#future = [];
    }
    this.#lastTag = tag;
    this.#lastAt = now;
    mutate(doc);
    doc.updatedAt = now;
    this.scheduleSave();
  }

  #restore(from: string[], to: "past" | "future") {
    const doc = this.doc;
    const snapshot = from.at(-1);
    if (!doc || !snapshot) return;
    const current = JSON.stringify($state.snapshot(doc));
    if (to === "future") {
      this.#past = this.#past.slice(0, -1);
      this.#future = [...this.#future, current];
    } else {
      this.#future = this.#future.slice(0, -1);
      this.#past = [...this.#past, current];
    }
    this.doc = JSON.parse(snapshot);
    this.#lastTag = "";
    if (this.selectedId && !this.doc?.blocks.some((b) => b.id === this.selectedId)) this.selectedId = null;
    this.scheduleSave();
  }

  undo() {
    this.#restore(this.#past, "future");
  }

  redo() {
    this.#restore(this.#future, "past");
  }

  updateProps<T extends BlockType>(id: string, patch: Partial<BlockPropsMap[T]>, tag = `props:${id}`) {
    this.change(tag, (doc) => {
      const block = doc.blocks.find((b) => b.id === id);
      if (block) Object.assign(block.props, patch);
    });
  }

  /** Puts the caret in a block's main text, selecting it so typing replaces the sample. */
  focusBlock(block: Block) {
    const path = FOCUS_PATH[block.type];
    if (path) this.focusKey = `${block.id}:${path}|all`;
  }

  insert(type: BlockType, index?: number) {
    const block = createBlock(type);
    this.change(`insert:${block.id}`, (doc) => {
      const at = index ?? this.#indexAfterSelection(doc);
      doc.blocks.splice(at, 0, block as Block);
    });
    this.selectedId = block.id;
    return block;
  }

  /** Swaps an empty text block for another block type, as the `/` command does. */
  replace(id: string, type: BlockType) {
    const block = createBlock(type);
    this.change(`replace:${id}`, (doc) => {
      const index = doc.blocks.findIndex((b) => b.id === id);
      if (index >= 0) doc.blocks.splice(index, 1, block as Block);
    });
    this.selectedId = block.id;
  }

  #indexAfterSelection(doc: CreatorDoc) {
    const index = doc.blocks.findIndex((b) => b.id === this.selectedId);
    return index >= 0 ? index + 1 : doc.blocks.length;
  }

  duplicate(id: string) {
    const doc = this.doc;
    const source = doc?.blocks.find((b) => b.id === id);
    if (!source) return;
    const copy = { ...structuredClone($state.snapshot(source)), id: crypto.randomUUID() } as Block;
    this.change(`duplicate:${id}`, (d) => {
      d.blocks.splice(d.blocks.findIndex((b) => b.id === id) + 1, 0, copy);
    });
    this.selectedId = copy.id;
  }

  remove(id: string) {
    const doc = this.doc;
    if (!doc) return;
    const index = doc.blocks.findIndex((b) => b.id === id);
    this.change(`remove:${id}`, (d) => {
      d.blocks.splice(index, 1);
    });
    if (this.selectedId === id) this.selectedId = doc.blocks[Math.min(index, doc.blocks.length - 1)]?.id ?? null;
  }

  move(from: number, to: number) {
    if (from === to) return;
    this.change(`move:${from}:${to}`, (doc) => {
      const [block] = doc.blocks.splice(from, 1);
      doc.blocks.splice(to, 0, block);
    });
  }

  nudge(id: string, delta: -1 | 1) {
    const index = this.doc?.blocks.findIndex((b) => b.id === id) ?? -1;
    const target = index + delta;
    if (index < 0 || !this.doc || target < 0 || target >= this.doc.blocks.length) return;
    this.move(index, target);
  }

  scheduleSave() {
    if (this.#saveTimer) clearTimeout(this.#saveTimer);
    this.saveState = "saving";
    this.#saveTimer = setTimeout(() => this.flushSave(), 800);
  }

  async flushSave() {
    if (this.#saveTimer) clearTimeout(this.#saveTimer);
    this.#saveTimer = null;
    const doc = this.doc;
    if (!doc) return;
    try {
      await saveDraft($state.snapshot(doc) as CreatorDoc);
      this.saveState = "saved";
    } catch (error) {
      console.error("Draft save failed", error);
      this.saveState = "error";
    }
  }

  get fileName() {
    const base = (this.doc?.name || "document").trim().replace(/[\\/:*?"<>|]+/g, "-");
    return base || "document";
  }

  async render(): Promise<Blob | null> {
    const doc = this.doc;
    if (!doc) return null;
    this.isProcessing = true;
    this.engineLoading = true;
    try {
      const { renderDocument } = await import("./model/engine");
      const bytes = await renderDocument($state.snapshot(doc) as CreatorDoc);
      return new Blob([bytes as BlobPart], { type: "application/pdf" });
    } catch (error) {
      console.error("PDF render failed", error);
      toast.error(renderError(error));
      return null;
    } finally {
      this.isProcessing = false;
      this.engineLoading = false;
    }
  }

  /** Renders the real PDF and opens it with pdf.js for the preview. */
  async loadPreview() {
    const blob = await this.render();
    if (!blob) return null;
    const lib = await this.getPdfJs();
    const pdf = await lib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
    return { blob, pdf };
  }

  async downloadPdf() {
    const blob = await this.render();
    if (blob) this.downloadBlob(blob, `${this.fileName}.pdf`);
    return blob;
  }

  downloadJson() {
    const doc = this.doc;
    if (!doc) return;
    const blob = new Blob([JSON.stringify($state.snapshot(doc), null, 2)], { type: "application/json" });
    this.downloadBlob(blob, `${this.fileName}.orbit.json`);
  }

  async importJson(file: File) {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isCreatorDoc(parsed)) throw new Error("not a draft");
      this.open({ ...parsed, id: crypto.randomUUID(), updatedAt: Date.now() });
      await this.flushSave();
      toast.success(`Opened ${parsed.name}`);
    } catch {
      toast.error("That file isn't an Orbit draft. Choose a .orbit.json file exported from Create PDF.");
    }
  }
}

function renderError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/barcode|EAN/i.test(message)) return "A barcode value doesn't fit its format. EAN-13 needs 12 or 13 digits.";
  if (/image/i.test(message)) return "One of the images couldn't be read. Try a JPG or PNG.";
  if (/fetch|wasm|WebAssembly/i.test(message)) return "The PDF engine didn't load. Check your connection once, then it works offline.";
  return "The PDF couldn't be created. Try removing the last block you added.";
}
