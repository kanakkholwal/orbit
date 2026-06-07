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

> Everything stays local — nothing is uploaded.

---

1. Paste or load Markdown
2. Click *Convert to PDF*
3. Download the result
`;

export class MdToPdfState extends PdfEngine {
    markdown = $state('');
    fileName = $state('document');

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
        await this.handleProcess(
            async () => {
                const bytes = await markdownToPdf(this.markdown, { title: this.fileName });
                const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
                this.downloadBlob(blob, `${this.fileName || 'document'}.pdf`);
            },
            {
                loading: 'Rendering PDF…',
                success: 'PDF ready.',
                error: 'Failed to convert Markdown.'
            }
        );
    }

    reset() {
        this.markdown = '';
        this.fileName = 'document';
    }
}
