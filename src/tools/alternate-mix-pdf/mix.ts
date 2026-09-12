import { PDFDocument, type PDFPage } from 'pdf-lib';

export interface MixSource {
    pageCount: number;
    reversed: boolean;
    perTurn: number;
}

export type RunOutMode = 'append' | 'stop';

/** One page in the mixed result: which file it comes from and its 0-based page index there. */
export interface MixSlot {
    source: number;
    page: number;
}

/** Letter used to name a file in previews: A, B, ... Z, AA, AB. */
export function sourceLetter(index: number): string {
    let n = index;
    let out = '';
    do {
        out = String.fromCharCode(65 + (n % 26)) + out;
        n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return out;
}

/** Takes pages from each file in turn, following each file's direction and pages per turn. */
export function mixOrder(sources: MixSource[], runOut: RunOutMode): MixSlot[] {
    const queues = sources.map((s) => {
        const pages = Array.from({ length: Math.max(0, s.pageCount) }, (_, i) => i);
        return s.reversed ? pages.reverse() : pages;
    });
    const order: MixSlot[] = [];
    while (queues.some((q) => q.length > 0)) {
        for (let i = 0; i < sources.length; i++) {
            const queue = queues[i];
            if (queue.length === 0) {
                if (runOut === 'stop') return order;
                continue;
            }
            const take = Math.max(1, Math.floor(sources[i].perTurn) || 1);
            for (const page of queue.splice(0, take)) order.push({ source: i, page });
        }
    }
    return order;
}

/** Builds the mixed PDF. Pages are copied as they are, so text and images stay sharp. */
export async function buildMix(docs: PDFDocument[], order: MixSlot[]): Promise<PDFDocument> {
    const out = await PDFDocument.create();
    const copied = new Map<string, PDFPage>();
    for (let s = 0; s < docs.length; s++) {
        const indices = [...new Set(order.filter((slot) => slot.source === s).map((slot) => slot.page))];
        if (indices.length === 0) continue;
        const pages = await out.copyPages(docs[s], indices);
        indices.forEach((page, i) => {
            copied.set(`${s}:${page}`, pages[i]);
        });
    }
    for (const slot of order) {
        const page = copied.get(`${slot.source}:${slot.page}`);
        if (page) out.addPage(page);
    }
    return out;
}
