import { IconFileText, type Icon } from '$lib/icons';

export interface DocDef {
    slug: string;
    title: string;
    seoTitle: string;
    description: string;
    keywords: string[];
    icon: Icon;
    /** Format id the tool saves to by default. */
    to?: string;
}

const noUpload = ['no upload', 'free', 'offline'];

const base: DocDef = {
    slug: 'document-converter',
    title: 'Document Converter',
    seoTitle: 'Convert Documents Between DOCX, Markdown, HTML, EPUB and More',
    description: 'Convert Word, ODT, Markdown, HTML, EPUB, RTF, LaTeX and more between each other in your browser. Free, private, and your files never leave the device.',
    icon: IconFileText,
    keywords: ['document converter', 'docx to markdown', 'markdown to docx', 'convert word document', 'epub converter', 'odt to docx', 'document converter no upload', ...noUpload]
};

const doc = (slug: string, title: string, to: string, description: string, keywords: string[]): DocDef => ({
    slug,
    title,
    seoTitle: `${title} Online Without Uploading`,
    description,
    icon: IconFileText,
    to,
    keywords: [...keywords, ...noUpload]
});

const aliases: DocDef[] = [
    doc('md-to-docx', 'Markdown to Word', 'docx', 'Turn a Markdown file into a Word document. Free, private, and nothing is uploaded.', ['markdown to word', 'md to docx', 'markdown to docx']),
    doc('docx-to-md', 'Word to Markdown', 'md', 'Turn a Word document into clean Markdown. Free, private, and nothing is uploaded.', ['word to markdown', 'docx to md', 'docx to markdown']),
    doc('docx-to-html', 'Word to HTML', 'html', 'Turn a Word document into a web page. Free, private, and nothing is uploaded.', ['word to html', 'docx to html']),
    doc('md-to-html', 'Markdown to HTML', 'html', 'Turn Markdown into an HTML page. Free, private, and nothing is uploaded.', ['markdown to html', 'md to html']),
    doc('html-to-docx', 'HTML to Word', 'docx', 'Turn an HTML page into a Word document. Free, private, and nothing is uploaded.', ['html to word', 'html to docx']),
    doc('docx-to-odt', 'Word to ODT', 'odt', 'Turn a Word document into an OpenDocument text file for LibreOffice. Free, private, and nothing is uploaded.', ['docx to odt', 'word to odt', 'word to libreoffice']),
    doc('odt-to-docx', 'ODT to Word', 'docx', 'Turn an OpenDocument text file into a Word document. Free, private, and nothing is uploaded.', ['odt to docx', 'odt to word']),
    doc('rtf-to-docx', 'RTF to Word', 'docx', 'Turn an RTF file into a Word document. Free, private, and nothing is uploaded.', ['rtf to docx', 'rtf to word']),
    doc('docx-to-txt', 'Word to Text', 'txt', 'Pull the plain text out of a Word document. Free, private, and nothing is uploaded.', ['docx to txt', 'word to text', 'extract text from word']),
    doc('md-to-epub', 'Markdown to EPUB', 'epub', 'Turn Markdown into an EPUB e-book. Free, private, and nothing is uploaded.', ['markdown to epub', 'md to epub', 'make an ebook'])
];

export const DOC_BASE = base;
export const DOC_DEFS: DocDef[] = [base, ...aliases];
export const getDocDef = (slug: string | undefined) => DOC_DEFS.find((d) => d.slug === slug);
