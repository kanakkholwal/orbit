import { loadPdfJs } from "$lib/pdf/pdfjs";
import { type Line, lineText, pageLines } from "$lib/pdf/text-lines";
import { yieldToMain } from "$lib/device-limits";

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const BULLET = /^([-*•●▪]|\d{1,2}[.)])\s+/;

function bodySize(all: Line[]): number {
  const counts = new Map<number, number>();
  for (const line of all) {
    const size = Math.round(line.size * 2) / 2;
    counts.set(size, (counts.get(size) ?? 0) + lineText(line).length);
  }
  let best = 11;
  let max = 0;
  for (const [size, weight] of counts) if (weight > max) [best, max] = [size, weight];
  return best;
}

export async function pdfToHtml(file: File, title: string, progress: (current: number, total: number) => void): Promise<string> {
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument(new Uint8Array(await file.arrayBuffer())).promise;
  const pages: Line[][] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    progress(i, pdf.numPages);
    pages.push((await pageLines(pdf, i)).lines);
    await yieldToMain();
  }
  await pdf.destroy();

  const base = bodySize(pages.flat());
  const html: string[] = [];
  pages.forEach((lines, index) => {
    html.push(`<section data-page="${index + 1}">`);
    let paragraph: string[] = [];
    let list: { ordered: boolean; items: string[] } | null = null;
    let prevY: number | null = null;
    let prevSize = base;
    const flushParagraph = () => {
      if (paragraph.length) html.push(`<p>${paragraph.join(" ")}</p>`);
      paragraph = [];
    };
    const flushList = () => {
      if (list) html.push(`<${list.ordered ? "ol" : "ul"}>${list.items.map((i) => `<li>${i}</li>`).join("")}</${list.ordered ? "ol" : "ul"}>`);
      list = null;
    };
    for (const line of lines) {
      const text = lineText(line);
      if (!text) continue;
      const ratio = line.size / base;
      const gap = prevY === null ? 0 : prevY - line.y;
      if (ratio >= 1.25 && text.length < 140) {
        flushParagraph();
        flushList();
        const level = ratio >= 1.8 ? 1 : ratio >= 1.4 ? 2 : 3;
        html.push(`<h${level}>${escapeHtml(text)}</h${level}>`);
      } else if (BULLET.test(text)) {
        flushParagraph();
        const ordered = /^\d/.test(text);
        if (!list || list.ordered !== ordered) {
          flushList();
          list = { ordered, items: [] };
        }
        list.items.push(escapeHtml(text.replace(BULLET, "")));
      } else {
        flushList();
        if (paragraph.length && (gap > prevSize * 1.9 || Math.abs(line.size - prevSize) > 1.5)) flushParagraph();
        paragraph.push(escapeHtml(text));
      }
      prevY = line.y;
      prevSize = line.size;
    }
    flushParagraph();
    flushList();
    html.push("</section>");
  });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
body{font:16px/1.6 system-ui,sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem;color:#1a1a1a}
section{padding-bottom:1.5rem;margin-bottom:1.5rem;border-bottom:1px solid #e5e5e5}
h1,h2,h3{line-height:1.25}
</style>
</head>
<body>
${html.join("\n")}
</body>
</html>
`;
}
