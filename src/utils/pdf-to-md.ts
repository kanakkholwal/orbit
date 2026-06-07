import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

interface Line {
    text: string;
    size: number;
    x: number;
    y: number;
}

function extractLines(items: TextItem[]): Line[] {
    const rows: { y: number; items: TextItem[] }[] = [];
    for (const item of items) {
        if (!item.str) continue;
        const y = Math.round(item.transform[5]);
        // Group items whose baseline is within 3pt onto the same visual line.
        let row = rows.find((r) => Math.abs(r.y - y) <= 3);
        if (!row) {
            row = { y, items: [] };
            rows.push(row);
        }
        row.items.push(item);
    }

    rows.sort((a, b) => b.y - a.y); // top → bottom

    return rows.map((row) => {
        row.items.sort((a, b) => a.transform[4] - b.transform[4]); // left → right
        const text = row.items
            .map((i) => i.str)
            .join('')
            .replace(/\s+/g, ' ')
            .trim();
        const size = Math.max(...row.items.map((i) => Math.abs(i.transform[0]) || i.height || 0));
        const x = Math.min(...row.items.map((i) => i.transform[4]));
        return { text, size, x, y: row.y };
    });
}

function median(values: number[]): number {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

const BULLET = /^([••●▪*-]|–)\s+/;
const NUMBERED = /^\d+[.)]\s+/;

/**
 * Best-effort PDF → Markdown. Text-based PDFs only (scanned/image PDFs yield
 * little — use OCR first). Headings are inferred from relative font size,
 * bullets/numbers are detected, and paragraphs are split on vertical gaps.
 */
export async function pdfToMarkdown(
    pdfDoc: PDFDocumentProxy,
    onProgress?: (page: number, total: number) => void
): Promise<string> {
    const total = pdfDoc.numPages;
    const out: string[] = [];

    // First pass: collect every line + a global body-size baseline.
    const pages: Line[][] = [];
    const allSizes: number[] = [];
    for (let p = 1; p <= total; p++) {
        const page: PDFPageProxy = await pdfDoc.getPage(p);
        const content = await page.getTextContent();
        const lines = extractLines(content.items.filter((i): i is TextItem => 'str' in i));
        pages.push(lines);
        for (const l of lines) if (l.text) allSizes.push(l.size);
        onProgress?.(p, total);
    }

    const body = median(allSizes) || 12;

    for (let pi = 0; pi < pages.length; pi++) {
        const lines = pages[pi];
        let prevY: number | null = null;
        let paragraph: string[] = [];

        const flush = () => {
            if (paragraph.length) {
                out.push(paragraph.join(' '));
                paragraph = [];
            }
        };

        for (const line of lines) {
            if (!line.text) {
                flush();
                continue;
            }

            const ratio = line.size / body;
            const big = ratio >= 1.3;

            // Large vertical gap → paragraph break.
            if (prevY !== null && prevY - line.y > line.size * 1.8) flush();
            prevY = line.y;

            if (big) {
                flush();
                const level = ratio >= 1.8 ? '#' : ratio >= 1.5 ? '##' : '###';
                out.push(`${level} ${line.text}`);
                continue;
            }

            if (BULLET.test(line.text)) {
                flush();
                out.push(`- ${line.text.replace(BULLET, '')}`);
                continue;
            }
            if (NUMBERED.test(line.text)) {
                flush();
                out.push(line.text); // keep "1. ..." as-is
                continue;
            }

            paragraph.push(line.text);
        }
        flush();

        if (pi < pages.length - 1) out.push(''); // blank line between pages
    }

    // Collapse 3+ blank lines, ensure paragraphs are separated by one blank line.
    return out
        .join('\n\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim() + '\n';
}
