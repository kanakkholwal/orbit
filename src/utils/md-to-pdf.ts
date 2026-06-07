import { marked, type Token, type Tokens } from 'marked';
import { PDFDocument, type PDFFont, StandardFonts, rgb } from 'pdf-lib';

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
}

const HEADING_SIZE = [24, 24, 19, 16, 14, 12, 11]; // index by depth (1..6)

// pdf-lib StandardFonts only encode WinAnsi (Latin-1). Replace the common
// typographic characters Markdown/source tends to contain so they don't throw.
function sanitize(text: string): string {
    return text
        .replace(/[‘’‚‛]/g, "'")
        .replace(/[“”„‟]/g, '"')
        .replace(/[–—]/g, '-')
        .replace(/…/g, '...')
        .replace(/•/g, '-')
        .replace(/ /g, ' ')
        .replace(/[→]/g, '->')
        .replace(/[^\x00-\xFF]/g, ''); // drop anything still outside Latin-1
}

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
            case 'codespan':
                runs.push({ text: sanitize(t.text), ...ctx, mono: true });
                break;
            case 'link':
            case 'del':
								runs.push(...flattenInline(t.tokens, ctx));
                break;
            case 'br':
                runs.push({ text: '\n', ...ctx });
                break;
            case 'escape':
            case 'text':
                if (t.tokens) runs.push(...flattenInline(t.tokens, ctx));
                else runs.push({ text: sanitize(t.text), ...ctx });
                break;
            default:
                if (typeof t.text === 'string') runs.push({ text: sanitize(t.text), ...ctx });
        }
    }
    return runs;
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
    const rule = rgb(0.81, 0.804, 0.769);

    let page = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const newPage = () => {
        page = doc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
    };
    const ensure = (h: number) => {
        if (y - h < margin) newPage();
    };

    // Draw a sequence of styled runs, word-wrapped, starting at indent x.
    const drawRuns = (
        runs: Run[],
        x: number,
        size: number,
        opts: { leading?: number; color?: ReturnType<typeof rgb> } = {}
    ) => {
        const leading = opts.leading ?? size * 1.45;
        const color = opts.color ?? ink;
        const maxWidth = pageWidth - margin - x;

        // Build word list with per-word style.
        type Word = { text: string; font: PDFFont; width: number; hardBreak?: boolean };
        const words: Word[] = [];
        for (const run of runs) {
            const font = pickFont(run);
            const parts = run.text.split('\n');
            parts.forEach((part, pi) => {
                if (pi > 0) words.push({ text: '', font, width: 0, hardBreak: true });
                for (const w of part.split(/(\s+)/)) {
                    if (w === '') continue;
                    if (/^\s+$/.test(w)) {
                        words.push({ text: ' ', font, width: font.widthOfTextAtSize(' ', size) });
                    } else {
                        words.push({ text: w, font, width: font.widthOfTextAtSize(w, size) });
                    }
                }
            });
        }

        let line: Word[] = [];
        let lineWidth = 0;
        const flush = () => {
            ensure(leading);
            let cx = x;
            for (const w of line) {
                if (w.text) {
                    page.drawText(w.text, { x: cx, y: y - size, size, font: w.font, color });
                }
                cx += w.width;
            }
            y -= leading;
            line = [];
            lineWidth = 0;
        };

        for (const w of words) {
            if (w.hardBreak) {
                flush();
                continue;
            }
            if (w.text === ' ' && line.length === 0) continue; // trim leading space
            if (lineWidth + w.width > maxWidth && line.length > 0) {
                // drop trailing space before wrap
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
    };

    const gap = (h: number) => {
        y -= h;
        if (y < margin) newPage();
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
                    drawRuns(flattenInline(token.tokens), x, baseFontSize);
                    gap(baseFontSize * 0.7);
                    break;
                }
                case 'list': {
                    const list = token as Tokens.List;
                    let n = typeof list.start === 'number' ? list.start : 1;
                    for (const item of list.items) {
                        const marker = list.ordered ? `${n}.` : '-';
                        ensure(baseFontSize * 1.45);
                        page.drawText(marker, {
                            x: x + 4,
                            y: y - baseFontSize,
                            size: baseFontSize,
                            font: fonts.regular,
                            color: muted
                        });
                        // Item body, indented past the marker.
                        renderBlocks(item.tokens as Token[], indent + 22);
                        n++;
                    }
                    gap(baseFontSize * 0.5);
                    break;
                }
                case 'code': {
                    const codeFont = fonts.mono;
                    const codeSize = 9.5;
                    const lines = sanitize((token.text as string) ?? '').split('\n');
                    const lh = codeSize * 1.4;
                    const blockH = lines.length * lh + 12;
                    ensure(blockH);
                    page.drawRectangle({
                        x: margin + indent,
                        y: y - blockH,
                        width: contentWidth - indent,
                        height: blockH,
                        color: codeBg
                    });
                    let cy = y - 6;
                    for (const ln of lines) {
                        cy -= lh;
                        page.drawText(ln, {
                            x: x + 8,
                            y: cy + lh - codeSize,
                            size: codeSize,
                            font: codeFont,
                            color: ink
                        });
                    }
                    y -= blockH;
                    gap(baseFontSize * 0.6);
                    break;
                }
                case 'blockquote': {
                    const startY = y;
                    renderBlocks(token.tokens as Token[], indent + 16);
                    page.drawRectangle({
                        x: margin + indent,
                        y: y,
                        width: 3,
                        height: startY - y,
                        color: rule
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
            }
        }
    };

    const tokens = marked.lexer(markdown);
    renderBlocks(tokens);

    return doc.save();
}
