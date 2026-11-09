import { toast } from "svelte-sonner";
import type { Reply, Request, SheetInfo, Sort } from "./protocol";

export const ACCEPTED_FORMATS = ".csv,.tsv,.xlsx,.xls,.ods,.txt";
export const ROW_HEIGHT = 34;
export const CHUNK = 100;

type Pending = (reply: Extract<Reply, { type: "rows" }>) => void;

export class SpreadsheetViewerState {
  status = $state<"idle" | "reading" | "ready" | "error">("idle");
  error = $state("");
  fileName = $state("");
  fileSize = $state(0);
  sheets = $state<SheetInfo[]>([]);
  sheet = $state(0);
  header = $state(true);
  query = $state("");
  sort = $state<Sort>(null);
  count = $state(0);
  cols = $state(0);
  widths = $state<number[]>([]);
  headerRow = $state<string[] | null>(null);
  /** Bumped when the view changes, so the grid drops its cached chunks. */
  version = $state(0);

  private worker: Worker | null = null;
  private seq = 0;
  private pending = new Map<number, Pending>();
  private csvResolve: ((text: string) => void) | null = null;
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  private ensureWorker() {
    if (this.worker) return this.worker;
    const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<Reply>) => this.onReply(event.data);
    worker.onerror = () => this.fail("The spreadsheet could not be read.");
    this.worker = worker;
    return worker;
  }

  private post(message: Request, transfer: Transferable[] = []) {
    this.ensureWorker().postMessage(message, transfer);
  }

  private onReply(reply: Reply) {
    if (reply.type === "loaded") {
      this.sheets = reply.sheets;
      const first = reply.sheets.findIndex((s) => !s.hidden && s.cols > 0);
      this.sheet = first === -1 ? 0 : first;
      if (reply.sheets.every((s) => s.cols === 0)) return this.fail("No data found in this file.");
      this.query = "";
      this.sort = null;
      this.requestView();
    } else if (reply.type === "view") {
      this.count = reply.count;
      this.cols = reply.cols;
      this.widths = reply.widths;
      this.headerRow = reply.header;
      this.version += 1;
      this.status = "ready";
    } else if (reply.type === "rows") {
      this.pending.get(reply.id)?.(reply);
      this.pending.delete(reply.id);
    } else if (reply.type === "csv") {
      this.csvResolve?.(reply.text);
      this.csvResolve = null;
    } else {
      this.fail(reply.message);
    }
  }

  private fail(message: string) {
    this.status = "error";
    this.error = message;
    toast.error(message);
  }

  async open(file: File) {
    this.status = "reading";
    this.fileName = file.name;
    this.fileSize = file.size;
    const buffer = await file.arrayBuffer();
    this.post({ type: "load", name: file.name, buffer }, [buffer]);
  }

  private requestView() {
    this.post({ type: "view", sheet: this.sheet, header: this.header, query: this.query, sort: this.sort });
  }

  /** Rows [start, end) of the current view. Resolves once the worker answers. */
  fetchRows(start: number, end: number): Promise<string[][]> {
    return new Promise((resolve) => {
      const id = ++this.seq;
      this.pending.set(id, (reply) => resolve(reply.rows));
      this.post({ type: "rows", id, sheet: this.sheet, start, end });
    });
  }

  selectSheet(index: number) {
    if (index === this.sheet) return;
    this.sheet = index;
    this.sort = null;
    this.query = "";
    this.requestView();
  }

  setHeader(value: boolean) {
    this.header = value;
    this.requestView();
  }

  setQuery(value: string) {
    this.query = value;
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.requestView(), 160);
  }

  toggleSort(col: number) {
    const current = this.sort;
    if (!current || current.col !== col) this.sort = { col, dir: 1 };
    else if (current.dir === 1) this.sort = { col, dir: -1 };
    else this.sort = null;
    this.requestView();
  }

  async exportCsv() {
    const text = await new Promise<string>((resolve) => {
      this.csvResolve = resolve;
      this.post({ type: "csv", sheet: this.sheet });
    });
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${this.fileName.replace(/\.[^/.]+$/, "")}-${this.sheets[this.sheet]?.name ?? "sheet"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  reset() {
    this.worker?.terminate();
    this.worker = null;
    this.pending.clear();
    this.status = "idle";
    this.sheets = [];
    this.count = 0;
    this.query = "";
    this.sort = null;
    this.fileName = "";
  }

  destroy() {
    this.reset();
  }
}
