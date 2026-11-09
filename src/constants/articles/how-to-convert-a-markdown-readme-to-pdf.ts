import type { Article } from "./index";

const article: Article = {
  slug: "how-to-convert-a-markdown-readme-to-pdf",
  title: "How to Convert a Markdown README to PDF (GitHub Tables, Links and Badges)",
  description:
    "Turn a GitHub-style Markdown file into a clean PDF in your browser. Tables, task lists, alerts, links and images are supported, and nothing is uploaded.",
  published: "2026-11-09",
  readingMinutes: 5,
  keywords: [
    "markdown to pdf",
    "readme to pdf",
    "github markdown to pdf",
    "convert md to pdf online",
    "markdown to pdf with tables",
    "markdown to pdf no upload",
  ],
  tools: ["md-to-pdf", "pdf-to-md", "html-to-pdf", "txt-to-pdf"],
  body: `Markdown is the format of READMEs, notes and documentation. Sooner or later you need to hand one to someone who wants a PDF: a client, a teacher, a reviewer. You can convert it in your browser without installing anything.

## Convert a Markdown file

1. Open [Markdown to PDF](/tools/md-to-pdf).
2. Paste your Markdown, or choose **Open a file** and pick a .md file.
3. Click **Create PDF**.

The PDF downloads. Your text is not uploaded.

## What is supported

The converter follows GitHub-flavoured Markdown:

- Headings, paragraphs, bold, italic and strikethrough.
- Ordered, unordered and nested lists, and task lists with checkboxes.
- Tables, including column alignment.
- Fenced code blocks and inline code.
- Blockquotes and GitHub alerts such as NOTE, TIP, WARNING and CAUTION.
- Links, which stay clickable, and plain URLs that turn into links.
- Images from the web or embedded in the file, including badges.
- Raw HTML blocks such as details, summary and centred paragraphs, converted to their Markdown equivalent.
- Non-Latin text such as Cyrillic, Hindi, Chinese, Japanese and Korean, using a downloaded font.

## What to expect

- **Emoji.** Shortcodes such as :warning: become short text like (!). Real emoji characters are removed, because PDF fonts cannot draw them.
- **Code colours.** Code blocks are monospaced but not syntax-coloured.
- **Not supported:** footnotes, math written with dollar signs, and diagrams such as Mermaid.
- **Images.** A picture is embedded only if its server allows the browser to fetch it. If not, its alt text is shown instead.

## Tips for a README that prints well

- Keep tables narrow. Very wide tables shrink their text.
- Put a short alt text on every image so a failed picture still reads sensibly.
- Use real headings instead of bold lines, so the structure is clear.

## Going from PDF to Markdown

To turn a PDF into editable Markdown, use [PDF to Markdown](/tools/pdf-to-md). It rebuilds headings and lists from the text, and scanned PDFs need [OCR](/tools/ocr-pdf) first.

## Other text formats

- Plain text: [Text to PDF](/tools/txt-to-pdf).
- A saved web page: [HTML to PDF](/tools/html-to-pdf).
- Word documents: [Word to PDF](/tools/word-to-pdf).
`,
};

export default article;
