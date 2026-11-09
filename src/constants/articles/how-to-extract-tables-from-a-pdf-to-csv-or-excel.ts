import type { Article } from "./index";

const article: Article = {
  slug: "how-to-extract-tables-from-a-pdf-to-csv-or-excel",
  title: "How to Extract Tables From a PDF to CSV or Excel",
  description:
    "Copying a table out of a PDF usually ruins it. Learn the reliable ways to get PDF tables into CSV or Excel, including scanned PDFs, without uploading the file.",
  published: "2026-11-09",
  readingMinutes: 6,
  keywords: [
    "extract tables from pdf",
    "pdf table to csv",
    "pdf to excel table",
    "convert pdf table to spreadsheet",
    "copy table from pdf",
    "scanned pdf table to excel",
  ],
  tools: ["pdf-to-csv", "pdf-to-excel", "ocr-pdf", "spreadsheet-viewer"],
  body: `You select a table in a PDF, paste it into a spreadsheet, and get one long column of mixed text. A PDF does not store tables as tables. It stores pieces of text at positions on a page, and a table is only an arrangement the eye recognises. Getting a real table back means rebuilding the rows and columns from those positions.

## Step 1: find out what kind of PDF you have

- **A text PDF.** You can select and copy words in it. This is the easy case.
- **A scanned PDF.** The page is a picture. You cannot select the words. Run [OCR](/tools/ocr-pdf) first so the page gets a text layer, then continue. See [how to make a scanned PDF searchable](/articles/how-to-make-a-scanned-pdf-searchable-with-ocr).

## Step 2: pick the output you need

### To CSV

1. Open [PDF to CSV](/tools/pdf-to-csv).
2. Drop in the PDF and click **Extract tables**.
3. One table downloads as a .csv file. Several tables download as a ZIP with one CSV each.

### To Excel

Use [PDF to Excel](/tools/pdf-to-excel) when you want an .xlsx file with sheets.

Both work in your browser, so a financial statement or customer list is not uploaded anywhere.

## How the detection works

Lines of text that split into several columns, with gaps wider than a normal space, are treated as table rows. Two or more such lines in a row count as a table. This works well on clean, ruled statements, price lists and reports.

## Where it struggles

- **Merged cells and multi-line cells.** A cell that wraps onto two lines can be read as two rows.
- **Tables drawn as pictures.** Run OCR first.
- **Pages with several side-by-side tables or tight columns.** Results can merge columns.
- **Rotated pages.** Fix the rotation first with [Rotate PDF](/tools/rotate-pdf).

Always scan the result. Check the totals row against the PDF, and watch for numbers split across cells.

## Clean up the result

1. Open the CSV in the [CSV and Excel Viewer](/tools/spreadsheet-viewer). It shows the text exactly as stored, so leading zeros and long IDs are not changed.
2. Search and sort to spot oddities.
3. Fix problems in your spreadsheet app, then save.

A warning: spreadsheet apps can convert values on open, turning IDs like 00123 into 123 or codes into dates. If that matters, import the CSV with every column set to text.

## Going back

To print a spreadsheet as a clean PDF, use [Excel to PDF](/tools/excel-to-pdf) or [CSV to PDF](/tools/csv-to-pdf).
`,
};

export default article;
