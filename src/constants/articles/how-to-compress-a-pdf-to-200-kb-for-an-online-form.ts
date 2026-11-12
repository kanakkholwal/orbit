import type { Article } from "./index";

const article: Article = {
  slug: "how-to-compress-a-pdf-to-200-kb-for-an-online-form",
  title: "How to Compress a PDF to 200 KB (or Any Size) for an Online Form",
  description:
    "Portals often reject PDFs over 100 KB, 200 KB or 1 MB. Compress a PDF to a target size step by step on your own device, and learn which method suits scans and text.",
  published: "2026-11-12",
  readingMinutes: 5,
  keywords: [
    "compress pdf to 200kb",
    "compress pdf to 100kb",
    "reduce pdf size for form",
    "pdf under 1mb",
    "shrink pdf for upload",
    "compress pdf to size",
    "pdf size limit exceeded",
  ],
  tools: ["compress-pdf", "compress-pdf-to-200kb", "compress-pdf-to-100kb", "split-pdf"],
  body: `A job portal, a college form or a government site tells you the PDF must be under 200 KB, and yours is four megabytes. You do not need to guess at settings. Ask for the size you need and let the tool tighten compression until the file fits.

## Compress to a target size

1. Open [Compress PDF to 200 KB](/tools/compress-pdf-to-200kb), or [Compress PDF](/tools/compress-pdf) and switch on **Compress to a size**.
2. Add your PDF.
3. Choose a target such as 100 KB, 200 KB, 500 KB or 1 MB, or type your own value.
4. Press **Compress**.

Orbit tries each strength in turn. It starts with **Optimize**, which shrinks images and removes hidden data while keeping text selectable. If the file is still too big, it moves to **Flatten**, which turns each page into an image and compresses that. It stops at the first result under your limit. If nothing fits, the row turns red and says it is above the target.

## Which method suits which file

- **Text documents** shrink well with Optimize and stay searchable.
- **Scanned documents** are really photographs of pages, so they need image compression. Flatten works, and you lose the ability to select text unless you run [OCR](/tools/ocr-pdf) afterwards.
- **Image-heavy reports** usually need a stronger setting, since most of their size is pictures.

## When it will not go small enough

- Remove pages you do not need with [Delete Pages](/tools/delete-pages).
- Split a long file into parts with [Split PDF](/tools/split-pdf) if the portal allows several uploads.
- Check that the form's limit is per file and not per page.

## Keep a readable copy

Heavy compression makes small text blurry. After compressing, open the PDF and check that names, numbers and signatures are still legible. If not, raise the limit a little.

## Privacy

Forms ask for IDs, mark sheets and certificates. Orbit compresses them on your device, so the documents never reach a third-party server.`,
};

export default article;
