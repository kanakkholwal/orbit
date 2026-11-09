import type { Article } from "./index";

const article: Article = {
  slug: "pdf-conversion-cheat-sheet-every-format-both-ways",
  title: "PDF Conversion Cheat Sheet: Every Format, Both Directions",
  description:
    "A reference for converting PDF to and from Word, Excel, PowerPoint, images, HTML, Markdown, text and CSV, with what each conversion keeps and where it loses detail.",
  published: "2026-11-09",
  readingMinutes: 7,
  keywords: [
    "pdf conversion cheat sheet",
    "convert pdf to word excel powerpoint",
    "pdf file formats guide",
    "pdf to image and back",
    "pdf converter comparison",
    "how to convert pdf formats",
  ],
  tools: ["pdf-to-docx", "word-to-pdf", "pdf-to-excel", "excel-to-pdf", "pdf-to-pptx", "pptx-to-pdf", "pdf-to-img", "img-to-pdf"],
  body: `Converting a PDF is easy. Converting it well depends on knowing what the target format can and cannot hold. This table-style guide covers each common format in both directions, and says plainly where detail is lost. Every tool listed runs in your browser, so files are not uploaded.

## Why conversions are not lossless

A PDF fixes the look of a page: positions, fonts and pictures. Word, Excel and PowerPoint store structure: paragraphs, cells and slides that reflow and can be edited. Turning fixed pages into structure means guessing, and turning structure into pages means choosing fonts and line breaks. Some change is unavoidable.

## Word

- **PDF to Word:** [PDF to Word](/tools/pdf-to-docx). Keeps text and basic structure. Complex layouts, columns and exact fonts may shift.
- **Word to PDF:** [Word to PDF](/tools/word-to-pdf). Keeps headings, lists, tables, links and PNG or JPEG pictures. Headers, footers, text boxes and exact layout are not reproduced.

## Excel and CSV

- **PDF to Excel:** [PDF to Excel](/tools/pdf-to-excel). Best on clean tables.
- **PDF to CSV:** [PDF to CSV](/tools/pdf-to-csv). Finds tables by looking for columns of text. Best effort.
- **Excel to PDF:** [Excel to PDF](/tools/excel-to-pdf). Prints values as tables with the header repeated per page. Colours, merged cells and charts are not copied.
- **CSV to PDF:** [CSV to PDF](/tools/csv-to-pdf).
- **Just look at a big file:** [CSV and Excel Viewer](/tools/spreadsheet-viewer).

## PowerPoint

- **PDF to PowerPoint:** [PDF to PowerPoint](/tools/pdf-to-pptx). One slide per page, as a picture, with page text in the notes. Not editable on the slide.
- **PowerPoint to PDF:** [PowerPoint to PDF](/tools/pptx-to-pdf). Places text boxes, fills and PNG or JPEG pictures. Themes, charts and animations are not carried over.

## Images

- **PDF to image:** [PDF to Image](/tools/pdf-to-img), also as [PDF to JPG](/tools/pdf-to-jpg) or [PDF to PNG](/tools/pdf-to-png). Each page becomes an image in a ZIP. Use PNG for sharp text and JPG for smaller photos.
- **Image to PDF:** [Image to PDF](/tools/img-to-pdf), including [JPG to PDF](/tools/jpg-to-pdf), [PNG to PDF](/tools/png-to-pdf), [HEIC to PDF](/tools/heic-to-pdf) and [SVG to PDF](/tools/svg-to-pdf). SVG is drawn as a picture, not kept as vector.

## Web, Markdown and text

- **PDF to HTML:** [PDF to HTML](/tools/pdf-to-html). Rebuilds headings, paragraphs and lists from text. Images and exact positions are not kept.
- **HTML to PDF:** [HTML to PDF](/tools/html-to-pdf). Uses the document structure. CSS is ignored.
- **PDF to Markdown:** [PDF to Markdown](/tools/pdf-to-md).
- **Markdown to PDF:** [Markdown to PDF](/tools/md-to-pdf). Supports GitHub-style tables, task lists, alerts, links and images.
- **PDF to text:** [PDF to Text](/tools/pdf-to-text).
- **Text to PDF:** [Text to PDF](/tools/txt-to-pdf).

## Scans and no text

If you cannot select text in a PDF, it is a picture. Run [OCR](/tools/ocr-pdf) before converting it to anything that needs text.

## Choosing quickly

- Need to edit text? Go to Word, and check the result.
- Need to keep the exact look? Go to images or PowerPoint slides.
- Need data? Go to CSV or Excel.
- Need to publish on the web? Go to HTML or Markdown.

## Privacy

Uploading documents to a converter site means trusting its storage and deletion. In-browser conversion has no upload, so there is nothing to trust. See [Is it safe to upload PDFs to online converters?](/articles/is-it-safe-to-upload-pdfs-to-online-converters)
`,
};

export default article;
