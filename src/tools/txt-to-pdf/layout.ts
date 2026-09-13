import { PageSizes, PDFDocument, type PDFFont, rgb, StandardFonts } from 'pdf-lib';

export type TextFont = 'helv' | 'times' | 'cour';

export interface TextPdfOptions {
  font: TextFont;
  fontSize: number;
  textColor: string;
  pageSize: string;
  margin?: number;
  lineHeight?: number;
}

const FONTS: Record<TextFont, StandardFonts> = {
  helv: StandardFonts.Helvetica,
  times: StandardFonts.TimesRoman,
  cour: StandardFonts.Courier
};

const PAGE_SIZES: Record<string, [number, number]> = {
  A3: PageSizes.A3,
  A4: PageSizes.A4,
  A5: PageSizes.A5,
  LETTER: PageSizes.Letter,
  LEGAL: PageSizes.Legal
};

const TAB_WIDTH = 4;

function hexToRgb(hex: string) {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m) return rgb(0, 0, 0);
  const full = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  const n = Number.parseInt(full, 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function expandTabs(line: string) {
  let out = '';
  for (const ch of line) {
    out += ch === '\t' ? ' '.repeat(TAB_WIDTH - (out.length % TAB_WIDTH)) : ch;
  }
  return out;
}

function wrapLine(line: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const width = (s: string) => font.widthOfTextAtSize(s, size);
  if (width(line) <= maxWidth) return [line];

  const rows: string[] = [];
  let current = '';
  for (const token of line.match(/\s+|\S+/g) ?? []) {
    if (width(current + token) <= maxWidth) {
      current += token;
      continue;
    }
    if (/^\s+$/.test(token)) {
      rows.push(current);
      current = '';
      continue;
    }
    if (current.trim()) rows.push(current.replace(/\s+$/, ''));
    current = '';
    if (width(token) <= maxWidth) {
      current = token;
      continue;
    }
    let used = 0;
    for (const ch of token) {
      const w = width(ch);
      if (current && used + w > maxWidth) {
        rows.push(current);
        current = '';
        used = 0;
      }
      current += ch;
      used += w;
    }
  }
  if (current || rows.length === 0) rows.push(current);
  return rows;
}

/** Lays out each text as its own run of pages with standard PDF fonts. */
export async function buildTextPdf(texts: string[], options: TextPdfOptions) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(FONTS[options.font] ?? StandardFonts.Helvetica);
  const supported = new Set(font.getCharacterSet());
  const size = Math.min(Math.max(Number(options.fontSize) || 12, 4), 200);
  const leading = size * (options.lineHeight ?? 1.35);
  const margin = options.margin ?? 72;
  const color = hexToRgb(options.textColor);
  const [pageWidth, pageHeight] = PAGE_SIZES[options.pageSize.toUpperCase()] ?? PageSizes.A4;
  const maxWidth = pageWidth - margin * 2;
  let replaced = 0;

  const clean = (s: string) => {
    let out = '';
    for (const ch of s) {
      const code = ch.codePointAt(0) ?? 0;
      if (supported.has(code)) out += ch;
      else if (code < 32) out += ' ';
      else {
        out += '?';
        replaced++;
      }
    }
    return out;
  };

  for (const text of texts) {
    let page = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin - size;
    for (const raw of text.replace(/\r\n?/g, '\n').split('\n')) {
      for (const row of wrapLine(clean(expandTabs(raw)), font, size, maxWidth)) {
        if (y < margin) {
          page = doc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin - size;
        }
        if (row.trim()) page.drawText(row, { x: margin, y, size, font, color });
        y -= leading;
      }
    }
  }

  return { bytes: await doc.save(), replaced };
}
