import * as XLSX from "xlsx";
import type { Reply, Request, SheetInfo } from "./protocol";

interface Sheet {
  name: string;
  rows: string[][];
  cols: number;
  hidden: boolean;
  lower: (string | undefined)[];
}

let sheets: Sheet[] = [];
let view: Uint32Array<ArrayBufferLike> = new Uint32Array(0);

const reply = (message: Reply) => postMessage(message);

function decode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder("utf-16le").decode(bytes);
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder("utf-16be").decode(bytes);
  return new TextDecoder("utf-8").decode(bytes).replace(/^﻿/, "");
}

function detectDelimiter(text: string): string {
  const head = text.slice(0, 8192).split(/\r?\n/).slice(0, 8);
  let best = ",";
  let bestScore = 0;
  for (const d of [",", ";", "\t", "|"]) {
    const counts = head.filter(Boolean).map((line) => line.split(d).length - 1);
    if (counts.length === 0 || counts[0] === 0) continue;
    const consistent = counts.every((c) => c === counts[0]);
    const score = counts[0] * (consistent ? 2 : 1);
    if (score > bestScore) {
      best = d;
      bestScore = score;
    }
  }
  return best;
}

function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const n = text.length;
  for (let i = 0; i < n; i++) {
    const c = text.charCodeAt(i);
    if (quoted) {
      if (c === 34) {
        if (text.charCodeAt(i + 1) === 34) {
          field += '"';
          i++;
        } else quoted = false;
      } else field += text[i];
      continue;
    }
    if (c === 34 && field === "") quoted = true;
    else if (text[i] === delimiter) {
      row.push(field);
      field = "";
    } else if (c === 10 || c === 13) {
      if (c === 13 && text.charCodeAt(i + 1) === 10) i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += text[i];
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  return rows;
}

function finish(name: string, rows: string[][], hidden = false): Sheet {
  let cols = 0;
  for (const r of rows) if (r.length > cols) cols = r.length;
  return { name, rows, cols, hidden, lower: new Array(rows.length) };
}

function load(name: string, buffer: ArrayBuffer) {
  const isText = /\.(csv|tsv|txt)$/i.test(name);
  const base = name.replace(/\.[^/.]+$/, "");
  if (isText) {
    const text = decode(buffer);
    const delimiter = /\.tsv$/i.test(name) ? "\t" : detectDelimiter(text);
    sheets = [finish(base, parseDelimited(text, delimiter))];
  } else {
    const book = XLSX.read(buffer, { type: "array", dense: true, cellStyles: false, cellHTML: false });
    const meta = book.Workbook?.Sheets ?? [];
    sheets = book.SheetNames.map((sheetName, i) => {
      const raw = XLSX.utils.sheet_to_json<unknown[]>(book.Sheets[sheetName], {
        header: 1,
        raw: false,
        defval: "",
        blankrows: false,
      });
      const rows = raw.map((r) => r.map((v) => (v == null ? "" : String(v))));
      return finish(sheetName, rows, Boolean(meta[i]?.Hidden));
    });
  }
  const infos: SheetInfo[] = sheets.map((s) => ({ name: s.name, rows: s.rows.length, cols: s.cols, hidden: s.hidden }));
  reply({ type: "loaded", sheets: infos });
}

const startOf = (header: boolean) => (header ? 1 : 0);

function identity(sheet: Sheet, header: boolean): Uint32Array {
  const start = startOf(header);
  const out = new Uint32Array(Math.max(0, sheet.rows.length - start));
  for (let i = 0; i < out.length; i++) out[i] = i + start;
  return out;
}

function rowText(sheet: Sheet, index: number): string {
  let cached = sheet.lower[index];
  if (cached === undefined) {
    cached = sheet.rows[index].join("\u0001").toLowerCase();
    sheet.lower[index] = cached;
  }
  return cached;
}

function compare(sheet: Sheet, col: number, dir: 1 | -1) {
  const rows = sheet.rows;
  return (a: number, b: number) => {
    const x = rows[a][col] ?? "";
    const y = rows[b][col] ?? "";
    if (x === y) return a - b;
    if (x === "") return 1;
    if (y === "") return -1;
    const nx = Number(x.replace(/[,\s$€£%]/g, ""));
    const ny = Number(y.replace(/[,\s$€£%]/g, ""));
    if (!Number.isNaN(nx) && !Number.isNaN(ny)) return (nx - ny) * dir || a - b;
    return x.localeCompare(y, undefined, { numeric: true, sensitivity: "base" }) * dir || a - b;
  };
}

function buildView(msg: { sheet: number; header: boolean; query: string; sort: { col: number; dir: 1 | -1 } | null }) {
  const sheet = sheets[msg.sheet];
  if (!sheet) return;
  let indices = identity(sheet, msg.header);
  const q = msg.query.trim().toLowerCase();
  if (q) {
    const kept: number[] = [];
    for (let i = 0; i < indices.length; i++) if (rowText(sheet, indices[i]).includes(q)) kept.push(indices[i]);
    indices = Uint32Array.from(kept);
  }
  if (msg.sort) indices.sort(compare(sheet, msg.sort.col, msg.sort.dir));
  view = indices;

  const widths: number[] = [];
  const sample = Math.min(sheet.rows.length, 200);
  for (let c = 0; c < sheet.cols; c++) {
    let max = msg.header ? (sheet.rows[0]?.[c]?.length ?? 0) : 0;
    for (let r = 0; r < sample; r++) max = Math.max(max, sheet.rows[r][c]?.length ?? 0);
    widths.push(Math.min(320, Math.max(80, Math.round(max * 7.4 + 28))));
  }
  reply({ type: "view", id: 0, count: view.length, cols: sheet.cols, widths, header: msg.header ? (sheet.rows[0] ?? []) : null });
}

function toCsv(sheet: Sheet): string {
  const esc = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines: string[] = [];
  for (let i = 0; i < view.length; i++) lines.push(sheet.rows[view[i]].map(esc).join(","));
  return lines.join("\n");
}

onmessage = (event: MessageEvent<Request>) => {
  const msg = event.data;
  try {
    if (msg.type === "load") load(msg.name, msg.buffer);
    else if (msg.type === "view") buildView(msg);
    else if (msg.type === "rows") {
      const sheet = sheets[msg.sheet];
      const out: string[][] = [];
      const end = Math.min(msg.end, view.length);
      for (let i = msg.start; i < end; i++) out.push(sheet.rows[view[i]]);
      reply({ type: "rows", id: msg.id, start: msg.start, rows: out });
    } else if (msg.type === "csv") {
      const sheet = sheets[msg.sheet];
      reply({ type: "csv", text: sheet ? toCsv(sheet) : "" });
    }
  } catch (error) {
    reply({ type: "error", message: error instanceof Error ? error.message : "Could not read this file." });
  }
};
