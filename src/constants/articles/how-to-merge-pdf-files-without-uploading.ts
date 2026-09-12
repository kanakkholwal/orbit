import type { Article } from "./index";

const article: Article = {
  slug: "how-to-merge-pdf-files-without-uploading",
  title: "How to Merge PDF Files Without Uploading Them",
  description:
    "Combine several PDFs into one file on your own computer. Step-by-step guide to merging PDFs privately, reordering pages and keeping file sizes sensible.",
  published: "2026-08-04",
  readingMinutes: 5,
  keywords: [
    "merge pdf without uploading",
    "combine pdf files offline",
    "merge pdf privately",
    "join pdf files",
    "combine pdfs into one",
    "merge pdf free no sign up",
    "reorder pages when merging pdf",
  ],
  tools: ["merge-pdf", "organize-pdf", "compress-pdf", "delete-pages"],
  body: `If you want to merge PDF files without uploading them anywhere, you can do it entirely on your own device. This guide shows how to combine several PDFs into one, put the pages in the right order, and end up with a single tidy file, all without sending your documents to a server.

## Why merge PDFs locally?

The usual reason people merge PDFs is practical: a job application that wants one attachment, a set of scanned receipts for an expense claim, or chapters of a report that were exported separately. The documents involved are often personal. Think bank statements, ID scans, contracts and medical letters.

Many online PDF tools work by uploading your files to their servers, doing the work there, and sending the result back. That can be perfectly fine for a restaurant menu. It feels different for a passport scan. Merging locally means the files are read and joined by your browser or a desktop app, and they never travel over the internet.

[Orbit's Merge PDF tool](/tools/merge-pdf) works this way. It runs in your browser (or in the Orbit desktop app for Windows, macOS and Linux), there is no account to create, and it does not add a watermark.

## How to merge PDF files without uploading

1. Open [Merge PDF](/tools/merge-pdf).
2. Drag your PDFs onto the drop area, or click it to pick files. You can select several at once.
3. Check the order. Files are joined top to bottom. Drag a row, or use the arrow buttons, to move a file up or down.
4. Need more files? Click **Add files** and pick them. They join the list.
5. Type a name for the result in the **File name** box on the right, so you do not end up with a folder full of files called "merged".
6. Click the **Merge** button at the bottom. The combined PDF downloads to your device.

That is it. If something looks wrong, click **Start over**, or fix the order and merge again.

## Merging specific pages instead of whole files

Sometimes you only want part of a document, such as the signature page from a contract or the first two pages of a statement. The merge tool has two modes, shown as **Files** and **Pages** at the top.

- **Files mode** joins whole documents in the order you set. You can also limit each file to a page range if you only need some of it.
- **Pages mode** shows every page from every file as a thumbnail. Drag pages into any order you like, and remove the ones you do not want. Removed pages are simply left out of the merged file.

Pages mode is handy when you need to interleave documents, for example putting each receipt right after the matching line of an expense form.

## Tips for a clean merged PDF

**Name your files before you start.** If your files are called "scan001.pdf" and "scan002.pdf", renaming them to something like "01 cover letter" and "02 CV" makes it much easier to spot mistakes in the order.

**Check for blank or duplicate pages.** Scanners often produce empty backs of pages. You can remove them afterwards with [Remove Blank Pages](/tools/remove-blank-pages), or delete specific pages with [Delete Pages](/tools/delete-pages).

**Fix sideways pages.** If a scanned page came out rotated, use [Rotate PDF](/tools/rotate-pdf) on the merged file, or rearrange and tidy everything in [Organize PDF](/tools/organize-pdf).

**Watch the file size.** A merged file is roughly the size of all the originals added together. If the result is too big to email, run it through [Compress PDF](/tools/compress-pdf). There is a full guide on [compressing a PDF for email](/articles/how-to-compress-a-pdf-for-email).

**Mixed page sizes are normal.** If you merge an A4 letter with a US Letter form, each page keeps its own size. Most people never notice, but if you need every page to match, try [Fix Page Size](/tools/fix-page-size).

## What about password-protected PDFs?

A PDF that needs a password to open cannot be combined until it is unlocked. If it is your file and you know the password, you can save an unlocked copy first with [Decrypt PDF](/tools/decrypt-pdf), then merge. Our guide on [removing a password from a PDF](/articles/how-to-remove-a-password-from-a-pdf) explains the difference between the two kinds of PDF password.

## How to check that nothing is uploaded

You do not have to take anyone's word for it. In a desktop browser, open the developer tools (usually F12, or right-click and choose Inspect), switch to the **Network** tab, then merge your files. You will see the page's own files loading, but no request carrying your PDF to a server. If you prefer, the [Orbit desktop app](/download) does the same job as a regular installed program. We cover this check in more detail in [is it safe to upload PDFs to online converters?](/articles/is-it-safe-to-upload-pdfs-to-online-converters)

## Merging on a phone

The web version of Orbit works in mobile browsers too. Tap the drop area to pick files from your phone's storage or cloud drive app, then follow the same steps. Very large files are slower on a phone because all the work happens on the device itself.

## FAQ

### Is there a limit on how many PDFs I can merge?

Orbit does not set a file count or size limit. The practical limit is your device's memory, so hundreds of large scans may be slow on an older laptop or phone.

### Will merging reduce the quality of my PDF?

No. Merging copies the existing pages into a new file. Text stays selectable and images keep their original quality. Quality only changes if you compress the result afterwards.

### Do links and bookmarks survive a merge?

Page content always comes across. Some extras, such as the original files' bookmarks, may not be kept. If you need a navigable outline, add one to the merged file with [Bookmark PDF](/tools/bookmark-pdf).

### Can I merge Word documents or images?

Merge PDF works with PDFs. Turn photos into a PDF first with [Image to PDF](/tools/img-to-pdf), then merge. Word files can be saved as PDF from Word itself (File, then Save As or Export).

### Do I need to install anything?

No. The web app runs in any modern browser. The desktop app is optional, for people who prefer an installed program.
`,
};

export default article;
