import { BaseEngine } from '$lib/base-engine.svelte';
import { loadPyMuPDF } from '$utils/pymupdf-loader';
import { toast } from 'svelte-sonner';
import * as XLSX from 'xlsx';

export class PdfToExcelState extends BaseEngine {
    file = $state<{ file: File; originalSize: number } | null>(null);


    loadFile(files: File[]) {
        const validFile = files.find(
            f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );

        if (!validFile) {
            toast.error('Please upload a valid PDF file.');
            return;
        }

        this.file = { file: validFile, originalSize: validFile.size };
    }

    reset() {
        this.file = null;
        this.isProcessing = false;
        this.progress.text = '';
    }

    // Processing 

    async process() {
        if (!this.file) return;
        
        this.isProcessing = true;
        this.progress.text = 'Loading extraction engine...';

        try {
            const pymupdf = await loadPyMuPDF();
            this.progress.text = 'Extracting tables...';

            const doc = await pymupdf.open(this.file.file);
            const pageCount = doc.pageCount;
            const baseName = this.file.file.name.replace(/\.[^/.]+$/, '');

            interface TableData {
                page: number;
                rows: (string | null)[][];
            }

            const allTables: TableData[] = [];

            for (let i = 0; i < pageCount; i++) {
                this.progress.text = `Scanning page ${i + 1} of ${pageCount}...`;
                const page = doc.getPage(i);
                
                // PyMuPDF's findTables returns a list of table objects
                const tables = page.findTables();

                tables.forEach((table: any) => {
                    allTables.push({
                        page: i + 1,
                        rows: table.rows,
                    });
                });
            }

            if (allTables.length === 0) {
                toast.error('No tables were detected in this PDF.');
                this.isProcessing = false;
                return;
            }

            this.progress.text = 'Creating Excel file...';

            const workbook = XLSX.utils.book_new();

            if (allTables.length === 1) {
                const worksheet = XLSX.utils.aoa_to_sheet(allTables[0].rows);
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Table');
            } else {
                allTables.forEach((table, idx) => {
                    // Excel sheet names must be <= 31 chars
                    const sheetName = `Table ${idx + 1} (Page ${table.page})`.substring(0, 31);
                    const worksheet = XLSX.utils.aoa_to_sheet(table.rows);
                    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
                });
            }

            const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([xlsxData], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            
            this.downloadBlob(blob, `${baseName}.xlsx`);

        } catch (e: any) {
            console.error('[PDF to Excel] Error:', e);
            toast.error(`Failed to convert PDF to Excel: ${e.message}`);
        } finally {
            this.isProcessing = false;
        }
    }


}