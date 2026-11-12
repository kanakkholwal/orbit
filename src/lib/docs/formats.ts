export interface DocFormat {
    /** File extension without the dot, also the id. */
    id: string;
    label: string;
    /** pandoc reader name, when the format can be opened. */
    reader?: string;
    /** pandoc writer name, when the format can be saved. */
    writer?: string;
    /** Writers that produce a full document need pandoc's standalone mode. */
    standalone?: boolean;
}

export const DOC_FORMATS: DocFormat[] = [
    { id: 'docx', label: 'Word (DOCX)', reader: 'docx', writer: 'docx' },
    { id: 'odt', label: 'OpenDocument (ODT)', reader: 'odt', writer: 'odt' },
    { id: 'md', label: 'Markdown', reader: 'markdown', writer: 'gfm' },
    { id: 'html', label: 'HTML', reader: 'html', writer: 'html', standalone: true },
    { id: 'epub', label: 'EPUB', reader: 'epub', writer: 'epub' },
    { id: 'txt', label: 'Plain text', reader: 'markdown', writer: 'plain' },
    { id: 'rtf', label: 'RTF', reader: 'rtf', writer: 'rtf', standalone: true },
    { id: 'rst', label: 'reStructuredText', reader: 'rst', writer: 'rst' },
    { id: 'tex', label: 'LaTeX', reader: 'latex', writer: 'latex', standalone: true },
    { id: 'org', label: 'Org mode', reader: 'org', writer: 'org' },
    { id: 'ipynb', label: 'Jupyter notebook', reader: 'ipynb', writer: 'ipynb' },
    { id: 'csv', label: 'CSV', reader: 'csv' },
    { id: 'tsv', label: 'TSV', reader: 'tsv' }
];

/** Extensions that map onto a format id. */
const ALIASES: Record<string, string> = { markdown: 'md', htm: 'html', text: 'txt', latex: 'tex' };

export function formatOf(fileName: string): DocFormat | undefined {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    const id = ALIASES[ext] ?? ext;
    return DOC_FORMATS.find((f) => f.id === id);
}

export const TARGET_FORMATS = DOC_FORMATS.filter((f) => f.writer);
export const ACCEPT = DOC_FORMATS.map((f) => `.${f.id}`).concat('.markdown', '.htm', '.text', '.latex').join(',');
