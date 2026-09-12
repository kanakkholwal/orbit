import { PdfEngine } from '$lib/pdf-engine.svelte';
import { pdfToMarkdown } from '$utils/pdf-to-md';
import { toast } from 'svelte-sonner';

export class PdfToMdState extends PdfEngine {
    file = $state.raw<File | null>(null);
    fileName = $state('document');
    markdown = $state('');
    pageCount = $state(0);
    converted = $state(false);

    get hasResult(): boolean {
        return this.markdown.trim().length > 0;
    }

    selectFile(file: File) {
        if (!file) return;
        this.file = file;
        this.markdown = '';
        this.pageCount = 0;
        this.converted = false;
    }

    async convert() {
        if (!this.file) return;
        await this.loadFile(this.file).catch(() => {});
    }

    async loadFile(file: File) {
        if (!file) return;
        this.fileName = file.name.replace(/\.pdf$/i, '') || 'document';
        this.markdown = '';

        await this.handleProcess(
            async () => {
                const pdfjs = await this.getPdfJs();
                const buffer = await file.arrayBuffer();
                const doc = await pdfjs.getDocument(new Uint8Array(buffer)).promise;
                this.pageCount = doc.numPages;
                this.markdown = await pdfToMarkdown(doc, (page, total) => {
                    this.progress = { current: page, total, text: 'Extracting text' };
                });
                if (!this.markdown.trim()) {
                    throw new Error('No selectable text found');
                }
                this.converted = true;
            },
            {
                loading: 'Extracting Markdown…',
                success: 'Markdown ready.',
                error: (e) =>
                    /no selectable text/i.test(e?.message ?? '')
                        ? 'No selectable text found. This looks like a scanned PDF. Make its text searchable first.'
                        : 'Failed to extract Markdown.'
            }
        );
    }

    download() {
        if (!this.hasResult) return;
        const blob = new Blob([this.markdown], { type: 'text/markdown;charset=utf-8' });
        this.downloadBlob(blob, `${this.fileName || 'document'}.md`);
    }

    async copy() {
        if (!this.hasResult) return;
        try {
            await navigator.clipboard.writeText(this.markdown);
            toast.success('Copied to clipboard.');
        } catch {
            toast.error('Could not copy to clipboard.');
        }
    }

    reset() {
        this.file = null;
        this.converted = false;
        this.fileName = 'document';
        this.markdown = '';
        this.pageCount = 0;
        this.progress = { current: 0, total: 0, text: '' };
    }
}
