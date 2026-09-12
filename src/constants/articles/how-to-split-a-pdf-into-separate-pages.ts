import type { Article } from "./index";

const article: Article = {
  slug: "how-to-split-a-pdf-into-separate-pages",
  title: "How to Split a PDF Into Separate Pages",
  description:
    "Split a PDF into separate pages, pull out just the pages you need, or cut a long file into equal parts. Clear steps for each method, with no upload required.",
  published: "2026-09-02",
  readingMinutes: 5,
  keywords: [
    "split pdf into separate pages",
    "extract pages from pdf",
    "split pdf into multiple files",
    "save one page of a pdf",
    "separate pdf pages",
    "split pdf every page",
    "split large pdf",
  ],
  tools: ["split-pdf", "extract-pages", "delete-pages", "merge-pdf"],
  body: `A bank sends one PDF with twelve monthly statements. A scanner produces one file for a whole stack of different letters. A form wants only page 3 of your contract. In all of these cases you need to split a PDF into separate pages or smaller files. This guide covers the three common ways to do it, and which Orbit tool fits each one.

## Pick the right method

Before you start, decide what you actually want to end up with:

- **One new PDF containing only some pages** (for example pages 1 to 3 and 7). Use [Split PDF](/tools/split-pdf) with **Pick pages**.
- **Every page as its own PDF file.** Use [Extract PDF Pages](/tools/extract-pages).
- **A long PDF cut into equal chunks** (for example every 10 pages). Use [Split PDF](/tools/split-pdf) with **Every few pages**.

All three work on your own device, so the file is not uploaded. That matters when the PDF is a statement, a medical record or anything with personal details.

## How to pull out only the pages you need

This is the most common job: you have a long document and want a short one.

1. Open [Split PDF](/tools/split-pdf).
2. Drop in your PDF.
3. Under **How to split**, choose **Pick pages**.
4. Select pages in one of two ways:
   - Tap page thumbnails to select them.
   - Or type them in the **Page numbers** box, using commas and ranges, like 1-5, 8.
5. Check the summary on the right. It shows how many pages the file has now and how many will be in the new PDF.
6. Click the split button. A new PDF with just those pages downloads.

Your original file is not changed.

### Writing page ranges

Page ranges follow a simple pattern:

- **3** means page 3 only
- **2-6** means pages 2, 3, 4, 5 and 6
- **1, 4, 9** means those three pages
- **1-3, 10-12** combines two ranges

If you type a page that does not exist, the tool highlights it so you can fix it before continuing.

## How to split a PDF into separate pages

When you want every page (or a selection of pages) as individual files:

1. Open [Extract PDF Pages](/tools/extract-pages).
2. Drop in your PDF.
3. Choose the pages to extract. Tap pages in the grid, or type them in **Pages to keep**, like 1, 3-5, 8. To split the whole document, use **Select all**.
4. Click **Extract**.
5. You get **one ZIP file** containing **a PDF per page**.

Most computers open ZIP files with a double-click. On a phone, your files app can usually open them too.

### Tip: rename the files afterwards

Extracted files are named by page number. If each page is a different document, such as separate letters in one scan, rename them straight away while you still remember which is which.

## How to cut a long PDF into equal parts

This is useful for upload forms with a size or page limit, or for sharing a long scan in manageable pieces.

1. Open [Split PDF](/tools/split-pdf).
2. Drop in your PDF.
3. Under **How to split**, choose **Every few pages**.
4. Enter the number of **Pages in each file**. For example, a 50 page PDF split every 10 pages becomes 5 files.
5. Click the split button. The parts download together as a ZIP.

If the page count does not divide evenly, the last file simply contains the remaining pages.

## Related jobs

**Removing pages instead of keeping them.** If it is easier to say which pages you do not want, use [Delete PDF Pages](/tools/delete-pages).

**Rearranging pages.** To change the order without splitting, use [Organize PDF](/tools/organize-pdf) or reverse the whole file with [Reverse PDF Pages](/tools/reverse-pages).

**Putting pieces back together.** Split files can be recombined in any order with [Merge PDF](/tools/merge-pdf). See [how to merge PDF files without uploading](/articles/how-to-merge-pdf-files-without-uploading).

**Making a file smaller without losing pages.** If the goal is really to get under an email limit, compressing may be simpler than splitting. See [how to compress a PDF for email](/articles/how-to-compress-a-pdf-for-email).

## Common problems

**"The file will not open in the tool."** It may be password protected. If it is your file and you know the password, unlock it first with [Decrypt PDF](/tools/decrypt-pdf).

**"My split pages are huge."** Each page keeps the resources it needs, such as fonts and images, so a single page can be larger than you expect. Run the pages through [Compress PDF](/tools/compress-pdf) if that is a problem.

**"Pages are sideways."** Fix orientation with [Rotate PDF](/tools/rotate-pdf).

## FAQ

### Does splitting a PDF reduce quality?

No. Pages are copied into new files exactly as they are. Text stays selectable and images keep their quality.

### Can I split a PDF on my phone?

Yes. Open the tool in your mobile browser, tap to choose the file, and select pages by tapping thumbnails.

### What is the difference between Split PDF and Extract PDF Pages?

Split PDF's Pick pages mode makes one new PDF from the pages you choose. Extract PDF Pages makes a separate PDF for every chosen page and gives them to you in a ZIP.

### Is there a page limit?

Orbit does not set one. Very large files take longer because the work happens on your own device.

### Will bookmarks and links still work?

Page content is kept. Bookmarks that pointed to pages which are no longer in the file cannot be carried over, so add new ones with [Bookmark PDF](/tools/bookmark-pdf) if you need them.
`,
};

export default article;
