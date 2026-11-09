import { Lexer, marked, type Token, type Tokens } from 'marked';
import fontkit from '@pdf-lib/fontkit';
import { getFontForLanguage } from '$utils/font-loader';
import { htmlToMarkdown } from '$utils/html-to-md';
import { PDFDocument, type PDFFont, type PDFImage, type PDFPage, PDFString, StandardFonts, rgb } from 'pdf-lib';

export interface MdToPdfOptions {
    /** Page size in points. Default A4. */
    pageWidth?: number;
    pageHeight?: number;
    margin?: number;
    baseFontSize?: number;
    title?: string;
}

interface Run {
    text: string;
    bold?: boolean;
    italic?: boolean;
    mono?: boolean;
    strike?: boolean;
    link?: boolean;
    href?: string;
}

type Word = {
    text: string;
    font: PDFFont;
    width: number;
    hardBreak?: boolean;
    strike?: boolean;
    link?: boolean;
    href?: string;
};

const HEADING_SIZE = [24, 24, 19, 16, 14, 12, 11]; // index by depth (1..6)
const MARKED_OPTS = { gfm: true } as const;
const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i;
const ALERT_COLORS = {
    NOTE: rgb(0.09, 0.45, 0.83),
    TIP: rgb(0.1, 0.53, 0.33),
    IMPORTANT: rgb(0.51, 0.27, 0.89),
    WARNING: rgb(0.6, 0.4, 0),
    CAUTION: rgb(0.81, 0.16, 0.18)
} as const;

// pdf-lib StandardFonts only encode WinAnsi (Latin-1). Replace the common
// typographic characters Markdown/source tends to contain so they don't throw.
let keepUnicode = false;

const SHORTCODES: Record<string, string> = {
    smile: ':)', grinning: ':D', wink: ';)', heart: '<3', warning: '(!)', white_check_mark: '[x]', heavy_check_mark: '[x]',
    x: '[ ]', no_entry: '(no)', information_source: '(i)', bulb: '(idea)', memo: '', rocket: '', tada: '', sparkles: '',
    star: '*', '+1': '(+1)', '-1': '(-1)', fire: '', zap: '', lock: '', book: '', link: ''
};

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu;

function sanitize(text: string): string {
    const out = text
        .replace(/:([a-z0-9_+-]+):/g, (m, name) => (name in SHORTCODES ? SHORTCODES[name] : m))
        .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
        .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/\u2026/g, '...')
        .replace(/\u2022/g, '-')
        .replace(/\u00A0/g, ' ')
        .replace(/\u2192/g, '->')
        .replace(/[\u2713\u2714]/g, 'v')
        .replace(/[\u2717\u2718]/g, 'x')
        .replace(EMOJI, '');
    return keepUnicode ? out : out.replace(/[^\x00-\xFF]/g, '');
}

/** Tesseract-style language codes of the scripts in the text that Helvetica cannot draw. */
function scriptsIn(text: string): string[] {
    const found = new Set<string>();
    if (/[\u0100-\u024F\u0370-\u03FF\u0400-\u04FF]/.test(text)) found.add('eng');
    if (/[\u0900-\u097F]/.test(text)) found.add('hin');
    if (/[\u3040-\u30FF]/.test(text)) found.add('jpn');
    if (/[\u4E00-\u9FFF]/.test(text)) found.add('chi_sim');
    if (/[\uAC00-\uD7AF]/.test(text)) found.add('kor');
    return [...found];
}

const scriptOf = (ch: string): string => {
    if (/[\u0900-\u097F]/.test(ch)) return 'hin';
    if (/[\u3040-\u30FF]/.test(ch)) return 'jpn';
    if (/[\u4E00-\u9FFF]/.test(ch)) return 'chi_sim';
    if (/[\uAC00-\uD7AF]/.test(ch)) return 'kor';
    return 'eng';
};

function flattenInline(tokens: Token[] | undefined, ctx: Omit<Run, 'text'> = {}): Run[] {
    if (!tokens) return [];
    const runs: Run[] = [];
    for (const t of tokens as Tokens.Generic[]) {
        switch (t.type) {
            case 'strong':
                runs.push(...flattenInline(t.tokens, { ...ctx, bold: true }));
                break;
            case 'em':
                runs.push(...flattenInline(t.tokens, { ...ctx, italic: true }));
                break;
            case 'del':
                runs.push(...flattenInline(t.tokens, { ...ctx, strike: true }));
                break;
            case 'codespan':
                runs.push({ text: sanitize(t.text), ...ctx, mono: true });
                break;
            case 'link':
                runs.push(...flattenInline(t.tokens, { ...ctx, link: true, href: typeof t.href === 'string' ? t.href : undefined }));
                break;
            case 'image':
                runs.push({
                    text: sanitize(t.text || t.title || 'image'),
                    ...ctx,
                    italic: true
                });
                break;
            case 'br':
                runs.push({ text: '\n', ...ctx });
                break;
            case 'checkbox':
                break;
            case 'escape':
            case 'text':
                if (t.tokens) runs.push(...flattenInline(t.tokens, ctx));
                else runs.push({ text: sanitize(t.text), ...ctx });
                break;
            case 'html':
                runs.push({ text: sanitize(htmlToPlain(String(t.text ?? t.raw ?? ''))), ...ctx });
                break;
            default:
                if (t.tokens) runs.push(...flattenInline(t.tokens, ctx));
                else if (typeof t.text === 'string') runs.push({ text: sanitize(t.text), ...ctx });
        }
    }
    return runs;
}

function htmlToPlain(html: string): string {
    if (typeof DOMParser !== 'undefined') {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        for (const br of doc.querySelectorAll('br')) br.replaceWith('\n');
        for (const el of doc.querySelectorAll('p,div,li,h1,h2,h3,h4,h5,h6,tr')) {
            el.append('\n');
        }
        return sanitize((doc.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim());
    }
    return sanitize(
        html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .trim()
    );
}

function parseAlign(value: string | null | undefined): Tokens.TableCell['align'] {
    const v = (value ?? '').toLowerCase();
    if (v === 'center' || v === 'right' || v === 'left') return v;
    return null;
}

function tableFromRows(raw: string, rows: Tokens.TableCell[][]): Tokens.Table | null {
    if (!rows.length || !rows[0].length) return null;
    const header = rows[0].map((cell) => ({ ...cell, header: true }));
    const align = header.map((cell) => cell.align);
    const body = rows.slice(1).map((row) => {
        const cells = row.map((cell, i) => ({
            ...cell,
            header: false,
            align: cell.align ?? align[i] ?? null
        }));
        while (cells.length < header.length) {
            cells.push({
                text: '',
                tokens: [],
                header: false,
                align: align[cells.length] ?? null
            });
        }
        return cells.slice(0, header.length);
    });
    return { type: 'table', raw, align, header, rows: body };
}

function tablesFromHtmlFallback(html: string): Tokens.Table[] {
    const tables: Tokens.Table[] = [];
    const tableRe = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
    let tableMatch: RegExpExecArray | null;
    while ((tableMatch = tableRe.exec(html))) {
        const rows: Tokens.TableCell[][] = [];
        const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
        let rowMatch: RegExpExecArray | null;
        while ((rowMatch = rowRe.exec(tableMatch[1]))) {
            const cells: Tokens.TableCell[] = [];
            const cellRe = /<(th|td)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
            let cellMatch: RegExpExecArray | null;
            while ((cellMatch = cellRe.exec(rowMatch[1]))) {
                const text = (cellMatch[3] ?? '')
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<[^>]+>/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                const attrs = cellMatch[2] ?? '';
                const alignMatch =
                    attrs.match(/align=["']?(left|center|right)/i) ??
                    attrs.match(/text-align:\s*(left|center|right)/i);
                cells.push({
                    text,
                    tokens: Lexer.lexInline(text, MARKED_OPTS),
                    header: cellMatch[1].toLowerCase() === 'th',
                    align: parseAlign(alignMatch?.[1])
                });
            }
            if (cells.length) rows.push(cells);
        }
        const table = tableFromRows(tableMatch[0], rows);
        if (table) tables.push(table);
    }
    return tables;
}

function tablesFromHtml(html: string): Tokens.Table[] {
    if (!/<table/i.test(html)) return [];
    if (typeof DOMParser === 'undefined') return tablesFromHtmlFallback(html);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tables: Tokens.Table[] = [];
    for (const table of doc.querySelectorAll('table')) {
        const parseRow = (tr: Element, header: boolean): Tokens.TableCell[] =>
            [...tr.querySelectorAll(':scope > th, :scope > td')].map((cell) => {
                const text = (cell.textContent ?? '').replace(/\s+/g, ' ').trim();
                const align =
                    parseAlign(cell.getAttribute('align')) ??
                    parseAlign((cell as HTMLElement).style?.textAlign);
                return {
                    text,
                    tokens: Lexer.lexInline(text, MARKED_OPTS),
                    header,
                    align
                };
            });

        const allRows = [...table.querySelectorAll('tr')].filter((tr) => tr.querySelector('th,td'));
        if (!allRows.length) continue;

        const headRow =
            table.querySelector('thead tr') ??
            allRows.find((tr) => tr.querySelector('th')) ??
            allRows[0];
        const header = parseRow(headRow, true);
        if (!header.length) continue;

        const bodyRows = allRows.filter((tr) => tr !== headRow);
        const parsed = tableFromRows(table.outerHTML, [
            header,
            ...bodyRows.map((tr) => parseRow(tr, false))
        ]);
        if (parsed) tables.push(parsed);
    }
    return tables.length ? tables : tablesFromHtmlFallback(html);
}

function splitAlert(tokens: Token[]): { kind: keyof typeof ALERT_COLORS | null; tokens: Token[] } {
    if (!tokens.length) return { kind: null, tokens };
    const first = tokens[0] as Tokens.Generic;
    if (first.type !== 'paragraph' && first.type !== 'text') return { kind: null, tokens };
    const raw = String(first.text ?? '');
    const match = raw.match(ALERT_RE);
    if (!match) return { kind: null, tokens };
    const kind = match[1].toUpperCase() as keyof typeof ALERT_COLORS;
    const rest = raw.slice(match[0].length);
    const next = tokens.slice(1);
    if (rest.trim()) {
        const rebuilt = {
            ...first,
            text: rest,
            tokens: Lexer.lexInline(rest, MARKED_OPTS)
        } as Token;
        return { kind, tokens: [rebuilt, ...next] };
    }
    return { kind, tokens: next };
}

function distributeWidths(preferred: number[], total: number, minW: number): number[] {
    const n = preferred.length;
    if (n === 0) return [];
    const capped = preferred.map((w) => Math.min(Math.max(w, minW), total));
    const sum = capped.reduce((a, b) => a + b, 0) || n;
    const raw = capped.map((w) => (w / sum) * total);
    if (raw.reduce((a, b) => a + b, 0) <= total) {
        const extra = total - raw.reduce((a, b) => a + b, 0);
        raw[n - 1] += extra;
        return raw;
    }
    return preferred.map(() => total / n);
}

export async function markdownToPdf(
    markdown: string,
    options: MdToPdfOptions = {}
): Promise<Uint8Array> {
    const {
        pageWidth = 595.28,
        pageHeight = 841.89,
        margin = 56,
        baseFontSize = 11
    } = options;

    const doc = await PDFDocument.create();
    if (options.title) doc.setTitle(options.title);

    const fonts = {
        regular: await doc.embedFont(StandardFonts.Helvetica),
        bold: await doc.embedFont(StandardFonts.HelveticaBold),
        italic: await doc.embedFont(StandardFonts.HelveticaOblique),
        boldItalic: await doc.embedFont(StandardFonts.HelveticaBoldOblique),
        mono: await doc.embedFont(StandardFonts.Courier),
        monoBold: await doc.embedFont(StandardFonts.CourierBold)
    };

    const fallback = new Map<string, PDFFont>();
    keepUnicode = false;
    const needed = scriptsIn(markdown);
    if (needed.length > 0) {
        doc.registerFontkit(fontkit);
        for (const code of needed) {
            try {
                fallback.set(code, await doc.embedFont(await getFontForLanguage(code), { subset: true }));
            } catch {
                /* offline or blocked: those characters are dropped */
            }
        }
        keepUnicode = fallback.size > 0;
    }
    const fontForWord = (word: string, base: PDFFont): PDFFont => {
        if (!keepUnicode) return base;
        const ch = [...word].find((c) => c.charCodeAt(0) > 0xff);
        if (!ch) return base;
        return fallback.get(scriptOf(ch)) ?? fallback.get('eng') ?? base;
    };

    const pickFont = (r: Omit<Run, 'text'>): PDFFont => {
        if (r.mono) return r.bold ? fonts.monoBold : fonts.mono;
        if (r.bold && r.italic) return fonts.boldItalic;
        if (r.bold) return fonts.bold;
        if (r.italic) return fonts.italic;
        return fonts.regular;
    };

    const contentWidth = pageWidth - margin * 2;
    const ink = rgb(0.149, 0.145, 0.118); // #26251e
    const muted = rgb(0.353, 0.345, 0.322);
    const codeBg = rgb(0.937, 0.933, 0.91);
    const headerBg = rgb(0.965, 0.961, 0.945);
    const rule = rgb(0.81, 0.804, 0.769);
    const linkColor = rgb(0.09, 0.4, 0.74);

    let page: PDFPage = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const newPage = () => {
        page = doc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
    };
    const ensure = (h: number) => {
        if (y - h < margin) newPage();
    };

    const safeWidth = (f: PDFFont, text: string, size: number) => {
        try {
            return f.widthOfTextAtSize(text, size);
        } catch {
            return text.length * size * 0.5;
        }
    };

    const wordsFromRuns = (runs: Run[], size: number): Word[] => {
        const words: Word[] = [];
        for (const run of runs) {
            const font = pickFont(run);
            const parts = run.text.split('\n');
            parts.forEach((part, pi) => {
                if (pi > 0) words.push({ text: '', font, width: 0, hardBreak: true });
                for (const w of part.split(/(\s+)/)) {
                    if (w === '') continue;
                    if (/^\s+$/.test(w)) {
                        words.push({
                            text: ' ',
                            font,
                            width: font.widthOfTextAtSize(' ', size),
                            strike: run.strike,
                            link: run.link,
                            href: run.href
                        });
                    } else {
                        const wf = fontForWord(w, font);
                        words.push({
                            text: w,
                            font: wf,
                            width: safeWidth(wf, w, size),
                            strike: run.strike,
                            link: run.link,
                            href: run.href
                        });
                    }
                }
            });
        }
        return words;
    };

    const wrapWords = (words: Word[], maxWidth: number): Word[][] => {
        const lines: Word[][] = [];
        let line: Word[] = [];
        let lineWidth = 0;
        const flush = () => {
            if (line.length) lines.push(line);
            line = [];
            lineWidth = 0;
        };
        for (const w of words) {
            if (w.hardBreak) {
                flush();
                continue;
            }
            if (w.text === ' ' && line.length === 0) continue;
            if (lineWidth + w.width > maxWidth && line.length > 0) {
                if (line[line.length - 1].text === ' ') {
                    lineWidth -= line[line.length - 1].width;
                    line.pop();
                }
                flush();
                if (w.text === ' ') continue;
            }
            line.push(w);
            lineWidth += w.width;
        }
        if (line.length) flush();
        return lines.length ? lines : [[]];
    };

    const lineWidthOf = (line: Word[]) => line.reduce((sum, w) => sum + w.width, 0);

    /** Makes the box a clickable link. Only web, mail and phone addresses are allowed. */
    const addLink = (x1: number, y1: number, x2: number, y2: number, uri: string) => {
        if (!/^(https?:|mailto:|tel:)/i.test(uri)) return;
        const ctx = doc.context;
        const annot = ctx.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [x1, y1, x2, y2],
            Border: [0, 0, 0],
            A: { Type: 'Action', S: 'URI', URI: PDFString.of(uri) }
        });
        page.node.addAnnot(ctx.register(annot));
    };

    const paintLine = (line: Word[], x: number, baseline: number, size: number, color = ink) => {
        let cx = x;
        let open: { href: string; x: number } | null = null;
        const close = (endX: number) => {
            if (open) addLink(open.x, baseline - size * 0.25, endX, baseline + size * 0.85, open.href);
            open = null;
        };
        for (const w of line) {
            if (open && open.href !== w.href) close(cx);
            if (w.href && !open) open = { href: w.href, x: cx };
            if (w.text) {
                const wordColor = w.link ? linkColor : color;
                page.drawText(w.text, { x: cx, y: baseline, size, font: w.font, color: wordColor });
                if (w.strike || w.link) {
                    const ly = w.strike ? baseline + size * 0.35 : baseline - 1;
                    page.drawLine({
                        start: { x: cx, y: ly },
                        end: { x: cx + w.width, y: ly },
                        thickness: 0.6,
                        color: wordColor
                    });
                }
            }
            cx += w.width;
        }
        close(cx);
    };

    const drawRuns = (
        runs: Run[],
        x: number,
        size: number,
        opts: { leading?: number; color?: ReturnType<typeof rgb>; maxWidth?: number } = {}
    ) => {
        const leading = opts.leading ?? size * 1.45;
        const color = opts.color ?? ink;
        const maxWidth = opts.maxWidth ?? pageWidth - margin - x;
        const lines = wrapWords(wordsFromRuns(runs, size), maxWidth);
        for (const line of lines) {
            ensure(leading);
            paintLine(line, x, y - size, size, color);
            y -= leading;
        }
    };

    const gap = (h: number) => {
        y -= h;
        if (y < margin) newPage();
    };

    const wrapMonoLines = (text: string, size: number, maxWidth: number): string[] => {
        const out: string[] = [];
        for (const line of text.split('\n')) {
            if (fonts.mono.widthOfTextAtSize(line, size) <= maxWidth) {
                out.push(line);
                continue;
            }
            let buf = '';
            for (const ch of line) {
                if (fonts.mono.widthOfTextAtSize(buf + ch, size) > maxWidth && buf) {
                    out.push(buf);
                    buf = ch;
                } else {
                    buf += ch;
                }
            }
            if (buf) out.push(buf);
        }
        return out.length ? out : [''];
    };

    type CellView = { lines: Word[][]; align: Tokens.TableCell['align'] };
    type RowView = { cells: CellView[]; height: number };

    const layoutTable = (table: Tokens.Table, tableWidth: number, size: number) => {
        const colCount = table.header.length;
        if (!colCount) return null;
        const pad = 6;
        const leading = size * 1.35;
        const allRows = [table.header, ...table.rows];
        const preferred = Array(colCount).fill(0) as number[];

        for (const row of allRows) {
            row.forEach((cell, i) => {
                if (i >= colCount) return;
                const words = wordsFromRuns(flattenInline(cell.tokens, { bold: cell.header }), size);
                let lineW = 0;
                let maxW = 0;
                for (const word of words) {
                    if (word.hardBreak) {
                        maxW = Math.max(maxW, lineW);
                        lineW = 0;
                        continue;
                    }
                    lineW += word.width;
                }
                preferred[i] = Math.max(preferred[i], Math.max(maxW, lineW) + pad * 2);
            });
        }

        const cols = distributeWidths(preferred, tableWidth, 40);

        const wrapRow = (row: Tokens.TableCell[], header: boolean): RowView => {
            const cells: CellView[] = [];
            for (let i = 0; i < colCount; i++) {
                const cell = row[i] ?? {
                    text: '',
                    tokens: [],
                    header,
                    align: table.align[i] ?? null
                };
                const lines = wrapWords(
                    wordsFromRuns(flattenInline(cell.tokens, { bold: header || cell.header }), size),
                    Math.max(8, cols[i] - pad * 2)
                );
                cells.push({ lines, align: table.align[i] ?? cell.align });
            }
            const height =
                Math.max(leading, ...cells.map((c) => Math.max(1, c.lines.length) * leading)) + pad * 2;
            return { cells, height };
        };

        return {
            cols,
            pad,
            leading,
            header: wrapRow(table.header, true),
            body: table.rows.map((row) => wrapRow(row, false))
        };
    };

    const drawTable = (table: Tokens.Table, indent: number) => {
        const tableWidth = contentWidth - indent;
        const size = baseFontSize * 0.95;
        const layout = layoutTable(table, tableWidth, size);
        if (!layout) return;
        const tableX = margin + indent;

        const drawRow = (view: RowView, header: boolean) => {
            ensure(view.height);
            const top = y;
            const bottom = y - view.height;
            if (header) {
                page.drawRectangle({
                    x: tableX,
                    y: bottom,
                    width: tableWidth,
                    height: view.height,
                    color: headerBg
                });
            }
            page.drawRectangle({
                x: tableX,
                y: bottom,
                width: tableWidth,
                height: view.height,
                borderColor: rule,
                borderWidth: 0.6
            });
            let cx = tableX;
            view.cells.forEach((cell, i) => {
                if (i > 0) {
                    page.drawLine({
                        start: { x: cx, y: top },
                        end: { x: cx, y: bottom },
                        thickness: 0.6,
                        color: rule
                    });
                }
                let ty = top - layout.pad;
                for (const line of cell.lines) {
                    const lw = lineWidthOf(line);
                    let lx = cx + layout.pad;
                    if (cell.align === 'right') lx = cx + layout.cols[i] - layout.pad - lw;
                    else if (cell.align === 'center') lx = cx + (layout.cols[i] - lw) / 2;
                    paintLine(line, lx, ty - size, size);
                    ty -= layout.leading;
                }
                cx += layout.cols[i];
            });
            y = bottom;
        };

        drawRow(layout.header, true);
        for (const row of layout.body) {
            if (y - row.height < margin) {
                newPage();
                drawRow(layout.header, true);
            }
            drawRow(row, false);
        }
        gap(baseFontSize * 0.7);
    };

    const renderHtml = (html: string, indent: number) => {
        const converted = htmlTokens.get(html);
        if (converted) {
            renderBlocks(converted, indent);
            return;
        }
        const tables = tablesFromHtml(html);
        for (const table of tables) drawTable(table, indent);
        const leftover = html
            .replace(/<table[\s\S]*?<\/table>/gi, '')
            .trim();
        const plain = leftover ? htmlToPlain(leftover) : '';
        if (plain) {
            drawRuns([{ text: plain }], margin + indent, baseFontSize);
            gap(baseFontSize * 0.4);
        }
    };

    const images = new Map<string, PDFImage>();
    const htmlTokens = new Map<string, Token[]>();

    const rasterize = async (blob: Blob): Promise<Uint8Array | null> => {
        const url = URL.createObjectURL(blob);
        try {
            const img = new Image();
            img.src = url;
            await img.decode();
            const w = Math.min(img.naturalWidth || 200, 1200);
            const h = Math.round((img.naturalHeight || 100) * (w / (img.naturalWidth || 200)));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, w * 2);
            canvas.height = Math.max(1, h * 2);
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
            canvas.width = canvas.height = 0;
            return png ? new Uint8Array(await png.arrayBuffer()) : null;
        } catch {
            return null;
        } finally {
            URL.revokeObjectURL(url);
        }
    };

    const loadImage = async (href: string): Promise<PDFImage | null> => {
        try {
            let blob: Blob;
            if (href.startsWith('data:')) blob = await (await fetch(href)).blob();
            else if (/^https?:/i.test(href)) {
                const res = await fetch(href, { signal: AbortSignal.timeout(6000) });
                if (!res.ok) return null;
                blob = await res.blob();
            } else return null;
            const bytes = new Uint8Array(await blob.arrayBuffer());
            if (bytes[0] === 0x89 && bytes[1] === 0x50) return await doc.embedPng(bytes);
            if (bytes[0] === 0xff && bytes[1] === 0xd8) return await doc.embedJpg(bytes);
            const png = await rasterize(blob);
            return png ? await doc.embedPng(png) : null;
        } catch {
            return null;
        }
    };

    /** Embeds every picture up front, since drawing is synchronous. Unreachable ones fall back to alt text. */
    const embedImages = async (tokens: Token[]) => {
        const hrefs = new Set<string>();
        const walk = (list: Token[] | undefined) => {
            for (const t of (list ?? []) as Tokens.Generic[]) {
                if (t.type === 'image' && typeof t.href === 'string') hrefs.add(t.href);
                if (t.type === 'html') {
                    const raw = String(t.text ?? t.raw ?? '');
                    if (!htmlTokens.has(raw) && typeof DOMParser !== 'undefined') {
                        htmlTokens.set(raw, new Lexer(MARKED_OPTS).lex(htmlToMarkdown(raw)));
                    }
                    walk(htmlTokens.get(raw));
                }
                walk(t.tokens as Token[] | undefined);
                if (t.items) for (const item of t.items) walk(item.tokens);
                if (t.rows) for (const row of t.rows) for (const cell of row) walk(cell.tokens);
            }
        };
        walk(tokens);
        const list = [...hrefs].slice(0, 40);
        await Promise.all(
            list.map(async (href) => {
                const image = await loadImage(href);
                if (image) images.set(href, image);
            })
        );
    };

    const renderBlocks = (tokens: Token[], indent = 0) => {
        for (const token of tokens as Tokens.Generic[]) {
            const x = margin + indent;
            switch (token.type) {
                case 'heading': {
                    const size = HEADING_SIZE[Math.min(token.depth, 6)] ?? baseFontSize;
                    gap(size * 0.6);
                    drawRuns(flattenInline(token.tokens, { bold: true }), x, size, {
                        leading: size * 1.25
                    });
                    gap(size * 0.3);
                    break;
                }
                case 'paragraph': {
                    const inline = ((token.tokens ?? []) as Tokens.Generic[]).flatMap((t) => {
                        const converted = t.type === 'html' ? htmlTokens.get(String(t.text ?? t.raw ?? '')) : undefined;
                        return converted ? (converted as Tokens.Generic[]).flatMap((b) => (b.tokens as Tokens.Generic[]) ?? [b]) : [t];
                    });
                    const pictures = inline.filter((t) => t.type === 'image' && images.has(t.href));
                    const rest = inline.filter((t) => !pictures.includes(t));
                    if (rest.some((t) => (t.text ?? t.raw ?? '').trim())) drawRuns(flattenInline(rest as Token[]), x, baseFontSize);
                    const room = Math.min(pageWidth - margin - x, contentWidth);
                    let cursor = 0;
                    let rowH = 0;
                    for (const picture of pictures) {
                        const image = images.get(picture.href)!;
                        const scale = Math.min(0.75, room / image.width, (pageHeight - margin * 2) / image.height);
                        const w = image.width * scale;
                        const h = image.height * scale;
                        if (cursor > 0 && cursor + w > room) {
                            y -= rowH + 4;
                            cursor = 0;
                            rowH = 0;
                        }
                        ensure(h);
                        page.drawImage(image, { x: x + cursor, y: y - h, width: w, height: h });
                        cursor += w + 4;
                        rowH = Math.max(rowH, h);
                    }
                    if (rowH > 0) y -= rowH + baseFontSize * 0.6;
                    gap(baseFontSize * 0.7);
                    break;
                }
                case 'table': {
                    drawTable(token as Tokens.Table, indent);
                    break;
                }
                case 'html': {
                    renderHtml(String(token.text ?? token.raw ?? ''), indent);
                    break;
                }
                case 'list': {
                    const list = token as Tokens.List;
                    let n = typeof list.start === 'number' ? list.start : 1;
                    for (const item of list.items) {
                        ensure(baseFontSize * 1.45);
                        if (item.task) {
                            const box = 9;
                            const boxY = y - baseFontSize + 1;
                            page.drawRectangle({
                                x: x + 4,
                                y: boxY,
                                width: box,
                                height: box,
                                borderColor: muted,
                                borderWidth: 0.8
                            });
                            if (item.checked) {
                                page.drawText('x', {
                                    x: x + 5.6,
                                    y: boxY + 1.2,
                                    size: 8,
                                    font: fonts.bold,
                                    color: ink
                                });
                            }
                        } else {
                            const marker = list.ordered ? `${n}.` : '-';
                            page.drawText(marker, {
                                x: x + 4,
                                y: y - baseFontSize,
                                size: baseFontSize,
                                font: fonts.regular,
                                color: muted
                            });
                        }
                        renderBlocks(item.tokens as Token[], indent + 22);
                        n++;
                    }
                    gap(baseFontSize * 0.5);
                    break;
                }
                case 'code': {
                    const codeSize = 9.5;
                    const lang = String(token.lang ?? '').trim();
                    const maxCodeWidth = contentWidth - indent - 16;
                    const lines = wrapMonoLines(sanitize((token.text as string) ?? ''), codeSize, maxCodeWidth);
                    const lh = codeSize * 1.4;
                    const labelH = lang ? 12 : 0;
                    const blockH = lines.length * lh + 12 + labelH;
                    ensure(blockH);
                    page.drawRectangle({
                        x: margin + indent,
                        y: y - blockH,
                        width: contentWidth - indent,
                        height: blockH,
                        color: codeBg
                    });
                    let cy = y - 6;
                    if (lang) {
                        page.drawText(sanitize(lang), {
                            x: x + 8,
                            y: cy - 9,
                            size: 8,
                            font: fonts.regular,
                            color: muted
                        });
                        cy -= labelH;
                    }
                    for (const ln of lines) {
                        cy -= lh;
                        page.drawText(ln, {
                            x: x + 8,
                            y: cy + lh - codeSize,
                            size: codeSize,
                            font: fonts.mono,
                            color: ink
                        });
                    }
                    y -= blockH;
                    gap(baseFontSize * 0.6);
                    break;
                }
                case 'blockquote': {
                    const alert = splitAlert((token.tokens as Token[]) ?? []);
                    const startY = y;
                    const barColor = alert.kind ? ALERT_COLORS[alert.kind] : rule;
                    if (alert.kind) {
                        ensure(baseFontSize * 1.4);
                        page.drawText(alert.kind, {
                            x: x + 16,
                            y: y - baseFontSize,
                            size: 9,
                            font: fonts.bold,
                            color: barColor
                        });
                        y -= baseFontSize * 1.35;
                    }
                    renderBlocks(alert.tokens, indent + 16);
                    page.drawRectangle({
                        x: margin + indent,
                        y: y,
                        width: 3,
                        height: Math.max(4, startY - y),
                        color: barColor
                    });
                    gap(baseFontSize * 0.4);
                    break;
                }
                case 'hr': {
                    gap(baseFontSize * 0.4);
                    ensure(8);
                    page.drawLine({
                        start: { x: margin, y: y },
                        end: { x: pageWidth - margin, y: y },
                        thickness: 1,
                        color: rule
                    });
                    gap(baseFontSize);
                    break;
                }
                case 'space':
                    gap(baseFontSize * 0.6);
                    break;
                case 'text': {
                    const t = token as Tokens.Generic;
                    drawRuns(
                        t.tokens ? flattenInline(t.tokens) : [{ text: sanitize(t.text) }],
                        x,
                        baseFontSize
                    );
                    gap(baseFontSize * 0.4);
                    break;
                }
                default: {
                    if (token.tokens) renderBlocks(token.tokens as Token[], indent);
                    else if (typeof token.text === 'string' && token.text.trim()) {
                        drawRuns([{ text: sanitize(token.text) }], x, baseFontSize);
                        gap(baseFontSize * 0.4);
                    }
                }
            }
        }
    };

    const tokens = marked.lexer(markdown, MARKED_OPTS);
    await embedImages(tokens);
    renderBlocks(tokens);

    return doc.save();
}
