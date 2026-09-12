import type { Article } from "./index";

const article: Article = {
  slug: "how-to-add-page-numbers-to-a-pdf",
  title: "How to Add Page Numbers to a PDF",
  description:
    "Add page numbers to a PDF in a few clicks: pick the position and style, skip the cover page, or build a custom footer like Page 3 of 12 with your own text.",
  published: "2026-09-10",
  readingMinutes: 5,
  keywords: [
    "add page numbers to pdf",
    "number pdf pages",
    "page x of y pdf",
    "pdf footer page numbers",
    "skip cover page numbering",
    "add header and footer to pdf",
  ],
  tools: ["add-page-no-pdf", "header-footer", "merge-pdf", "organize-pdf"],
  body: `Page numbers make a long document easier to read, discuss and print. "See page 14" beats "about two thirds of the way through". If your file was exported without them, or you have merged several documents into one, you can add page numbers to a PDF without going back to the original Word or design file. This guide covers the quick method and a more flexible one for custom headers and footers.

## Before you start: get the pages in order

Page numbers are stamped onto pages in their current order, so finish arranging first:

- **Combining files?** Merge them first with [Merge PDF](/tools/merge-pdf).
- **Pages in the wrong order?** Fix them in [Organize PDF](/tools/organize-pdf).
- **Unwanted pages?** Remove them with [Delete PDF Pages](/tools/delete-pages) or [Remove Blank Pages](/tools/remove-blank-pages).

If you number first and rearrange later, page 7 might end up in position 3.

## How to add page numbers to a PDF

1. Open [Add Page Numbers](/tools/add-page-no-pdf).
2. Drop in your PDF.
3. Choose a **Position**: top left, top centre, top right, bottom left, bottom centre or bottom right.
4. Choose a **Style**: plain numbers (1, 2, 3) or with the total (1 of 10).
5. Set **Start numbering on page**. Earlier pages, such as a cover or title page, are left without a number.
6. Adjust the **Size**, **Distance from edge** and **Colour** (black, grey, blue, or pick a custom colour).
7. Check the **Preview**.
8. Click the **Number** button. The numbered PDF downloads to your device.

The file is processed on your device and is not uploaded.

## Choosing the right settings

**Position.** Bottom centre is the most common choice for reports and essays. Bottom right (or top right) works well for documents people flip through quickly. If your pages already have a footer, such as a company address, put numbers at the top to avoid overlapping it.

**Style.** "1 of 10" is useful for documents where missing pages matter, such as contracts, exam papers and faxes, because the reader can tell if something is absent. Plain numbers look cleaner in books and reports.

**Distance from edge.** Home and office printers often cannot print right up to the edge of the paper. If you plan to print, keep the number a comfortable distance in from the edge.

**Colour.** Grey is less distracting than black on text-heavy pages. Use black if the document will be photocopied or faxed, since light grey can fade out.

### Skipping the cover page

If page 1 is a cover, set **Start numbering on page** to 2. The cover gets no number. Numbers still match each page's position in the file, so the first numbered page shows 2.

## Custom headers and footers

Sometimes a bare number is not enough. You might want "Confidential" on the left, "Page 3 of 12" in the middle and a date on the right. For that, use [Add Header & Footer](/tools/header-footer).

1. Open [Add Header & Footer](/tools/header-footer).
2. Drop in your PDF.
3. You will see a **Header** section and a **Footer** section, each with **Left**, **Centre** and **Right** text boxes. Fill in the ones you need and leave the rest empty.
4. To add numbering, insert the **Page number** and **Total pages** placeholders into any box. For example, typing "Page {page} of {total}" in the centre footer produces "Page 3 of 12" on page 3 of a 12 page file.
5. Choose **Text size** and **Colour**.
6. Under **Pages**, leave the box empty to apply the header and footer to every page, or type pages like 1-3, 5 to limit them.
7. Check the **Preview**, then click the **Add** button to save.

### Ideas for headers and footers

- **Reports:** company name in the header left, report title in the header right, "Page {page} of {total}" in the footer centre.
- **Legal and HR documents:** "Confidential" in the footer left and page numbers in the footer right.
- **Drafts:** "Draft, not for distribution" in the header centre. For a more obvious mark across the page, use [Add Watermark](/tools/add-watermark-pdf) instead.
- **Course packs:** module name and week number in the header.

## Common questions about numbering

**"My numbers overlap existing text."** Increase the distance from the edge, make the text smaller, or move the numbers to the other end of the page.

**"The PDF already has page numbers."** New numbers are added on top of the page, so the old ones remain. Choose a position where they do not clash, or crop out the old numbers first with [Crop PDF](/tools/crop-pdf) if they sit in the margin.

**"I want the page after the cover to be page 1."** Both tools number pages by their position in the file. A simple workaround is to number the pages without the cover, then put the cover back on with [Merge PDF](/tools/merge-pdf).

## FAQ

### Can I add page numbers without changing the rest of the document?

Yes. Numbers are added as a small layer of text on each page. Existing content, text and images are left as they are.

### Can I remove page numbers later?

Page numbers become part of the page once saved, so keep your original file if you might want a version without them.

### Will page numbers show when printed?

Yes, as long as they are not too close to the edge for your printer's margins.

### Can I number only some pages?

With Add Page Numbers, you can skip the first pages. With Add Header & Footer, you can type exactly which pages get the text.

### Is it free?

Yes. Both tools are free, need no account, and add no watermark.
`,
};

export default article;
