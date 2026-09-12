import { PdfEngine } from '$lib/pdf-engine.svelte';
import { EncryptedPDFError, PDFDocument } from 'pdf-lib';
import { buildFindings, type CleanOptions, cleanDocument, type Finding, type PrivacyScan, scanDocument } from './privacy';

const outputName = (file: File) => `${file.name.replace(/\.pdf$/i, '')}_clean.pdf`;
const load = (bytes: Uint8Array) => PDFDocument.load(bytes, { updateMetadata: false });

/** Single-file state for PDF Privacy Check: scan on load, clean and download on demand. */
export class PrivacyCheckState extends PdfEngine {
    file = $state.raw<File | null>(null);
    scan = $state.raw<PrivacyScan | null>(null);
    error = $state('');
    isScanning = $state(false);
    options = $state<CleanOptions>({ comments: false });
    result = $state.raw<{ blob: Blob; name: string; after: Finding[] } | null>(null);

    private bytes: Uint8Array | null = null;

    get findings(): Finding[] {
        return this.scan ? buildFindings(this.scan) : [];
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    async loadFile(files: File[]) {
        const file = files[0];
        if (!file) return;
        this.reset();
        this.file = file;
        this.isScanning = true;
        try {
            this.bytes = new Uint8Array(await file.arrayBuffer());
            this.scan = scanDocument(await load(this.bytes), this.bytes);
        } catch (e) {
            console.error('pdf-privacy-check:', e);
            this.error =
                e instanceof EncryptedPDFError
                    ? 'This PDF is locked with a password. Unlock it first, then check it again.'
                    : 'Orbit could not read this file. It may be damaged; try Repair PDF first.';
        } finally {
            this.isScanning = false;
        }
    }

    async clean() {
        if (!this.bytes || !this.file) return;
        this.isProcessing = true;
        try {
            const doc = await load(this.bytes);
            cleanDocument(doc, { ...this.options });
            const out = await doc.save({ updateFieldAppearances: false });
            const after = buildFindings(scanDocument(await load(out), out));
            const blob = new Blob([out as BlobPart], { type: 'application/pdf' });
            const name = outputName(this.file);
            this.result = { blob, name, after };
            this.downloadBlob(blob, name);
        } catch (e) {
            console.error('pdf-privacy-check:', e);
            this.error = 'Something went wrong while cleaning this file. Your original is unchanged.';
        } finally {
            this.isProcessing = false;
        }
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    reset() {
        this.file = null;
        this.scan = null;
        this.bytes = null;
        this.error = '';
        this.result = null;
        this.isProcessing = false;
    }
}
