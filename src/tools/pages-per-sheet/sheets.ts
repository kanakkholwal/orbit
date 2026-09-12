import { degrees, grayscale, PDFDocument, type PDFPage } from 'pdf-lib';
import { computeLayout, type LayoutOptions, MM, type Orientation, type Order, type PerSheet, placeInCell, type SheetSize } from './layout';

export interface SheetSettings {
    perSheet: PerSheet;
    size: SheetSize;
    orientation: Orientation;
    marginMm: number;
    gapMm: number;
    order: Order;
    border: boolean;
}

/** Size of a page as it appears on screen: its crop box, turned by its rotation. */
export function visibleSize(page: PDFPage) {
    const box = page.getCropBox();
    const turned = Math.abs(page.getRotation().angle) % 180 === 90;
    return turned ? { width: box.height, height: box.width } : { width: box.width, height: box.height };
}

/** Builds the N-up document. Pages without content keep their slot empty. */
export async function buildSheets(bytes: ArrayBuffer | Uint8Array, settings: SheetSettings, onSheet?: (n: number, total: number) => void) {
    const source = await PDFDocument.load(bytes, { updateMetadata: false });
    const out = await PDFDocument.create();
    const pages = source.getPages();
    if (pages.length === 0) throw new Error('This PDF has no pages.');

    const layout = computeLayout(visibleSize(pages[0]), layoutOptions(settings));
    const boxes = pages.map((p) => {
        const b = p.getCropBox();
        return { left: b.x, bottom: b.y, right: b.x + b.width, top: b.y + b.height };
    });
    const embedded = await Promise.all(pages.map((p, i) => (p.node.Contents() ? out.embedPage(p, boxes[i]) : null)));
    const perSheet = settings.perSheet;
    const total = Math.ceil(pages.length / perSheet);

    for (let s = 0; s < total; s++) {
        onSheet?.(s + 1, total);
        const sheet = out.addPage([layout.width, layout.height]);
        for (let slot = 0; slot < perSheet; slot++) {
            const i = s * perSheet + slot;
            if (i >= pages.length) break;
            const form = embedded[i];
            if (!form) continue;
            const shown = visibleSize(pages[i]);
            const cell = layout.cells[slot];
            const box = placeInCell(shown.width, shown.height, cell);
            const bx = box.x;
            const by = layout.height - box.y - box.height;
            const angle = ((pages[i].getRotation().angle % 360) + 360) % 360;
            const turned = angle === 90 || angle === 270;
            const width = turned ? box.height : box.width;
            const height = turned ? box.width : box.height;
            const origin =
                angle === 90
                    ? { x: bx, y: by + box.height }
                    : angle === 180
                      ? { x: bx + box.width, y: by + box.height }
                      : angle === 270
                        ? { x: bx + box.width, y: by }
                        : { x: bx, y: by };
            sheet.drawPage(form, { ...origin, width, height, rotate: degrees(-angle) });
            if (settings.border) {
                sheet.drawRectangle({
                    x: bx,
                    y: by,
                    width: box.width,
                    height: box.height,
                    borderColor: grayscale(0.6),
                    borderWidth: 0.5,
                });
            }
        }
    }
    const saved = await out.save();
    return { bytes: saved, sheets: total, pages: pages.length, layout };
}

/** Converts user settings in millimetres to layout options in points. */
export function layoutOptions(settings: SheetSettings): LayoutOptions {
    return {
        perSheet: settings.perSheet,
        size: settings.size,
        orientation: settings.orientation,
        margin: settings.marginMm * MM,
        gap: settings.gapMm * MM,
        order: settings.order,
    };
}

