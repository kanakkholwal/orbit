<script lang="ts">
  import { FileConvert } from "$components/tool";
  import { findTables, tablesToFile } from "./convert";

  async function convert(file: File, progress: (current: number, total: number) => void) {
    const tables = await findTables(file, progress);
    if (tables.length === 0) throw new Error("No tables were found. This works on PDFs with selectable text laid out in columns.");
    const base = file.name.replace(/\.pdf$/i, "");
    const out = await tablesToFile(tables, base);
    return { ...out, summary: `${tables.length} ${tables.length === 1 ? "table" : "tables"} found.` };
  }
</script>

<FileConvert
  accept=".pdf,application/pdf"
  uploadTitle="Drop a PDF to pull tables into CSV"
  uploadDescription="Rows of columns of text become CSV you can open in Excel or Sheets."
  actionLabel="Extract tables"
  progressLabel="Reading pages"
  doneTitle="Your tables are ready"
  notice="Tables are found by looking for lines of text split into columns, so results are best effort. Merged cells and tables drawn as images are not detected. One table downloads as a CSV file, several as a ZIP."
  convert={convert}
/>
