import {
    PDFArray,
    PDFDict,
    PDFHexString,
    PDFName,
    PDFNumber,
    type PDFDocument,
    type PDFObject,
    PDFRef,
    PDFString
} from 'pdf-lib';
import type { BookmarkNode, BookmarkStyle } from './helper.svelte';

const NAMED_COLORS: Record<string, number[]> = {
    red: [1, 0, 0],
    green: [0, 1, 0],
    blue: [0, 0, 1],
    yellow: [1, 1, 0],
    purple: [0.5, 0, 0.5]
};

const ITALIC = 1;
const BOLD = 2;

function textOf(obj: PDFObject | undefined): string | null {
    if (obj instanceof PDFString || obj instanceof PDFHexString || obj instanceof PDFName) return obj.decodeText();
    return null;
}

function numberOf(obj: PDFObject | undefined): number | null {
    return obj instanceof PDFNumber ? obj.asNumber() : null;
}

function collectNameTree(node: PDFDict | undefined, out: Map<string, PDFObject>, seen: Set<PDFDict>) {
    if (!node || seen.has(node)) return;
    seen.add(node);
    const names = node.lookup(PDFName.of('Names'));
    if (names instanceof PDFArray) {
        for (let i = 0; i + 1 < names.size(); i += 2) {
            const key = textOf(names.lookup(i));
            if (key !== null && !out.has(key)) out.set(key, names.get(i + 1));
        }
    }
    const kids = node.lookup(PDFName.of('Kids'));
    if (kids instanceof PDFArray) {
        for (let i = 0; i < kids.size(); i++) {
            const kid = kids.lookup(i);
            if (kid instanceof PDFDict) collectNameTree(kid, out, seen);
        }
    }
}

function buildDestLookup(doc: PDFDocument) {
    const catalog = doc.catalog;
    const tree = new Map<string, PDFObject>();
    const names = catalog.lookup(PDFName.of('Names'));
    if (names instanceof PDFDict) {
        const dests = names.lookup(PDFName.of('Dests'));
        if (dests instanceof PDFDict) collectNameTree(dests, tree, new Set());
    }
    const legacy = catalog.lookup(PDFName.of('Dests'));
    const legacyDict = legacy instanceof PDFDict ? legacy : null;

    return (key: string, preferLegacy: boolean): PDFObject | undefined => {
        const fromLegacy = () => legacyDict?.get(PDFName.of(key));
        return preferLegacy ? (fromLegacy() ?? tree.get(key)) : (tree.get(key) ?? fromLegacy());
    };
}

function toExplicitDest(
    doc: PDFDocument,
    value: PDFObject | undefined,
    lookupName: ReturnType<typeof buildDestLookup>,
    depth = 0
): PDFArray | null {
    if (depth > 8 || value === undefined) return null;
    const resolved = value instanceof PDFRef ? doc.context.lookup(value) : value;
    if (resolved instanceof PDFArray) return resolved;
    if (resolved instanceof PDFDict) return toExplicitDest(doc, resolved.get(PDFName.of('D')), lookupName, depth + 1);
    const key = textOf(resolved);
    if (key === null) return null;
    return toExplicitDest(doc, lookupName(key, resolved instanceof PDFName), lookupName, depth + 1);
}

function destOfItem(doc: PDFDocument, item: PDFDict, lookupName: ReturnType<typeof buildDestLookup>) {
    const dest = item.get(PDFName.of('Dest'));
    if (dest !== undefined) return toExplicitDest(doc, dest, lookupName);
    const action = item.lookup(PDFName.of('A'));
    if (!(action instanceof PDFDict)) return null;
    const kind = action.lookup(PDFName.of('S'));
    if (!(kind instanceof PDFName) || kind.decodeText() !== 'GoTo') return null;
    return toExplicitDest(doc, action.get(PDFName.of('D')), lookupName);
}

function colorToHex(rgb: number[]): string {
    return `#${rgb.map((c) => Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).padStart(2, '0')).join('')}`;
}

function colorToRgb(color: string | null): number[] | null {
    if (!color) return null;
    if (NAMED_COLORS[color]) return NAMED_COLORS[color];
    const hex = /^#([0-9a-f]{6})$/i.exec(color)?.[1];
    if (!hex) return null;
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

/** Reads the document outline into bookmark nodes, resolving named and action destinations. */
export function readOutline(doc: PDFDocument): BookmarkNode[] {
    const outlines = doc.catalog.lookup(PDFName.of('Outlines'));
    if (!(outlines instanceof PDFDict)) return [];

    const lookupName = buildDestLookup(doc);
    const pageIndexByRef = new Map(doc.getPages().map((p, i) => [p.ref.toString(), i]));
    const pageCount = pageIndexByRef.size;
    const seen = new Set<PDFDict>();

    const readSiblings = (first: PDFObject | undefined): BookmarkNode[] => {
        const nodes: BookmarkNode[] = [];
        let current = first instanceof PDFRef ? doc.context.lookup(first) : first;
        while (current instanceof PDFDict && !seen.has(current)) {
            seen.add(current);
            nodes.push(readItem(current));
            current = current.lookup(PDFName.of('Next'));
        }
        return nodes;
    };

    const readItem = (item: PDFDict): BookmarkNode => {
        const dest = destOfItem(doc, item, lookupName);
        let pageIndex = 0;
        let destX: number | null = null;
        let destY: number | null = null;
        let zoom: number | null = null;
        if (dest && dest.size() > 0) {
            const target = dest.get(0);
            const byRef = target instanceof PDFRef ? pageIndexByRef.get(target.toString()) : undefined;
            const byNumber = numberOf(target);
            if (byRef !== undefined) pageIndex = byRef;
            else if (byNumber !== null) pageIndex = Math.max(0, Math.min(byNumber, pageCount - 1));
            const kind = dest.lookup(1);
            if (kind instanceof PDFName && kind.decodeText() === 'XYZ') {
                destX = numberOf(dest.lookup(2));
                destY = numberOf(dest.lookup(3));
                const z = numberOf(dest.lookup(4));
                zoom = z ? z * 100 : null;
            }
        }

        const flags = numberOf(item.lookup(PDFName.of('F'))) ?? 0;
        const bold = (flags & BOLD) !== 0;
        const italic = (flags & ITALIC) !== 0;
        const style: BookmarkStyle = bold && italic ? 'bold-italic' : bold ? 'bold' : italic ? 'italic' : null;

        const c = item.lookup(PDFName.of('C'));
        let color: string | null = null;
        if (c instanceof PDFArray && c.size() === 3) {
            const rgb = [0, 1, 2].map((i) => numberOf(c.lookup(i)) ?? 0);
            if (rgb.some((v) => v !== 0)) color = colorToHex(rgb);
        }

        const count = numberOf(item.lookup(PDFName.of('Count'))) ?? 0;
        return {
            id: crypto.randomUUID(),
            title: textOf(item.lookup(PDFName.of('Title'))) ?? '',
            page: pageIndex + 1,
            children: readSiblings(item.get(PDFName.of('First'))),
            color,
            style,
            destX,
            destY,
            zoom,
            isExpanded: count > 0
        };
    };

    return readSiblings(outlines.get(PDFName.of('First')));
}

function visibleDescendants(node: BookmarkNode): number {
    return node.isExpanded ? node.children.reduce((sum, c) => sum + 1 + visibleDescendants(c), 0) : 0;
}

/** Replaces the document outline with the given bookmarks, keeping nesting, open state, colour and style. */
export function writeOutline(doc: PDFDocument, bookmarks: BookmarkNode[]) {
    const context = doc.context;
    if (bookmarks.length === 0) {
        doc.catalog.delete(PDFName.of('Outlines'));
        return;
    }

    const pages = doc.getPages();
    const outlinesDict = context.obj({});
    const outlinesRef = context.register(outlinesDict);

    const createItems = (nodes: BookmarkNode[], parentRef: PDFRef) => {
        const items: { ref: PDFRef; dict: PDFDict }[] = [];
        for (const [i, node] of nodes.entries()) {
            const dict = context.obj({});
            const ref = context.register(dict);
            dict.set(PDFName.of('Title'), PDFHexString.fromText(node.title));
            dict.set(PDFName.of('Parent'), parentRef);

            const pageIndex = Math.max(0, Math.min(node.page - 1, pages.length - 1));
            const optional = (n: number | null) => (n === null || n === undefined ? null : PDFNumber.of(n));
            dict.set(
                PDFName.of('Dest'),
                context.obj([
                    pages[pageIndex].ref,
                    PDFName.of('XYZ'),
                    optional(node.destX),
                    optional(node.destY),
                    optional(node.zoom ? node.zoom / 100 : null)
                ])
            );

            if (node.style) {
                const flags = (node.style.includes('italic') ? ITALIC : 0) | (node.style.includes('bold') ? BOLD : 0);
                dict.set(PDFName.of('F'), PDFNumber.of(flags));
            }
            const rgb = colorToRgb(node.color);
            if (rgb) dict.set(PDFName.of('C'), context.obj(rgb));

            if (node.children.length > 0) {
                const children = createItems(node.children, ref);
                dict.set(PDFName.of('First'), children[0].ref);
                dict.set(PDFName.of('Last'), children[children.length - 1].ref);
                const openCount = node.children.reduce((sum, c) => sum + 1 + visibleDescendants(c), 0);
                dict.set(PDFName.of('Count'), PDFNumber.of(node.isExpanded ? openCount : -openCount));
            }

            if (i > 0) {
                dict.set(PDFName.of('Prev'), items[i - 1].ref);
                items[i - 1].dict.set(PDFName.of('Next'), ref);
            }
            items.push({ ref, dict });
        }
        return items;
    };

    const roots = createItems(bookmarks, outlinesRef);
    outlinesDict.set(PDFName.of('Type'), PDFName.of('Outlines'));
    outlinesDict.set(PDFName.of('First'), roots[0].ref);
    outlinesDict.set(PDFName.of('Last'), roots[roots.length - 1].ref);
    outlinesDict.set(
        PDFName.of('Count'),
        PDFNumber.of(bookmarks.reduce((sum, n) => sum + 1 + visibleDescendants(n), 0))
    );
    doc.catalog.set(PDFName.of('Outlines'), outlinesRef);
}
