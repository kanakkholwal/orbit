import { PDFDocument, PDFName, type PDFPage } from 'pdf-lib';

export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** A part of the page as it appears on screen, in fractions: u from the left, v from the top. */
export interface Cell {
    u0: number;
    u1: number;
    v0: number;
    v1: number;
}

export interface DivideOptions {
    columns: number;
    rows: number;
    rightToLeft: boolean;
    /** 0-based pages to divide. Every other page is kept whole. */
    targets: number[];
}

/** Parts of a page in reading order: rows top to bottom, columns left to right or right to left. */
export function cellsInReadingOrder(columns: number, rows: number, rightToLeft: boolean): Cell[] {
    const cells: Cell[] = [];
    for (let r = 0; r < rows; r++) {
        for (let i = 0; i < columns; i++) {
            const c = rightToLeft ? columns - 1 - i : i;
            cells.push({ u0: c / columns, u1: (c + 1) / columns, v0: r / rows, v1: (r + 1) / rows });
        }
    }
    return cells;
}

const normalizeRotation = (angle: number) => (((Math.round(angle / 90) * 90) % 360) + 360) % 360;

/** The area a viewer shows: the crop box clipped to the media box. */
export function visibleBox(page: PDFPage): Box {
    const media = page.getMediaBox();
    const crop = page.getCropBox();
    const x = Math.max(media.x, crop.x);
    const y = Math.max(media.y, crop.y);
    const right = Math.min(media.x + media.width, crop.x + crop.width);
    const top = Math.min(media.y + media.height, crop.y + crop.height);
    if (right <= x || top <= y) return media;
    return { x, y, width: right - x, height: top - y };
}

/** Maps an on-screen part of a page to unrotated page coordinates, honouring /Rotate. */
export function cellToBox(box: Box, rotation: number, cell: Cell): Box {
    const r = normalizeRotation(rotation);
    const W = box.width;
    const H = box.height;
    const viewW = r % 180 === 0 ? W : H;
    const viewH = r % 180 === 0 ? H : W;
    const toPage = (dx: number, dy: number): [number, number] => {
        if (r === 90) return [dy, dx];
        if (r === 180) return [W - dx, dy];
        if (r === 270) return [W - dy, H - dx];
        return [dx, H - dy];
    };
    const [ax, ay] = toPage(cell.u0 * viewW, cell.v0 * viewH);
    const [bx, by] = toPage(cell.u1 * viewW, cell.v1 * viewH);
    return {
        x: box.x + Math.min(ax, bx),
        y: box.y + Math.min(ay, by),
        width: Math.abs(bx - ax),
        height: Math.abs(by - ay)
    };
}

/** Cuts the target pages into parts by narrowing each copy's page box, which keeps text and vector art intact. */
export async function dividePdf(src: PDFDocument, options: DivideOptions): Promise<PDFDocument> {
    const out = await PDFDocument.create();
    const targets = new Set(options.targets);
    const cells = cellsInReadingOrder(options.columns, options.rows, options.rightToLeft);
    const plan: { index: number; cell: Cell | null }[] = [];
    for (let i = 0; i < src.getPageCount(); i++) {
        if (targets.has(i)) for (const cell of cells) plan.push({ index: i, cell });
        else plan.push({ index: i, cell: null });
    }

    const copies = await out.copyPages(src, plan.map((p) => p.index));
    plan.forEach((step, i) => {
        const page = copies[i];
        if (step.cell) {
            const part = cellToBox(visibleBox(page), page.getRotation().angle, step.cell);
            page.setMediaBox(part.x, part.y, part.width, part.height);
            page.setCropBox(part.x, part.y, part.width, part.height);
            for (const key of ['TrimBox', 'BleedBox', 'ArtBox', 'Annots']) page.node.delete(PDFName.of(key));
        }
        out.addPage(page);
    });
    return out;
}
