export interface SheetInfo {
  name: string;
  rows: number;
  cols: number;
  hidden: boolean;
}

export type Sort = { col: number; dir: 1 | -1 } | null;

export type Request =
  | { type: "load"; name: string; buffer: ArrayBuffer }
  | { type: "view"; sheet: number; header: boolean; query: string; sort: Sort }
  | { type: "rows"; id: number; sheet: number; start: number; end: number }
  | { type: "csv"; sheet: number };

export type Reply =
  | { type: "loaded"; sheets: SheetInfo[] }
  | { type: "view"; id: number; count: number; cols: number; widths: number[]; header: string[] | null }
  | { type: "rows"; id: number; start: number; rows: string[][] }
  | { type: "csv"; text: string }
  | { type: "error"; message: string };
