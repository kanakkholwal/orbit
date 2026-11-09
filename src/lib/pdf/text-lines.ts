import type { PDFDocumentProxy } from "pdfjs-dist";

export interface Piece {
  text: string;
  x: number;
  end: number;
  size: number;
}

export interface Line {
  y: number;
  size: number;
  pieces: Piece[];
}

/** Groups a page's text items into top-to-bottom lines of left-to-right pieces. */
export async function pageLines(pdf: PDFDocumentProxy, pageNumber: number): Promise<{ lines: Line[]; width: number; height: number }> {
  const page = await pdf.getPage(pageNumber);
  const { width, height } = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  const rows: { y: number; pieces: Piece[] }[] = [];
  for (const item of content.items) {
    if (!("str" in item) || !item.str.trim()) continue;
    const [, , , d, x, y] = item.transform as number[];
    const size = Math.abs(d) || item.height || 10;
    const row = rows.find((r) => Math.abs(r.y - y) <= size * 0.4);
    const piece = { text: item.str, x, end: x + item.width, size };
    if (row) row.pieces.push(piece);
    else rows.push({ y, pieces: [piece] });
  }
  page.cleanup();
  rows.sort((a, b) => b.y - a.y);
  const lines = rows.map((r) => {
    r.pieces.sort((a, b) => a.x - b.x);
    const size = Math.max(...r.pieces.map((p) => p.size));
    return { y: r.y, size, pieces: r.pieces };
  });
  return { lines, width, height };
}

/** Joins a line's pieces, inserting a space where the gap is wider than a letter. */
export function lineText(line: Line): string {
  let out = "";
  let prev: Piece | null = null;
  for (const piece of line.pieces) {
    if (prev && piece.x - prev.end > piece.size * 0.15 && !out.endsWith(" ") && !piece.text.startsWith(" ")) out += " ";
    out += piece.text;
    prev = piece;
  }
  return out.replace(/\s+/g, " ").trim();
}

/** Splits a line into cells wherever the horizontal gap is wider than about two letters. */
export function lineCells(line: Line): string[] {
  const cells: string[] = [];
  let current = "";
  let prev: Piece | null = null;
  for (const piece of line.pieces) {
    if (prev && piece.x - prev.end > piece.size * 1.2) {
      cells.push(current.trim());
      current = "";
    } else if (prev && piece.x - prev.end > piece.size * 0.15 && !current.endsWith(" ")) current += " ";
    current += piece.text;
    prev = piece;
  }
  if (current.trim()) cells.push(current.trim());
  return cells;
}
