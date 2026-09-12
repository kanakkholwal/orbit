import { PDFDocument, PDFName, degrees, type PDFEmbeddedPage, type PDFPage } from 'pdf-lib';

export type Binding = 'left' | 'right';
export type BlankPlacement = 'end' | 'before-back-cover';
export type SheetSize = 'a4' | 'letter' | 'double';

/** Two pages side by side; values are 0-based source page indices, null for a blank. */
export interface SheetSide {
    left: number | null;
    right: number | null;
}

export interface Sheet {
    front: SheetSide;
    back: SheetSide;
}

export interface BookletOptions {
    binding: Binding;
    blanks: BlankPlacement;
    sheetSize: SheetSize;
}

const SHEET_SIZES: Record<Exclude<SheetSize, 'double'>, [number, number]> = {
    a4: [841.89, 595.28],
    letter: [792, 612]
};

/** Reading order padded with blanks (null) to a multiple of 4. */
export function bookletSequence(pageCount: number, blanks: BlankPlacement): (number | null)[] {
    const total = Math.max(4, Math.ceil(pageCount / 4) * 4);
    const pad = Array<null>(total - pageCount).fill(null);
    const pages = Array.from({ length: pageCount }, (_, i) => i);
    if (blanks === 'before-back-cover' && pageCount >= 2) {
        return [...pages.slice(0, -1), ...pad, pageCount - 1];
    }
    return [...pages, ...pad];
}

/** Saddle-stitch imposition: sheet i front holds the (N-i)th and (i+1)th pages, the back the next pair. */
export function bookletSheets(pageCount: number, options: Pick<BookletOptions, 'binding' | 'blanks'>): Sheet[] {
    const seq = bookletSequence(pageCount, options.blanks);
    const n = seq.length;
    const side = (outer: number | null, inner: number | null): SheetSide =>
        options.binding === 'left' ? { left: outer, right: inner } : { left: inner, right: outer };
    const sheets: Sheet[] = [];
    for (let i = 0; i < n / 4; i++) {
        sheets.push({
            front: side(seq[n - 1 - 2 * i], seq[2 * i]),
            back: side(seq[2 * i + 1], seq[n - 2 - 2 * i])
        });
    }
    return sheets;
}

const normalizeRotation = (angle: number) => (((Math.round(angle / 90) * 90) % 360) + 360) % 360;

function visibleBox(page: PDFPage) {
    const media = page.getMediaBox();
    const crop = page.getCropBox();
    const x = Math.max(media.x, crop.x);
    const y = Math.max(media.y, crop.y);
    const right = Math.min(media.x + media.width, crop.x + crop.width);
    const top = Math.min(media.y + media.height, crop.y + crop.height);
    if (right <= x || top <= y) return media;
    return { x, y, width: right - x, height: top - y };
}

/** Page size as shown on screen, after rotation. */
export function viewSize(page: PDFPage): [number, number] {
    const box = visibleBox(page);
    return normalizeRotation(page.getRotation().angle) % 180 === 0
        ? [box.width, box.height]
        : [box.height, box.width];
}

/** Lays the pages out two-up on sheets ready for double-sided printing. */
export async function makeBooklet(src: PDFDocument, options: BookletOptions): Promise<{ doc: PDFDocument; sheets: Sheet[] }> {
    const pages = src.getPages();
    const sheets = bookletSheets(pages.length, options);
    const out = await PDFDocument.create();

    const [firstW, firstH] = pages.length > 0 ? viewSize(pages[0]) : [595.28, 841.89];
    const [sheetW, sheetH] = options.sheetSize === 'double' ? [firstW * 2, firstH] : SHEET_SIZES[options.sheetSize];
    const halfW = sheetW / 2;

    const drawable = pages.map((p, i) => (p.node.get(PDFName.of('Contents')) ? i : -1)).filter((i) => i >= 0);
    const embedded = new Map<number, PDFEmbeddedPage>();
    if (drawable.length > 0) {
        const boxes = drawable.map((i) => {
            const b = visibleBox(pages[i]);
            return { left: b.x, bottom: b.y, right: b.x + b.width, top: b.y + b.height };
        });
        const list = await out.embedPages(drawable.map((i) => pages[i]), boxes);
        drawable.forEach((pageIndex, i) => {
            embedded.set(pageIndex, list[i]);
        });
    }

    const place = (sheet: PDFPage, index: number | null, slotX: number) => {
        if (index === null) return;
        const art = embedded.get(index);
        if (!art) return;
        const rotation = normalizeRotation(pages[index].getRotation().angle);
        const [viewW, viewH] = viewSize(pages[index]);
        const scale = Math.min(halfW / viewW, sheetH / viewH);
        const w = art.width * scale;
        const h = art.height * scale;
        const originX = slotX + (halfW - viewW * scale) / 2;
        const originY = (sheetH - viewH * scale) / 2;
        const offset: Record<number, [number, number]> = { 0: [0, 0], 90: [0, w], 180: [w, h], 270: [h, 0] };
        const [ox, oy] = offset[rotation];
        sheet.drawPage(art, { x: originX + ox, y: originY + oy, width: w, height: h, rotate: degrees(-rotation) });
    };

    for (const s of sheets) {
        for (const side of [s.front, s.back]) {
            const sheet = out.addPage([sheetW, sheetH]);
            place(sheet, side.left, 0);
            place(sheet, side.right, halfW);
        }
    }
    return { doc: out, sheets };
}
