import { arrayMove } from '$lib/actions/sortable-list';
import { PdfEngine } from '$lib/pdf-engine.svelte';
import JSZip from 'jszip';
import { nanoid } from 'nanoid';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'svelte-sonner';
import { PRINTABLE, batesRanges, formatBates, stampBates, type StampPosition } from './bates';

export interface BatesFile {
    id: string;
    file: File;
    pageCount: number;
    status: 'pending' | 'processing' | 'done' | 'error';
    error?: string;
    result?: { blob: Blob; name: string };
    stamped?: string;
}

export interface BatesSettings {
    prefix: string;
    suffix: string;
    start: number;
    digits: number;
    position: StampPosition;
    fontSize: number;
    margin: number;
    continueAcrossFiles: boolean;
    includeDate: boolean;
}

const clamp = (value: number, min: number, max: number, fallback: number) => {
    const n = Math.floor(Number(value));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

/** Today's date as YYYY-MM-DD in local time. */
export function todayStamp(now = new Date()) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export class BatesState extends PdfEngine {
    files = $state<BatesFile[]>([]);
    settings = $state<BatesSettings>({
        prefix: 'ABC',
        suffix: '',
        start: 1,
        digits: 6,
        position: 'bottom-right',
        fontSize: 10,
        margin: 24,
        continueAcrossFiles: true,
        includeDate: false
    });

    get options() {
        const s = this.settings;
        return {
            prefix: s.prefix,
            suffix: s.suffix,
            start: clamp(s.start, 0, 999_999_999_999, 1),
            digits: clamp(s.digits, 1, 12, 6),
            position: s.position,
            fontSize: clamp(s.fontSize, 6, 36, 10),
            margin: clamp(s.margin, 0, 144, 24),
            continueAcrossFiles: s.continueAcrossFiles,
            date: s.includeDate ? todayStamp() : null
        };
    }

    get textIssue(): string | null {
        if (!PRINTABLE.test(this.settings.prefix) || !PRINTABLE.test(this.settings.suffix)) {
            return 'Prefix and suffix can use English letters, numbers and common symbols only';
        }
        return null;
    }

    get ranges() {
        return batesRanges(
            this.files.map((f) => f.pageCount),
            this.options
        );
    }

    get totalPages() {
        return this.files.reduce((sum, f) => sum + f.pageCount, 0);
    }

    get totalSize() {
        return this.files.reduce((sum, f) => sum + f.file.size, 0);
    }

    get doneFiles() {
        return this.files.filter((f) => f.status === 'done' && f.result);
    }

    get canRun() {
        return !this.isProcessing && this.files.length > 0 && !this.textIssue;
    }

    get resultFiles(): File[] {
        return this.doneFiles.map((f) => new File([f.result!.blob], f.result!.name, { type: 'application/pdf' }));
    }

    label(n: number) {
        return formatBates(n, this.options);
    }

    async addFiles(picked: File[]) {
        this.markStale();
        this.isProcessing = true;
        try {
            for (const file of picked) {
                try {
                    const doc = await PDFDocument.load(await file.arrayBuffer());
                    this.files.push({ id: nanoid(), file, pageCount: doc.getPageCount(), status: 'pending' });
                } catch (e) {
                    console.error(e);
                    toast.error(`${file.name} could not be opened. It may be damaged or password protected.`);
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }

    removeFile(id: string) {
        this.files = this.files.filter((f) => f.id !== id);
        this.markStale();
    }

    moveFile(from: number, to: number) {
        if (to < 0 || to >= this.files.length) return;
        this.files = arrayMove(this.files, from, to);
        this.markStale();
    }

    /** Numbers depend on file order, so any change to the list invalidates earlier results. */
    markStale() {
        for (const f of this.files) {
            f.status = 'pending';
            f.result = undefined;
            f.error = undefined;
            f.stamped = undefined;
        }
    }

    async process() {
        if (!this.canRun) return;
        this.markStale();
        const options = this.options;
        const ranges = this.ranges;
        this.isProcessing = true;
        this.progress = { current: 0, total: this.files.length, text: 'Stamping' };
        try {
            for (let i = 0; i < this.files.length; i++) {
                const entry = this.files[i];
                entry.status = 'processing';
                this.progress = { current: i + 1, total: this.files.length, text: `Stamping ${entry.file.name}` };
                try {
                    const doc = await PDFDocument.load(await entry.file.arrayBuffer());
                    await stampBates(doc, ranges[i].first, options);
                    const bytes = await doc.save();
                    const name = `${entry.file.name.replace(/\.pdf$/i, '')}_bates.pdf`;
                    entry.result = { blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }), name };
                    entry.stamped = `${formatBates(ranges[i].first, options)} to ${formatBates(ranges[i].last, options)}`;
                    entry.status = 'done';
                } catch (e) {
                    console.error(e);
                    entry.status = 'error';
                    entry.error = 'Could not stamp';
                }
            }
            await this.downloadResults();
        } finally {
            this.isProcessing = false;
        }
    }

    async downloadResults() {
        const done = this.doneFiles;
        if (done.length === 0) return;
        if (done.length === 1) {
            this.downloadBlob(done[0].result!.blob, done[0].result!.name);
            return;
        }
        const zip = new JSZip();
        const used = new Set<string>();
        for (const f of done) {
            let name = f.result!.name;
            for (let n = 2; used.has(name); n++) name = f.result!.name.replace(/\.pdf$/i, `_${n}.pdf`);
            used.add(name);
            zip.file(name, f.result!.blob);
        }
        this.downloadBlob(await zip.generateAsync({ type: 'blob' }), 'bates_numbered.zip');
    }

    downloadOne(id: string) {
        const f = this.files.find((x) => x.id === id);
        if (f?.result) this.downloadBlob(f.result.blob, f.result.name);
    }

    reset() {
        this.files = [];
    }
}
