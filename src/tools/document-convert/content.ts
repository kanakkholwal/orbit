import type { ToolContent } from '$constants/tool-content';

export const docToolContent: Record<string, Partial<ToolContent>> = {
    'document-converter': {
        howItWorks: [
            'Add one or more documents, such as DOCX, ODT, Markdown, HTML, EPUB or RTF.',
            'Choose the format to save as.',
            'Press Convert. The first time, a 58 MB converter downloads once and is kept for offline use.',
            'Download one file or a ZIP.'
        ],
        useCases: [
            { title: 'Writing and publishing', body: 'Write in Markdown and hand over a Word file, or make an EPUB e-book.' },
            { title: 'Switching office suites', body: 'Move between Word and LibreOffice formats without opening either.' },
            { title: 'Clean text', body: 'Pull plain text or Markdown out of a Word document.' }
        ],
        faqs: [
            { q: 'Why is there a 58 MB download?', a: 'The converter is pandoc compiled to WebAssembly so it can run on your device. It downloads once, is cached, and then works offline.' },
            { q: 'Will layout and fonts stay the same?', a: 'Structure is kept: headings, lists, tables, links and images. Exact page layout, fonts and complex styling can change between formats.' },
            { q: 'Is my document uploaded?', a: 'No. Only the converter program is downloaded. Your document is processed on your device and never sent anywhere.' }
        ]
    }
};
