import JSZip from "jszip";
import { yieldToMain } from "$lib/device-limits";
import { loadPdfJs } from "$lib/pdf/pdfjs";
import { lineCells, pageLines } from "$lib/pdf/text-lines";

const csvCell = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export interface FoundTable {
  page: number;
  rows: string[][];
}

/** Runs of two or more consecutive lines that split into several cells are treated as tables. */
export async function findTables(file: File, progress: (current: number, total: number) => void): Promise<FoundTable[]> {
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument(new Uint8Array(await file.arrayBuffer())).promise;
  const tables: FoundTable[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    progress(i, pdf.numPages);
    const { lines } = await pageLines(pdf, i);
    let run: string[][] = [];
    const flush = () => {
      if (run.length >= 2) tables.push({ page: i, rows: run });
      run = [];
    };
    for (const line of lines) {
      const cells = lineCells(line);
      if (cells.length >= 2) run.push(cells);
      else flush();
    }
    flush();
    await yieldToMain();
  }
  await pdf.destroy();
  return tables;
}

const toCsv = (rows: string[][]) => {
  const width = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => Array.from({ length: width }, (_, i) => csvCell(r[i] ?? "")).join(",")).join("\n");
};

export async function tablesToFile(tables: FoundTable[], base: string): Promise<{ blob: Blob; name: string }> {
  if (tables.length === 1) return { blob: new Blob([toCsv(tables[0].rows)], { type: "text/csv;charset=utf-8" }), name: `${base}.csv` };
  const zip = new JSZip();
  tables.forEach((t, i) => zip.file(`${base}-table-${i + 1}-page-${t.page}.csv`, toCsv(t.rows)));
  return { blob: await zip.generateAsync({ type: "blob" }), name: `${base}-tables.zip` };
}
