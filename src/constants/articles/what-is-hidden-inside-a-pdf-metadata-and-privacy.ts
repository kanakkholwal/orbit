import type { Article } from "./index";

const article: Article = {
  slug: "what-is-hidden-inside-a-pdf-metadata-and-privacy",
  title: "What Is Hidden Inside a PDF? Metadata, Comments and Attachments Explained",
  description:
    "A PDF can carry your name, software, edit dates, comments and attached files that you never see on the page. Learn what to check and how to clean a PDF before sharing it.",
  published: "2026-11-09",
  readingMinutes: 6,
  keywords: [
    "pdf metadata",
    "remove metadata from pdf",
    "hidden data in pdf",
    "pdf privacy check",
    "view pdf metadata",
    "pdf author name remove",
    "what is in a pdf file",
  ],
  tools: ["view-metadata", "edit-metadata", "pdf-privacy-check", "pdf-attachments", "remove-annotations", "flatten-pdf"],
  body: `The page you see is only part of a PDF. Behind it, the file can store information about who made it, when, with what software, and sometimes content that is invisible on screen. Before you send a PDF to a client, a landlord or the public, it is worth knowing what is in there.

## What a PDF can hide

### Document properties (metadata)

Almost every PDF stores a set of standard fields:

- **Title, Author, Subject and Keywords.**
- **Creator and Producer**, which name the app that made the file, for example a word processor and the library that exported it.
- **Creation and modification dates.**

These often reveal a real name from a user account, a company name, or the title of an earlier draft.

### Comments and annotations

Sticky notes, highlights, drawings and review comments are stored in the file and can be opened by anyone. Resolving or hiding a comment in a reader does not always remove it.

### Attachments

A PDF can contain other files: spreadsheets, images or invoices in XML form. They do not show on the page. Anyone who opens the attachments panel can read them.

### Form data

Fields you filled in keep their values. A field you cleared visually may still hold text.

### Hidden or old content

Text covered by a shape, layers that are switched off, and earlier saved states can remain. See [how to redact a PDF properly](/articles/how-to-redact-a-pdf-properly).

## How to check a PDF

1. Open [View Metadata](/tools/view-metadata) to see the properties of the file.
2. Run [Privacy Check](/tools/pdf-privacy-check) for a summary of what the file carries.
3. Open [PDF Attachments](/tools/pdf-attachments) to see embedded files.

All three work in your browser, so the file is not uploaded.

## How to clean a PDF before sharing

1. **Change or clear the properties** with [Edit Metadata](/tools/edit-metadata). Remove author names and anything you do not want public.
2. **Remove comments** with [Remove Annotations](/tools/remove-annotations).
3. **Remove attachments** you do not intend to share.
4. **Flatten the file** with [Flatten PDF](/tools/flatten-pdf) so form fields and annotations become part of the page and cannot be edited.
5. **Redact** anything sensitive on the page with [Redact PDF](/tools/redact-pdf).
6. Check the result again with the tools above.

## A quick checklist

- Does the Author field show a personal name?
- Is the Title still the name of an old draft?
- Are there comments or highlights left from a review?
- Are there attached files?
- Is any text covered by a box rather than removed?

## Why do this locally

If you upload a PDF to a website to clean it, you hand the original, with all its hidden data, to that site. Cleaning it in your browser keeps the original on your device. Read [Is it safe to upload PDFs to online converters?](/articles/is-it-safe-to-upload-pdfs-to-online-converters) for the reasoning.
`,
};

export default article;
