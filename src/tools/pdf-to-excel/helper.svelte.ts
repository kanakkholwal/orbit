import { PdfEngine } from '$lib/pdf-engine.svelte';
import { loadPyMuPDF } from '$utils/pymupdf-loader';
import { toast } from 'svelte-sonner';
import * as XLSX from 'xlsx';

export interface ExcelFile {
    id: string;
    file: File;
    originalSize: number;
    status: 'pending' | 'processing' | 'done' | 'error';
    tables?: number;
    resultBlob?: Blob;
    error?: string;
}

interface TableData {
    page: number;
    rows: (string | null)[][];
}

const xlsxName = (file: File) => `${file.name.replace(/\.[^/.]+$/, '')}.xlsx`;

export class PdfToExcelState extends PdfEngine {
    files = $state<ExcelFile[]>([]);

    addFiles(newFiles: File[]) {
        const validFiles = newFiles.filter(
            f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );

        if (validFiles.length < newFiles.length) {
            toast.error('Some files were skipped. Only PDF files are allowed.');
        }

        for (const f of validFiles) {
            this.files.push({ id: crypto.randomUUID(), file: f, originalSize: f.size, status: 'pending' });
        }
    }

    removeFile(id: string) {
        this.files = this.files.filter(f => f.id !== id);
    }

    reset() {
        this.files = [];
        this.isProcessing = false;
        this.progress = { current: 0, total: 0, text: '' };
    }

    get doneFiles() {
        return this.files.filter(f => f.status === 'done' && f.resultBlob);
    }

    get totalSize() {
        return this.files.reduce((sum, f) => sum + f.originalSize, 0);
    }

    async process() {
        const queue = this.files.filter(f => f.status === 'pending');
        if (queue.length === 0) return;

        this.isProcessing = true;
        this.progress = { current: 0, total: queue.length, text: 'Getting ready' };

        try {
            const pymupdf = await loadPyMuPDF();

            for (let i = 0; i < queue.length; i++) {
                const entry = queue[i];
                entry.status = 'processing';
                this.progress = { current: i + 1, total: queue.length, text: `Finding tables in ${entry.file.name}` };

                try {
                    const tables = await this.extractTables(pymupdf, entry.file);
                    if (tables.length === 0) {
                        entry.status = 'error';
                        entry.error = 'No tables found';
                        continue;
                    }
                    entry.resultBlob = this.buildWorkbook(tables);
                    entry.tables = tables.length;
                    entry.status = 'done';
                } catch (e: any) {
                    console.error('[PDF to Excel] Error:', e);
                    entry.status = 'error';
                    entry.error = 'Could not read this file';
                }
            }

            await this.downloadResults(queue.filter(f => f.status === 'done'));
        } catch (e: any) {
            console.error('[PDF to Excel] Error:', e);
            toast.error(`Failed to convert PDF to Excel: ${e.message}`);
            for (const entry of queue) if (entry.status === 'processing') entry.status = 'pending';
        } finally {
            this.isProcessing = false;
        }
    }

    private async extractTables(pymupdf: any, file: File): Promise<TableData[]> {
        const doc = await pymupdf.open(file);
        const allTables: TableData[] = [];

        for (let i = 0; i < doc.pageCount; i++) {
            const page = doc.getPage(i);
            page.findTables().forEach((table: any) => {
                allTables.push({ page: i + 1, rows: table.rows });
            });
        }

        return allTables;
    }

    private buildWorkbook(tables: TableData[]): Blob {
        const workbook = XLSX.utils.book_new();

        if (tables.length === 1) {
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(tables[0].rows), 'Table');
        } else {
            tables.forEach((table, idx) => {
                // Excel sheet names are capped at 31 characters.
                const sheetName = `Table ${idx + 1} (Page ${table.page})`.substring(0, 31);
                XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(table.rows), sheetName);
            });
        }

        const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        return new Blob([xlsxData], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
    }

    downloadOne(id: string) {
        const entry = this.doneFiles.find(f => f.id === id);
        if (entry) this.downloadBlob(entry.resultBlob!, xlsxName(entry.file));
    }

    async downloadResults(entries: ExcelFile[] = this.doneFiles) {
        const done = entries.filter(f => f.resultBlob);
        if (done.length === 0) return;

        if (done.length === 1) {
            this.downloadOne(done[0].id);
            return;
        }

        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        for (const f of done) zip.file(xlsxName(f.file), await f.resultBlob!.arrayBuffer());
        this.downloadBlob(await zip.generateAsync({ type: 'blob' }), 'pdf-to-excel.zip');
    }
}
