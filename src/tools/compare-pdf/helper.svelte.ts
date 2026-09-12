import { PdfEngine } from '$lib/pdf-engine.svelte';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { toast } from 'svelte-sonner';
import { alignPages, diffPages, type PageDiff, tokenize } from './diff';

export type Side = 'original' | 'changed';

export interface CompareFile {
    file: File;
    pages: string[] | null;
}

export interface PageResult extends PageDiff {
    /** 1-based page numbers, or 0 when the page exists on one side only. */
    before: number;
    after: number;
    status: 'same' | 'changed' | 'added' | 'removed';
    /** Index of this page's first change across the whole comparison. */
    firstChange: number;
}

const isPdf = (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');

export class CompareState extends PdfEngine {
    original = $state.raw<CompareFile | null>(null);
    changed = $state.raw<CompareFile | null>(null);
    loose = $state(true);
    hideSame = $state(false);
    compared = $state(false);
    current = $state(0);

    get ready() {
        return this.original !== null && this.changed !== null;
    }

    results = $derived.by((): PageResult[] => {
        const a = this.original?.pages;
        const b = this.changed?.pages;
        if (!this.compared || !a || !b) return [];
        let total = 0;
        return alignPages(a, b).map(([i, j]) => {
            const diff = diffPages(i < 0 ? [] : tokenize(a[i]), j < 0 ? [] : tokenize(b[j]), this.loose);
            const status = i < 0 ? 'added' : j < 0 ? 'removed' : diff.changes > 0 ? 'changed' : 'same';
            const page: PageResult = { ...diff, before: i + 1, after: j + 1, status, firstChange: total };
            total += diff.changes;
            return page;
        });
    });

    totalChanges = $derived(this.results.reduce((sum, p) => sum + p.changes, 0));
    changedPages = $derived(this.results.filter((p) => p.changes > 0).length);

    get hasText() {
        const some = (pages: string[] | null | undefined) => (pages ?? []).some((p) => p.trim() !== '');
        return some(this.original?.pages) || some(this.changed?.pages);
    }

    addFiles(files: File[]) {
        const pdfs = files.filter(isPdf);
        if (pdfs.length < files.length) toast.error('Only PDF files can be compared.');
        for (const file of pdfs) {
            if (!this.original) this.original = { file, pages: null };
            else if (!this.changed) this.changed = { file, pages: null };
        }
        if (pdfs.length > 2) toast.info('Only the first two PDFs are used.');
        this.compared = false;
    }

    setFile(side: Side, file: File) {
        if (!isPdf(file)) {
            toast.error('Please choose a PDF file.');
            return;
        }
        this[side] = { file, pages: null };
        this.compared = false;
    }

    removeFile(side: Side) {
        this[side] = null;
        this.compared = false;
    }

    swap() {
        [this.original, this.changed] = [this.changed, this.original];
        this.current = 0;
    }

    reset() {
        this.original = null;
        this.changed = null;
        this.compared = false;
        this.current = 0;
        this.isProcessing = false;
    }

    async compare() {
        if (!this.original || !this.changed) return;
        this.isProcessing = true;
        this.compared = false;
        this.current = 0;
        try {
            const pdfjs = await this.getPdfJs();
            const sides = [this.original, this.changed];
            const docs = await Promise.all(
                sides.map(async (s) => pdfjs.getDocument({ data: new Uint8Array(await s.file.arrayBuffer()) }).promise)
            );
            const total = docs.reduce((sum, d) => sum + d.numPages, 0);
            let done = 0;
            const read: string[][] = [];
            for (let s = 0; s < sides.length; s++) {
                const pages: string[] = [];
                for (let p = 1; p <= docs[s].numPages; p++) {
                    this.progress = { current: ++done, total, text: `Reading ${sides[s].file.name}` };
                    const page = await docs[s].getPage(p);
                    const content = await page.getTextContent();
                    pages.push(pageText(content.items.filter((i): i is TextItem => 'str' in i)));
                    page.cleanup();
                }
                read.push(pages);
                await docs[s].destroy();
            }
            this.original = { file: sides[0].file, pages: read[0] };
            this.changed = { file: sides[1].file, pages: read[1] };
            this.compared = true;
        } catch (e) {
            console.error('[Compare PDF] Error:', e);
            const locked = e instanceof Error && e.name === 'PasswordException';
            toast.error(locked ? 'One of these PDFs is password protected. Unlock it first.' : 'Could not read one of these PDFs.');
        } finally {
            this.isProcessing = false;
        }
    }
}

/** Joins pdf.js text items into lines, adding spaces only where the glyphs are visibly apart. */
export function pageText(items: TextItem[]): string {
    let out = '';
    let prev: TextItem | null = null;
    for (const item of items) {
        if (prev && !out.endsWith('\n')) {
            const size = Math.max(1, Math.abs(item.transform[3]) || item.height);
            const newLine = Math.abs(item.transform[5] - prev.transform[5]) > size * 0.5;
            const gap = item.transform[4] - (prev.transform[4] + prev.width);
            if (newLine) out += '\n';
            else if (gap > size * 0.15 && !/\s$/.test(out) && !/^\s/.test(item.str)) out += ' ';
        }
        out += item.str;
        if (item.hasEOL) out += '\n';
        prev = item;
    }
    return out;
}
