import type { Article } from "./index";

const article: Article = {
  slug: "how-to-compress-a-pdf-for-email",
  title: "How to Compress a PDF for Email (Without Ruining It)",
  description:
    "PDF too big to attach? Learn how to compress a PDF for email, which settings to pick, what compression trades away, and what to do if it is still too large.",
  published: "2026-08-08",
  readingMinutes: 5,
  keywords: [
    "compress pdf for email",
    "reduce pdf file size",
    "pdf too large to email",
    "shrink pdf",
    "make pdf smaller",
    "email attachment size limit",
    "compress pdf without losing quality",
    "compress scanned pdf",
  ],
  tools: ["compress-pdf", "split-pdf", "delete-pages", "remove-annotations"],
  body: `You have written the email, added the PDF, and the attachment bounces back as too large. The fix is to compress a PDF for email: make the file smaller so it fits, while keeping it readable. This guide explains how to do that, what you give up in the process, and what to try when compression alone is not enough.

## Why email rejects large PDFs

Every email service caps the size of a message. The exact number depends on your provider and on the recipient's provider, and the stricter of the two wins. Many common services sit somewhere in the range of a few tens of megabytes per message, and some workplaces set lower limits of their own.

There is also a hidden overhead. Attachments are encoded into text before they are sent, which makes them roughly a third bigger in transit. So a file that looks just under the limit on your computer can still be rejected. As a rule of thumb, aim for a PDF comfortably below your provider's limit, and much smaller if you are sending to a company or government inbox you know nothing about.

## What makes a PDF big in the first place

Most of a PDF's size usually comes from images. A scanned document is really a stack of photographs, one per page. A report exported from a design app may contain full-resolution photos that are only shown at thumbnail size. Embedded fonts, hidden editing history and metadata add a little more.

Plain text is tiny. A 200 page novel with no pictures can be smaller than a single phone photo.

## How to compress a PDF for email

1. Open [Compress PDF](/tools/compress-pdf).
2. Drop in your PDF. You can add several files at once and compress them together.
3. On the right, choose a **Method**:
   - **Optimize** shrinks images and removes hidden data. Text stays selectable and searchable. This is the right choice for most documents.
   - **Flatten** turns each page into an image. It can work well for scans, but text in the result can no longer be selected or searched.
4. Pick a **Strength**: Light, Balanced, Strong or Maximum. Start with **Balanced**.
5. Optionally switch on the extras (these apply to Optimize): **Remove metadata**, **Trim fonts** (keeps only the characters the document actually uses) and **Black and white** for an even smaller file.
6. Click **Compress**. Each file shows its old and new size, and the results download to your device.

The file is processed inside your browser or the Orbit desktop app. It is not uploaded, which matters when the PDF is a payslip, a contract or a medical form.

## What compression trades off

Compression is not magic. The file gets smaller because something is removed or simplified. Here is what each choice costs.

**Image sharpness.** Stronger settings lower the resolution and quality of images. Photos start to look soft, and small print inside scanned pages can blur. Light and Balanced are usually invisible at normal zoom. Strong and Maximum are for when size matters more than looks.

**Colour.** Black and white makes a big difference on scans, but charts, signatures in blue ink and colour photos lose meaning.

**Selectable text.** Flatten turns every page into a picture. Your recipient cannot copy text, and screen readers cannot read it. Avoid Flatten for anything that needs to be accessible or searchable.

**Metadata.** Removing metadata strips the author name, title and editing history. That is often a bonus for privacy, but some organisations rely on the title field.

A sensible approach is to try Balanced first, open the result, and zoom in on the smallest text. If it is still readable and the size fits, you are done.

## When the result barely shrinks

Sometimes Orbit reports that a file was already well optimised. That happens with PDFs that are mostly text, or that were already compressed by the app that made them. Pushing the strength higher will not help much. Try these instead:

- **Remove pages you do not need.** Cover pages, blank pages and appendices add up. Use [Delete Pages](/tools/delete-pages) or [Remove Blank Pages](/tools/remove-blank-pages).
- **Remove annotations.** Heavy comment threads and stamps can add weight. [Remove Annotations](/tools/remove-annotations) clears them.
- **Split the file.** Send it in two or three emails using [Split PDF](/tools/split-pdf). See [how to split a PDF into separate pages](/articles/how-to-split-a-pdf-into-separate-pages).
- **Rescan at a lower resolution.** If you control the scanner, a lower resolution setting (and greyscale for text documents) produces much smaller files from the start.

## When not to compress

Do not compress files headed to a professional printer, legal filings that must match an original exactly, or documents with a digital signature. Changing a digitally signed PDF invalidates the signature. Compress first, then sign. Our guide on [how to sign a PDF for free](/articles/how-to-sign-a-pdf-for-free) explains the difference between signature types.

## Alternatives to attaching

If the file must stay at full quality, consider sharing it through a cloud storage link instead of attaching it. That moves the file onto that storage provider's servers, so it is a trade between convenience and control that is worth making consciously.

## FAQ

### Will compressing a PDF make the text blurry?

With the Optimize method, real text stays sharp because it is stored as text, not pixels. Only images are affected. Text inside scanned pages is part of an image, so it can soften at Strong or Maximum.

### Can I compress several PDFs at once?

Yes. Drop in as many as you like and they are compressed with the same settings.

### Is it safe to compress a confidential PDF online?

It depends on where the processing happens. Orbit compresses on your device and does not upload the file. For a longer look at the question, read [is it safe to upload PDFs to online converters?](/articles/is-it-safe-to-upload-pdfs-to-online-converters)

### Why is my compressed file bigger than the original?

It can happen with files that were already heavily optimised. Orbit shows the before and after sizes, so simply keep the original if the new one is not smaller.

### Does compression remove a password?

No. Compress PDF needs to open the file, so unlock it first if you own it. See [how to remove a password from a PDF](/articles/how-to-remove-a-password-from-a-pdf).
`,
};

export default article;
