export type PerSheet = 2 | 4 | 6 | 8 | 9;
export type SheetSize = 'original' | 'A4' | 'Letter';
export type Orientation = 'auto' | 'portrait' | 'landscape';
export type Order = 'across' | 'down';

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SheetLayout {
    width: number;
    height: number;
    cols: number;
    rows: number;
    /** Cells in reading order, with `y` measured from the top of the sheet. */
    cells: Rect[];
}

export interface LayoutOptions {
    perSheet: PerSheet;
    size: SheetSize;
    orientation: Orientation;
    /** Margin and gap in points. */
    margin: number;
    gap: number;
    order: Order;
}

export const MM = 72 / 25.4;

const SIZES: Record<Exclude<SheetSize, 'original'>, [number, number]> = {
    A4: [595.28, 841.89],
    Letter: [612, 792],
};

const GRIDS: Record<PerSheet, [number, number]> = { 2: [2, 1], 4: [2, 2], 6: [3, 2], 8: [4, 2], 9: [3, 3] };

/** Scale that fits a `w` by `h` page inside a cell. */
export function fitScale(w: number, h: number, cell: { width: number; height: number }) {
    return Math.max(0, Math.min(cell.width / w, cell.height / h));
}

/** Picks the sheet orientation and grid that make pages of `page` shape as large as possible. */
export function computeLayout(page: { width: number; height: number }, opts: LayoutOptions): SheetLayout {
    const [baseW, baseH] = opts.size === 'original' ? [page.width, page.height] : SIZES[opts.size];
    const short = Math.min(baseW, baseH);
    const long = Math.max(baseW, baseH);
    const shapes: [number, number][] =
        opts.orientation === 'portrait'
            ? [[short, long]]
            : opts.orientation === 'landscape'
              ? [[long, short]]
              : [
                    [short, long],
                    [long, short],
                ];
    const [a, b] = GRIDS[opts.perSheet];
    const grids: [number, number][] = a === b ? [[a, b]] : [[a, b], [b, a]];

    let best = { width: shapes[0][0], height: shapes[0][1], cols: grids[0][0], rows: grids[0][1], scale: -1 };
    for (const [width, height] of shapes) {
        for (const [cols, rows] of grids) {
            const cell = cellSize(width, height, cols, rows, opts);
            const scale = fitScale(page.width, page.height, cell);
            if (scale > best.scale + 1e-6) best = { width, height, cols, rows, scale };
        }
    }
    const { width, height, cols, rows } = best;
    const cell = cellSize(width, height, cols, rows, opts);
    const cells: Rect[] = [];
    for (let i = 0; i < cols * rows; i++) {
        const col = opts.order === 'across' ? i % cols : Math.floor(i / rows);
        const row = opts.order === 'across' ? Math.floor(i / cols) : i % rows;
        cells.push({
            x: opts.margin + col * (cell.width + opts.gap),
            y: opts.margin + row * (cell.height + opts.gap),
            width: cell.width,
            height: cell.height,
        });
    }
    return { width, height, cols, rows, cells };
}

function cellSize(width: number, height: number, cols: number, rows: number, opts: LayoutOptions) {
    return {
        width: Math.max(0, (width - 2 * opts.margin - (cols - 1) * opts.gap) / cols),
        height: Math.max(0, (height - 2 * opts.margin - (rows - 1) * opts.gap) / rows),
    };
}

/** Where a page of `w` by `h` sits inside a cell: scaled to fit, kept in proportion, centred. */
export function placeInCell(w: number, h: number, cell: Rect): Rect {
    const scale = fitScale(w, h, cell);
    const width = w * scale;
    const height = h * scale;
    return { x: cell.x + (cell.width - width) / 2, y: cell.y + (cell.height - height) / 2, width, height };
}
