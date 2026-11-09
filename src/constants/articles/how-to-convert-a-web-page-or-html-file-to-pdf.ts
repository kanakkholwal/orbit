import type { Article } from "./index";

const article: Article = {
  slug: "how-to-convert-a-web-page-or-html-file-to-pdf",
  title: "How to Convert a Web Page or HTML File to PDF (and PDF Back to HTML)",
  description:
    "Save a web page or an HTML file as a PDF, and turn a PDF into a clean HTML page. Learn the options, what each keeps, and how to get a readable result.",
  published: "2026-11-09",
  readingMinutes: 5,
  keywords: [
    "html to pdf",
    "save web page as pdf",
    "convert html file to pdf",
    "pdf to html",
    "webpage to pdf offline",
    "html to pdf no upload",
  ],
  tools: ["html-to-pdf", "pdf-to-html", "md-to-pdf", "pdf-to-text"],
  body: `There are three common reasons to turn a web page into a PDF: keeping a copy of an article, sending someone a receipt or confirmation, and archiving a page that may change. The best method depends on whether you need the exact look or just the content.

## Option 1: the browser's own Save as PDF

Every major browser can print a page to PDF. Open the print dialog, choose Save as PDF as the destination, and save. This gives the closest match to what you see, including styling and images, and it is the best choice when appearance matters.

## Option 2: convert a saved .html file

If you have the page as an .html file, or you wrote one yourself, use [HTML to PDF](/tools/html-to-pdf).

1. Drop in the .html file.
2. Click **Convert to PDF**.

This reads the structure of the document, not its styling:

- Headings, paragraphs, lists, links, code and tables are kept.
- Pictures are included if they are embedded in the file or reachable from the web.
- CSS, scripts and page layout are ignored.

It is the right choice when you want clean, readable text from a document and do not care about colours and columns. Pages that need a server, such as ones behind a login, cannot be fetched by address, so save the page as a file first.

## Option 3: from Markdown

If your content is in Markdown, skip HTML and use [Markdown to PDF](/tools/md-to-pdf). See [how to convert a Markdown README to PDF](/articles/how-to-convert-a-markdown-readme-to-pdf).

## Convert PDF to HTML

To get a PDF's content onto a web page, use [PDF to HTML](/tools/pdf-to-html):

1. Drop in your PDF.
2. Click **Convert to HTML**.
3. Open the downloaded .html file in a browser, or paste it into your site.

Text is rebuilt into headings, paragraphs and lists using font sizes and spacing. Images, multiple columns and exact positions are not kept. A scanned PDF has no text, so run [OCR](/tools/ocr-pdf) first.

If you only need the words, [PDF to Text](/tools/pdf-to-text) is simpler.

## Which one should I pick?

- Exact appearance of a web page: the browser's Save as PDF.
- Clean text from a saved HTML file: HTML to PDF.
- Content from a PDF onto a web page: PDF to HTML.
- Plain words only: PDF to Text.

## Privacy

Converters that fetch a web page by address do so from their own servers, which means they see the page and any information in the address. Converting a file in your browser means the content stays with you.
`,
};

export default article;
