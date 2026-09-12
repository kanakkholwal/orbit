import type * as XLSX from "xlsx";
import { createBlock } from "../create-pdf/model/blocks";
import { DEFAULT_SETTINGS } from "../create-pdf/model/presets";
import { MARGIN_POINTS, pageBox } from "../create-pdf/model/themes";
import type { Block, CreatorDoc, PageSize } from "../create-pdf/model/types";

export type Orientation = "auto" | "portrait" | "landscape";
export type TextSize = "normal" | "small";

export interface SheetData {
  name: string;
  rows: string[][];
  columns: number;
  hidden: boolean;
}

export interface TableOptions {
  header: boolean;
  titles: boolean;
  striped: boolean;
  size: PageSize;
  orientation: Orientation;
  textSize: TextSize;
}

/** Sheets with more columns than this rarely fit a portrait page. */
export const WIDE_SHEET_COLUMNS = 12;

const MARGIN = "narrow";
const SAMPLE_ROWS = 300;

/** Spreadsheet column label for a 0-based index: 0 is A, 26 is AA. */
export function columnLetter(index: number): string {
  let n = index + 1;
  let label = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
}

/** Reads every sheet as trimmed rows of display text, dropping blank rows and trailing empty columns. */
export function readSheets(lib: typeof XLSX, data: ArrayBuffer | string, fallbackName: string): SheetData[] {
  const book = typeof data === "string" ? lib.read(data, { type: "string" }) : lib.read(data, { type: "array" });
  const meta = book.Workbook?.Sheets ?? [];
  return book.SheetNames.map((name, i) => {
    const raw = lib.utils.sheet_to_json<unknown[]>(book.Sheets[name], { header: 1, raw: false, defval: "", blankrows: false });
    const rows = raw
      .map((row) => row.map((value) => (value == null ? "" : String(value).replace(/\r\n?/g, "\n").trim())))
      .filter((row) => row.some((value) => value !== ""));
    let columns = 0;
    for (const row of rows) {
      for (let c = row.length - 1; c >= columns; c--) {
        if (row[c] !== "") {
          columns = c + 1;
          break;
        }
      }
    }
    return {
      name: typeof data === "string" || (book.SheetNames.length === 1 && /^Sheet\d*$/.test(name)) ? fallbackName : name,
      rows: rows.map((row) => Array.from({ length: columns }, (_, c) => row[c] ?? "")),
      columns,
      hidden: Boolean(meta[i]?.Hidden),
    };
  });
}

function columnWeights(columns: string[], rows: string[][]): number[] {
  return columns.map((title, c) => {
    let longest = title.length;
    for (let r = 0; r < Math.min(rows.length, SAMPLE_ROWS); r++) {
      const cell = rows[r][c] ?? "";
      const line = cell.split("\n").reduce((max, part) => Math.max(max, part.length), 0);
      if (line > longest) longest = line;
    }
    return Math.min(Math.max(longest, 4), 30);
  });
}

function tableFor(sheet: SheetData, options: TableOptions) {
  const [first, ...rest] = sheet.rows;
  const columns = options.header && first ? first : Array.from({ length: sheet.columns }, (_, c) => columnLetter(c));
  const rows = options.header ? rest : sheet.rows;
  return { columns, rows, widths: columnWeights(columns, rows) };
}

/** Whether a sheet's columns are estimated to overflow a portrait page. */
export function needsLandscape(sheet: SheetData, options: TableOptions): boolean {
  const { columns, widths } = tableFor(sheet, options);
  if (columns.length === 0) return false;
  const font = options.textSize === "small" ? 8 : 10.5;
  const padding = options.textSize === "small" ? 10 : 16;
  const estimate = widths.reduce((sum, w) => sum + w * font * 0.5 + padding, 0);
  return estimate > pageBox(options.size, "portrait").width - MARGIN_POINTS[MARGIN] * 2;
}

/** Builds a Create PDF document with one table per sheet, each starting on a new page. */
export function buildTableDoc(name: string, sheets: SheetData[], options: TableOptions): CreatorDoc {
  const blocks: Block[] = [];
  const filled = sheets.filter((sheet) => sheet.columns > 0);
  filled.forEach((sheet, i) => {
    if (i > 0) blocks.push(createBlock("pageBreak"));
    if (options.titles) blocks.push(createBlock("heading", { text: sheet.name, level: 2, align: "left" }));
    const { columns, rows, widths } = tableFor(sheet, options);
    blocks.push(createBlock("table", { columns, rows, widths, striped: options.striped, numericLast: false, compact: options.textSize === "small" }));
  });

  const landscape = options.orientation === "landscape" || (options.orientation === "auto" && filled.some((sheet) => needsLandscape(sheet, options)));
  return {
    version: 1,
    id: crypto.randomUUID(),
    name,
    theme: "orbit",
    accent: null,
    settings: {
      ...DEFAULT_SETTINGS,
      size: options.size,
      orientation: landscape ? "landscape" : "portrait",
      margin: MARGIN,
      header: { ...DEFAULT_SETTINGS.header, enabled: false },
      footer: { enabled: true, left: name, pageNumbers: true },
      watermark: { ...DEFAULT_SETTINGS.watermark, enabled: false },
    },
    data: {},
    blocks,
    updatedAt: Date.now(),
  };
}
