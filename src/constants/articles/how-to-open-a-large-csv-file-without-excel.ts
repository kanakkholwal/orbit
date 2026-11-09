import type { Article } from "./index";

const article: Article = {
  slug: "how-to-open-a-large-csv-file-without-excel",
  title: "How to Open a Large CSV File Without Excel (Even With 100,000 Rows)",
  description:
    "Excel stops at 1,048,576 rows and often freezes before that. Open, search and sort large CSV and Excel files in your browser with a fast grid, and export what you need.",
  published: "2026-11-09",
  readingMinutes: 5,
  keywords: [
    "open large csv file",
    "csv viewer online",
    "open csv without excel",
    "view big csv in browser",
    "csv file too large for excel",
    "search large csv",
    "xlsx viewer online",
  ],
  tools: ["spreadsheet-viewer", "csv-to-pdf", "pdf-to-csv", "pdf-to-excel"],
  body: `You double-click a CSV file and Excel hangs, or opens with a warning that some data was not loaded. This is a common problem, and it has simple causes and simple fixes.

## Why Excel struggles with big CSV files

- **A hard row limit.** An Excel worksheet holds at most 1,048,576 rows and 16,384 columns. Anything beyond that is cut off.
- **Everything loads at once.** Excel reads the whole file, formats it and keeps it in memory. A file with hundreds of thousands of rows can take a long time and a lot of memory.
- **Guessing types.** Excel tries to turn values into dates and numbers, which can change IDs like 00123 into 123 or turn a gene name into a date.

If you only need to look at the data, search it and maybe export part of it, you do not need Excel to load all of it.

## Open it in your browser

1. Open the [CSV and Excel Viewer](/tools/spreadsheet-viewer).
2. Drop in a .csv, .tsv, .xlsx, .xls or .ods file.
3. Scroll. Only the rows on screen are drawn, so tens of thousands of rows stay smooth.

The file is read on your device. It is not uploaded.

## What you can do with it

- **Search.** Type in the search box to keep only rows that contain your text, in any column.
- **Sort.** Click a column header to sort ascending, again for descending, and a third time to clear. Numbers sort as numbers, not as text.
- **Switch sheets.** Excel files with several sheets show a chip for each one.
- **Treat the first row as data.** Turn off the header row switch if your file has no column names.
- **Copy a cell.** Click a cell and press Ctrl or Cmd plus C.
- **Export what you see.** After searching or sorting, export the result as a new CSV.

## Tips for very large files

- Close other heavy tabs first. A browser tab can only use so much memory, and phones have much less than computers.
- If the file has millions of rows, search for what you need and export that slice rather than scrolling.
- Delimiters are detected for you. Comma, semicolon, tab and pipe are all supported.

## Turn a spreadsheet into a PDF or back

- To print a table, use [Excel to PDF](/tools/excel-to-pdf) or [CSV to PDF](/tools/csv-to-pdf). The header row repeats on every page.
- To pull tables out of a PDF, use [PDF to CSV](/tools/pdf-to-csv) or [PDF to Excel](/tools/pdf-to-excel).

## A note on accuracy

The viewer shows text exactly as stored. It does not guess types, so leading zeros stay. It does not run formulas; for Excel files you see the stored results.
`,
};

export default article;
