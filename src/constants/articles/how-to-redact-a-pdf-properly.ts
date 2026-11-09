import type { Article } from "./index";

const article: Article = {
  slug: "how-to-redact-a-pdf-properly",
  title: "How to Redact a PDF Properly (A Black Box Is Not Enough)",
  description:
    "Drawing a black rectangle over text does not remove it. Learn how real PDF redaction works, how to do it, and how to check that the hidden text is really gone.",
  published: "2026-11-09",
  readingMinutes: 6,
  keywords: [
    "how to redact a pdf",
    "redact pdf permanently",
    "black out text in pdf",
    "remove sensitive information from pdf",
    "pdf redaction",
    "redact pdf free",
    "is redacted text recoverable",
  ],
  tools: ["redact-pdf", "pdf-privacy-check", "edit-metadata", "flatten-pdf"],
  body: `People black out names, account numbers and addresses before sharing a PDF, and then discover that the text can still be selected, copied or searched. This guide explains why that happens and how to redact a PDF so the hidden information is actually removed.

## Why a black box does not work

A PDF is made of layers. Text sits on one layer, and shapes or highlights sit on top of it. If you draw a black rectangle in a markup tool, you add a shape above the text. The text underneath is unchanged.

Anyone can then:

- Select the area and copy the text.
- Search the document for the hidden word.
- Delete the rectangle in an editor and read what was under it.

Several well-known leaks of sensitive documents have happened exactly this way. The fix is real redaction, which removes the text and replaces it with a solid mark.

## How to redact a PDF

1. Open [Redact PDF](/tools/redact-pdf) and drop in your file. The redaction toolbar opens.
2. Choose how to mark content. You can drag over an area, or select text and mark it.
3. Review each marked item. Marked items are not final yet, which gives you a chance to undo.
4. Apply the redactions. The marked content is removed and replaced with a black box.
5. Save the PDF.

Do not stop at step 3. Items that are only marked are not yet redacted.

## Check your work

Do not trust the screen. Test the saved file:

1. Open the redacted PDF and try to select and copy the area. Nothing should be selectable.
2. Use search to look for a word you redacted. It should find nothing.
3. Run [Privacy Check](/tools/pdf-privacy-check) to look for leftovers elsewhere in the file.

## What redaction does not cover

Redacting the visible page is only part of the job. A PDF can also carry:

- **Metadata.** Author, title, software and dates. See [what is hidden in your PDF](/articles/what-is-hidden-inside-a-pdf-metadata-and-privacy). Clean it with [Edit Metadata](/tools/edit-metadata).
- **Comments and annotations** that mention the redacted detail.
- **Attachments** embedded in the file.
- **Bookmarks and form fields** with the same text in them.
- **Earlier versions** if the file was saved incrementally.

## A safer habit

When a document is highly sensitive, save the final result as a flat copy, so no editable layers remain. [Flatten PDF](/tools/flatten-pdf) does this for form fields and annotations.

## A privacy note

Redaction tools that upload your file defeat the purpose, because you send the unredacted original to a stranger's server. Orbit redacts in your browser, so the original never leaves your device. Read more in [Is it safe to upload PDFs to online converters?](/articles/is-it-safe-to-upload-pdfs-to-online-converters)

This guide is general information, not legal advice. If a document is subject to legal rules about disclosure, follow the rules for your situation.
`,
};

export default article;
