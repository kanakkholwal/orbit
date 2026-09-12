import { PdfEngine } from '$lib/pdf-engine.svelte';
import { toast } from 'svelte-sonner';
import * as XLSX from 'xlsx';
import { renderDocument } from '../create-pdf/model/engine';
import type { PageSize } from '../create-pdf/model/types';
import { buildTableDoc, type Orientation, readSheets, type SheetData, type TableOptions, type TextSize } from './build';

export type { Orientation, PageSize, TextSize };

export const ACCEPTED_FORMATS = '.xlsx,.xls,.csv,.ods';

/** Rows beyond this make the PDF noticeably slower to build. */
export const LARGE_SHEET_ROWS = 3000;

const PREVIEW_ROWS = 8;

export interface SheetSummary {
    name: string;
    rowCount: number;
    columns: number;
    selected: boolean;
    preview: string[][];
}

export interface SpreadsheetFile {
    id: string;
    file: File;
    status: 'reading' | 'ready' | 'processing' | 'done' | 'error';
    sheets: SheetSummary[];
    pages?: number;
    resultBlob?: Blob;
    error?: string;
}

const pdfName = (file: File) => `${baseName(file)}.pdf`;
const baseName = (file: File) => file.name.replace(/\.[^/.]+$/, '');

export class ExcelToPdfState extends PdfEngine {
    files = $state<SpreadsheetFile[]>([]);
    settings = $state<TableOptions>({
        header: true,
        titles: true,
        striped: true,
        size: 'A4',
        orientation: 'auto',
        textSize: 'normal',
    });
    preview = $state<{ fileId: string; sheet: number } | null>(null);

    private rows = new Map<string, SheetData[]>();

    async addFiles(newFiles: File[]) {
        const valid = newFiles.filter(f => /\.(xlsx|xls|csv|ods)$/i.test(f.name));
        if (valid.length < newFiles.length) toast.error('Some files were skipped. Choose Excel, CSV or ODS files.');

        const entries = valid.map(file => ({ id: crypto.randomUUID(), file, status: 'reading' as const, sheets: [] }));
        this.files.push(...entries);
        for (const { id } of entries) await this.read(id);
    }

    private async read(id: string) {
        const entry = this.files.find(f => f.id === id);
        if (!entry) return;
        try {
            const data = /\.csv$/i.test(entry.file.name) ? await entry.file.text() : await entry.file.arrayBuffer();
            const sheets = readSheets(XLSX, data, baseName(entry.file));
            this.rows.set(id, sheets);
            entry.sheets = sheets.map(sheet => ({
                name: sheet.name,
                rowCount: sheet.rows.length,
                columns: sheet.columns,
                selected: sheet.columns > 0 && !sheet.hidden,
                preview: sheet.rows.slice(0, PREVIEW_ROWS + 1),
            }));
            if (!entry.sheets.some(s => s.selected)) {
                entry.status = 'error';
                entry.error = 'No data found';
                return;
            }
            entry.status = 'ready';
            if (!this.preview) this.preview = { fileId: id, sheet: entry.sheets.findIndex(s => s.selected) };
        } catch (e) {
            console.error('[Excel to PDF] Could not read', entry.file.name, e);
            entry.status = 'error';
            entry.error = 'Could not read this file';
        }
    }

    removeFile(id: string) {
        this.files = this.files.filter(f => f.id !== id);
        this.rows.delete(id);
        if (this.preview?.fileId === id) {
            const next = this.files.find(f => f.sheets.some(s => s.selected));
            this.preview = next ? { fileId: next.id, sheet: next.sheets.findIndex(s => s.selected) } : null;
        }
    }

    reset() {
        this.files = [];
        this.rows.clear();
        this.preview = null;
        this.isProcessing = false;
        this.progress = { current: 0, total: 0, text: '' };
    }

    get previewSheet() {
        if (!this.preview) return null;
        const { fileId, sheet } = this.preview;
        const file = this.files.find(f => f.id === fileId);
        return file?.sheets[sheet] ? { file, sheet: file.sheets[sheet] } : null;
    }

    /** Files with at least one sheet chosen. */
    get convertible() {
        return this.files.filter(f => f.status !== 'reading' && f.sheets.some(s => s.selected && s.columns > 0));
    }

    get selectedSheets() {
        return this.convertible.flatMap(f => f.sheets.filter(s => s.selected));
    }

    get doneFiles() {
        return this.files.filter(f => f.status === 'done' && f.resultBlob);
    }

    get totalSize() {
        return this.files.reduce((sum, f) => sum + f.file.size, 0);
    }

    /** Converted PDFs as Files, for handing to another tool. */
    get resultFiles(): File[] {
        return this.doneFiles.map(f => new File([f.resultBlob!], pdfName(f.file), { type: 'application/pdf' }));
    }

    async process() {
        const queue = this.convertible;
        if (queue.length === 0) return;

        this.isProcessing = true;
        this.progress = { current: 0, total: queue.length, text: 'Getting ready' };
        for (const entry of this.files) {
            if (entry.status === 'done' || queue.includes(entry)) entry.status = 'ready';
            entry.resultBlob = undefined;
        }

        try {
            const { PDFDocument } = await import('pdf-lib');
            for (let i = 0; i < queue.length; i++) {
                const entry = queue[i];
                entry.status = 'processing';
                this.progress = { current: i + 1, total: queue.length, text: `Making ${pdfName(entry.file)}` };
                try {
                    const all = this.rows.get(entry.id) ?? [];
                    const chosen = all.filter((_, s) => entry.sheets[s]?.selected);
                    const doc = buildTableDoc(baseName(entry.file), chosen, $state.snapshot(this.settings));
                    const bytes = await renderDocument(doc);
                    entry.pages = (await PDFDocument.load(bytes, { updateMetadata: false })).getPageCount();
                    entry.resultBlob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
                    entry.status = 'done';
                } catch (e) {
                    console.error('[Excel to PDF] Could not convert', entry.file.name, e);
                    entry.status = 'error';
                    entry.error = 'Could not make this PDF';
                }
            }
            await this.downloadResults();
        } catch (e) {
            console.error('[Excel to PDF] Error:', e);
            toast.error("The PDF engine couldn't start. Reload the page and try again.");
            for (const entry of queue) if (entry.status === 'processing') entry.status = 'ready';
        } finally {
            this.isProcessing = false;
        }
    }

    async downloadResults() {
        const done = this.doneFiles;
        if (done.length === 0) return;
        if (done.length === 1) {
            this.downloadBlob(done[0].resultBlob!, pdfName(done[0].file));
            return;
        }
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        const used = new Set<string>();
        for (const f of done) {
            let name = pdfName(f.file);
            for (let n = 2; used.has(name); n++) name = `${baseName(f.file)} (${n}).pdf`;
            used.add(name);
            zip.file(name, f.resultBlob!);
        }
        this.downloadBlob(await zip.generateAsync({ type: 'blob' }), 'excel-to-pdf.zip');
    }
}
