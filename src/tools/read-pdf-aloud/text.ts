/** The subset of a pdf.js text item this module reads. */
export interface TextRun {
    str: string;
    transform: number[];
    width: number;
    height: number;
    hasEOL: boolean;
}

interface Line {
    text: string;
    y: number;
    size: number;
}

const MAX_CHUNK = 220;
const ABBREVIATION =
    /(?:^|\s)(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|Mt|vs|etc|No|Fig|Vol|Inc|Ltd|Co|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|[A-Z])\.$/;

function toLines(items: TextRun[]): Line[] {
    const lines: Line[] = [];
    let current: Line | null = null;
    let prev: TextRun | null = null;
    const flush = () => {
        if (current?.text.trim()) lines.push({ ...current, text: current.text.replace(/\s+/g, ' ').trim() });
        current = null;
    };
    for (const item of items) {
        const size = Math.max(1, Math.abs(item.transform[3]) || item.height);
        if (current && prev) {
            const newLine = Math.abs(item.transform[5] - prev.transform[5]) > size * 0.5;
            if (newLine) flush();
            else if (item.transform[4] - (prev.transform[4] + prev.width) > size * 0.15) current.text += ' ';
        }
        if (!current) current = { text: '', y: item.transform[5], size };
        current.text += item.str;
        current.size = Math.max(current.size, size);
        if (item.hasEOL) flush();
        prev = item;
    }
    flush();
    return lines;
}

function joinLines(a: string, b: string) {
    if (/\p{L}-$/u.test(a) && /^\p{Ll}/u.test(b)) return a.slice(0, -1) + b;
    return `${a} ${b}`;
}

/** Groups a page's text runs into paragraphs, splitting on wide vertical gaps and column jumps. */
export function toParagraphs(items: TextRun[]): string[] {
    const paragraphs: string[] = [];
    let text = '';
    let last: Line | null = null;
    for (const line of toLines(items)) {
        const gap = last ? last.y - line.y : 0;
        if (last && (gap > Math.max(last.size, line.size) * 1.8 || gap < -last.size)) {
            paragraphs.push(text);
            text = '';
        }
        text = text ? joinLines(text, line.text) : line.text;
        last = line;
    }
    if (text) paragraphs.push(text);
    return paragraphs;
}

function chunk(sentence: string): string[] {
    if (sentence.length <= MAX_CHUNK) return [sentence];
    const out: string[] = [];
    let rest = sentence;
    while (rest.length > MAX_CHUNK) {
        const window = rest.slice(0, MAX_CHUNK);
        let cut = Math.max(window.lastIndexOf(', '), window.lastIndexOf('; '), window.lastIndexOf(': '));
        cut = cut > MAX_CHUNK / 3 ? cut + 1 : window.lastIndexOf(' ');
        if (cut <= 0) cut = MAX_CHUNK;
        out.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
    }
    if (rest) out.push(rest);
    return out;
}

/** Splits a paragraph into sentences short enough for every speech engine to read in one go. */
export function toSentences(paragraph: string): string[] {
    let sentences: string[];
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'sentence' });
        sentences = Array.from(segmenter.segment(paragraph), (s) => s.segment.trim());
    } else {
        sentences = paragraph.match(/[^.!?]+(?:[.!?]+["')\]]*\s*|$)/g)?.map((s) => s.trim()) ?? [paragraph];
    }
    const merged: string[] = [];
    for (const sentence of sentences.filter(Boolean)) {
        const prev = merged[merged.length - 1];
        if (prev && (ABBREVIATION.test(prev) || /^[\p{Ll}\d]/u.test(sentence))) merged[merged.length - 1] = `${prev} ${sentence}`;
        else merged.push(sentence);
    }
    return merged.flatMap(chunk);
}
