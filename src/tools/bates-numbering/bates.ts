import { PDFDocument, StandardFonts, degrees, rgb, type PDFPage } from 'pdf-lib';

export type StampPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface BatesOptions {
    prefix: string;
    suffix: string;
    start: number;
    digits: number;
    position: StampPosition;
    fontSize: number;
    margin: number;
    continueAcrossFiles: boolean;
    /** Printed after the number when set. */
    date: string | null;
}

/** Characters the built-in Helvetica font can print. */
export const PRINTABLE = /^[\x20-\x7E]*$/;

/** The label for one number, e.g. ABC000001. */
export function formatBates(n: number, options: Pick<BatesOptions, 'prefix' | 'suffix' | 'digits'>): string {
    const digits = Math.min(12, Math.max(1, Math.floor(options.digits) || 1));
    return `${options.prefix}${String(Math.max(0, Math.floor(n))).padStart(digits, '0')}${options.suffix}`;
}

/** First and last number for each file, given page counts in order. */
export function batesRanges(pageCounts: number[], options: Pick<BatesOptions, 'start' | 'continueAcrossFiles'>) {
    const start = Math.max(0, Math.floor(options.start) || 0);
    let next = start;
    return pageCounts.map((count) => {
        const first = options.continueAcrossFiles ? next : start;
        const last = first + Math.max(0, count) - 1;
        next = last + 1;
        return { first, last };
    });
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

/** Stamps every page of the document, starting at `firstNumber`, upright however the page is rotated. */
export async function stampBates(doc: PDFDocument, firstNumber: number, options: BatesOptions): Promise<void> {
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const size = options.fontSize;
    const ascent = font.heightAtSize(size, { descender: false });
    const descent = font.heightAtSize(size) - ascent;

    doc.getPages().forEach((page, i) => {
        const label = formatBates(firstNumber + i, options);
        const text = options.date ? `${label}  ${options.date}` : label;
        const textWidth = font.widthOfTextAtSize(text, size);
        const box = visibleBox(page);
        const r = normalizeRotation(page.getRotation().angle);
        const W = box.width;
        const H = box.height;
        const viewW = r % 180 === 0 ? W : H;
        const viewH = r % 180 === 0 ? H : W;

        const [vertical, horizontal] = options.position.split('-');
        const vx =
            horizontal === 'left' ? options.margin : horizontal === 'right' ? viewW - options.margin - textWidth : (viewW - textWidth) / 2;
        const vy = vertical === 'top' ? viewH - options.margin - ascent : options.margin + descent;

        const [px, py] =
            r === 90 ? [W - vy, vx] : r === 180 ? [W - vx, H - vy] : r === 270 ? [vy, H - vx] : [vx, vy];

        page.drawText(text, {
            x: box.x + px,
            y: box.y + py,
            size,
            font,
            color: rgb(0, 0, 0),
            rotate: degrees(r)
        });
    });
}
