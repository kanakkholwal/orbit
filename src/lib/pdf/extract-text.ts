import { yieldToMain } from "$lib/device-limits";
import { loadPdfJs } from "./pdfjs";
import { lineText, pageLines } from "./text-lines";

/** Plain text of a PDF, with blank lines between paragraphs and pages. */
export async function extractPdfText(file: File, progress?: (current: number, total: number) => void): Promise<{ text: string; pages: number }> {
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument(new Uint8Array(await file.arrayBuffer())).promise;
  const out: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    progress?.(i, pdf.numPages);
    const { lines } = await pageLines(pdf, i);
    let para: string[] = [];
    let prev: { y: number; size: number } | null = null;
    for (const line of lines) {
      const text = lineText(line);
      if (!text) continue;
      if (prev && prev.y - line.y > prev.size * 1.9 && para.length) {
        out.push(para.join(" "));
        para = [];
      }
      para.push(text);
      prev = { y: line.y, size: line.size };
    }
    if (para.length) out.push(para.join(" "));
    await yieldToMain();
  }
  const pages = pdf.numPages;
  await pdf.destroy();
  return { text: out.join("\n\n"), pages };
}
