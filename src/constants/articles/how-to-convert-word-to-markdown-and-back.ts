import type { Article } from "./index";

const article: Article = {
  slug: "how-to-convert-word-to-markdown-and-back",
  title: "How to Convert Word to Markdown, HTML or EPUB (and Back)",
  description:
    "Turn a DOCX into clean Markdown or HTML, write in Markdown and hand over a Word file, or build an EPUB e-book. Convert documents privately on your own device.",
  published: "2026-11-12",
  readingMinutes: 5,
  keywords: [
    "word to markdown",
    "docx to md",
    "markdown to word",
    "markdown to docx",
    "docx to html",
    "markdown to epub",
    "document converter no upload",
    "odt to docx",
  ],
  tools: ["document-converter", "docx-to-md", "md-to-docx", "docx-to-html"],
  body: `Documents live in many formats. You may write in Markdown because it is fast and tidy, then be asked for a Word file. Or you may receive a DOCX and need clean text for a website. A document converter reads the structure of one format and writes it in another.

## What survives and what does not

Converters keep the **structure**: headings, paragraphs, lists, tables, links, bold and italic, and pictures. They do not promise to keep exact **layout**: fonts, page breaks, columns and complex styles can change, because plain formats like Markdown have no way to express them.

That is fine for most uses. Expect to check the result and tidy small things.

## Convert a document

1. Open [Document Converter](/tools/document-converter), or a direct page such as [Word to Markdown](/tools/docx-to-md) or [Markdown to Word](/tools/md-to-docx).
2. Add one or more files. DOCX, ODT, Markdown, HTML, EPUB, RTF and more are accepted.
3. Choose **Save as**: Word, ODT, Markdown, HTML, EPUB, plain text and others.
4. Press **Convert**. With several files you get one ZIP.

If a document contains pictures, the result is a ZIP so the images stay next to the text.

## The first-use download

Document conversion uses pandoc, a well-known converter, compiled to run in your browser. That engine is about 58 MB. Orbit downloads it once the first time you convert, shows the progress, and stores it, so later conversions work offline. Only the converter program is downloaded. Your document is never uploaded.

## Common jobs

- **Write in Markdown, deliver Word.** Draft in your editor and convert at the end.
- **Word to the web.** Use [Word to HTML](/tools/docx-to-html) for a page you can publish.
- **Make an e-book.** Convert Markdown to EPUB for e-readers.
- **Switch office suites.** Move between Word and LibreOffice formats without opening either.

## Tips

Use real heading styles in Word, not just large bold text. Converters read heading styles, so documents built with them convert cleanly into headings.`,
};

export default article;
