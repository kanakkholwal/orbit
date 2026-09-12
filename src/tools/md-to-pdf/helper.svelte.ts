import { PdfEngine } from '$lib/pdf-engine.svelte';
import { markdownToPdf } from '$utils/md-to-pdf';

const SAMPLE = `# Document title

A short paragraph with **bold**, *italic*, and \`inline code\`. Markdown is
converted to a clean PDF entirely on your device.

## Features

- Headings, paragraphs and lists
- **Bold** and *italic* runs
- Fenced code blocks
- Blockquotes and rules

\`\`\`
const greeting = "hello world";
console.log(greeting);
\`\`\`

> Everything stays on your device. Nothing is uploaded.

---

1. Paste or load Markdown
2. Click *Create PDF*
3. Download the result
`;

export class MdToPdfState extends PdfEngine {
    markdown = $state('');
    fileName = $state('document');
    result = $state.raw<{ blob: Blob; name: string; source: string } | null>(null);

    get isEmpty(): boolean {
        return this.markdown.trim().length === 0;
    }

    get charCount(): number {
        return this.markdown.length;
    }

    loadSample() {
        this.markdown = SAMPLE;
        this.fileName = 'document';
    }

    async loadFile(file: File) {
        if (!file) return;
        this.fileName = file.name.replace(/\.(md|markdown|txt)$/i, '') || 'document';
        this.markdown = await file.text();
    }

    async convert() {
        if (this.isEmpty) return;
        const source = this.markdown;
        await this.handleProcess(
            async () => {
                const bytes = await markdownToPdf(source, { title: this.fileName });
                const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
                const name = `${this.fileName || 'document'}.pdf`;
                this.result = { blob, name, source };
                this.downloadBlob(blob, name);
            },
            {
                loading: 'Rendering PDF…',
                success: 'PDF ready.',
                error: 'Failed to convert Markdown.'
            }
        ).catch(() => {});
    }

    get resultFiles(): File[] {
        return this.result ? [new File([this.result.blob], this.result.name, { type: 'application/pdf' })] : [];
    }

    downloadResult() {
        if (this.result) this.downloadBlob(this.result.blob, this.result.name);
    }

    reset() {
        this.result = null;
        this.markdown = '';
        this.fileName = 'document';
    }
}
