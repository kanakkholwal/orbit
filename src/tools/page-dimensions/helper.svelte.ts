import { PDFDocument } from 'pdf-lib';
import { BaseEngine } from '$lib/base-engine.svelte'; 
import { toast } from 'svelte-sonner';

export interface PageData {
    pageNum: number;
    width: number;
    height: number;
    orientation: 'Portrait' | 'Landscape' | 'Square';
    standardSize: string;
    rotation: number;
}

export class PageDimensionsState extends BaseEngine {
    file = $state<{ file: File; originalSize: number } | null>(null);
    analyzedPagesData = $state<PageData[]>([]);
    selectedUnit = $state<'pt' | 'in' | 'mm' | 'px'>('in');

    private pdfDoc: PDFDocument | null = null;

    // Derived summary statistics
    summaryStats = $derived.by(() => {
        const totalPages = this.analyzedPagesData.length;
        const uniqueSizes = new Map<string, { count: number; label: string }>();

        this.analyzedPagesData.forEach((page) => {
            // Group by rounded width/height to account for slight float inaccuracies
            const key = `${Math.round(page.width)}x${Math.round(page.height)}`;
            const label = `${page.standardSize} (${page.orientation})`;
            
            if (uniqueSizes.has(key)) {
                uniqueSizes.get(key)!.count += 1;
            } else {
                uniqueSizes.set(key, { count: 1, label });
            }
        });

        const hasMixedSizes = uniqueSizes.size > 1;

        return {
            totalPages,
            uniqueSizesCount: uniqueSizes.size,
            uniqueSizes: Array.from(uniqueSizes.values()),
            hasMixedSizes
        };
    });

// Actions

    async loadFile(files: File[]) {
        const validFile = files.find(
            f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );

        if (!validFile) {
            toast.error('Please upload a valid PDF file.');
            return;
        }

        this.file = { file: validFile, originalSize: validFile.size };
        
        await this.handleProcess(async () => {
            const arrayBuffer = await validFile.arrayBuffer();
            this.pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            this.analyzeDimensions();
        }, {
            loading: 'Analyzing page dimensions...',
            success: 'Analysis complete!',
            error: 'Failed to analyze the PDF document.'
        });
    }

    reset() {
        this.file = null;
        this.pdfDoc = null;
        this.analyzedPagesData = [];
    }

    exportToCSV() {
        if (this.analyzedPagesData.length === 0) return;

        const headers = ['Page #', `Width (${this.selectedUnit})`, `Height (${this.selectedUnit})`, 'Standard Size', 'Orientation', 'Aspect Ratio', `Area (${this.selectedUnit}²)`, 'Rotation'];
        const csvRows = [headers.join(',')];

        this.analyzedPagesData.forEach((page) => {
            const w = this.convertPoints(page.width, this.selectedUnit);
            const h = this.convertPoints(page.height, this.selectedUnit);
            const ratio = (page.width / page.height).toFixed(3);
            const area = this.calculateArea(page.width, page.height, this.selectedUnit);

            const row = [
                page.pageNum,
                w,
                h,
                `"${page.standardSize}"`,
                page.orientation,
                ratio,
                area.replace(/[^\d.-]/g, ''), // Strip units for raw CSV data
                `${page.rotation}°`
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const originalName = this.file?.file.name.replace(/\.pdf$/i, '') || 'document';
        this.downloadBlob(blob, `${originalName}_dimensions.csv`);
    }

// Internal Logic

    private analyzeDimensions() {
        if (!this.pdfDoc) return;

        const pages = this.pdfDoc.getPages();
        const data: PageData[] = [];

        pages.forEach((page, index) => {
            const { width, height } = page.getSize();
            const rotation = page.getRotation().angle || 0;

            let orientation: PageData['orientation'] = 'Square';
            if (width > height) orientation = 'Landscape';
            else if (width < height) orientation = 'Portrait';

            data.push({
                pageNum: index + 1,
                width,
                height,
                orientation,
                standardSize: this.getStandardPageName(width, height),
                rotation
            });
        });

        this.analyzedPagesData = data;
    }

    // Formatting Helpers
    convertPoints(pts: number, unit: string): string {
        if (unit === 'in') return (pts / 72).toFixed(2);
        if (unit === 'mm') return (pts * (25.4 / 72)).toFixed(1);
        if (unit === 'px') return Math.round(pts * (96 / 72)).toString();
        return pts.toFixed(1); // 'pt'
    }

    calculateArea(width: number, height: number, unit: string): string {
        const areaInPoints = width * height;
        let convertedArea = 0;
        let unitSuffix = '';

        if (unit === 'in') {
            convertedArea = areaInPoints / (72 * 72);
            unitSuffix = 'in²';
        } else if (unit === 'mm') {
            convertedArea = areaInPoints / (72 * 72) * (25.4 * 25.4);
            unitSuffix = 'mm²';
        } else if (unit === 'px') {
            const pxPerPoint = 96 / 72;
            convertedArea = areaInPoints * (pxPerPoint * pxPerPoint);
            unitSuffix = 'px²';
        } else {
            convertedArea = areaInPoints;
            unitSuffix = 'pt²';
        }

        return `${convertedArea.toFixed(2)} ${unitSuffix}`;
    }

    getAspectRatio(width: number, height: number): string {
        return (width / height).toFixed(3);
    }

    private getStandardPageName(width: number, height: number): string {
        const tol = 2; // 2pt tolerance for slight PDF generation variances
        const isMatch = (w1: number, h1: number, w2: number, h2: number) => 
            (Math.abs(w1 - w2) < tol && Math.abs(h1 - h2) < tol) || 
            (Math.abs(w1 - h2) < tol && Math.abs(h1 - w2) < tol);

        // Standard Sizes in Points (72 dpi)
        const sizes = [
            { name: 'A4', w: 595.28, h: 841.89 },
            { name: 'Letter', w: 612, h: 792 },
            { name: 'Legal', w: 612, h: 1008 },
            { name: 'A3', w: 841.89, h: 1190.55 },
            { name: 'A5', w: 419.53, h: 595.28 },
            { name: 'Tabloid', w: 792, h: 1224 },
            { name: 'Executive', w: 522, h: 756 }
        ];

        for (const s of sizes) {
            if (isMatch(width, height, s.w, s.h)) return s.name;
        }

        return 'Custom';
    }
}