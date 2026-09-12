import { PDFDocument } from 'pdf-lib';

export type InsertPosition = 'start' | 'end' | 'every' | 'after';
export type BlankSize = 'match' | 'a4' | 'letter';

/** One entry of the new page order: an original page, or a blank sized like original page `like`. */
export type PlanItem = { kind: 'page'; index: number; key: string } | { kind: 'blank'; like: number; key: string };

/** Where and how many blank pages to add. `after` holds 0-based page indices. */
export interface InsertOptions {
    position: InsertPosition;
    count: number;
    every: number;
    after: number[];
}

const PAPER: Record<Exclude<BlankSize, 'match'>, [number, number]> = {
    a4: [595.28, 841.89],
    letter: [612, 792]
};

/** Builds the new page order without touching the PDF. */
export function planInsertion(pageCount: number, options: InsertOptions): PlanItem[] {
    const count = Math.max(0, Math.floor(options.count));
    const every = Math.max(1, Math.floor(options.every));
    const after = new Set(options.after);
    const items: PlanItem[] = [];
    const blanks = (like: number, tag: string) => {
        for (let b = 0; b < count; b++) items.push({ kind: 'blank', like, key: `b-${tag}-${b}` });
    };

    if (pageCount <= 0) return items;
    if (options.position === 'start') blanks(0, 'start');
    for (let i = 0; i < pageCount; i++) {
        items.push({ kind: 'page', index: i, key: `p-${i}` });
        if (options.position === 'every' && (i + 1) % every === 0) blanks(i, `${i}`);
        if (options.position === 'after' && after.has(i)) blanks(i, `${i}`);
    }
    if (options.position === 'end') blanks(pageCount - 1, 'end');
    return items;
}

/** Inserts the planned blank pages into a PDF and returns the new bytes. */
export async function insertBlankPages(bytes: ArrayBuffer | Uint8Array, plan: PlanItem[], size: BlankSize): Promise<Uint8Array> {
    const doc = await PDFDocument.load(bytes);
    const pages = doc.getPages();
    const sizes = pages.map((page) => {
        const { width, height } = page.getCropBox();
        const turned = Math.abs(page.getRotation().angle) % 180 === 90;
        return turned ? ([height, width] as [number, number]) : ([width, height] as [number, number]);
    });

    plan.forEach((item, position) => {
        if (item.kind !== 'blank') return;
        doc.insertPage(position, size === 'match' ? sizes[item.like] : PAPER[size]);
    });
    return doc.save();
}
