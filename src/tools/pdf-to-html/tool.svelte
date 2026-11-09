<script lang="ts">
  import { FileConvert } from "$components/tool";
  import { pdfToHtml } from "./convert";

  async function convert(file: File, progress: (current: number, total: number) => void) {
    const base = file.name.replace(/\.pdf$/i, "");
    const html = await pdfToHtml(file, base, progress);
    return { blob: new Blob([html], { type: "text/html;charset=utf-8" }), name: base + ".html" };
  }
</script>

<FileConvert
  accept=".pdf,application/pdf"
  uploadTitle="Drop a PDF to turn into HTML"
  uploadDescription="Text becomes headings, paragraphs and lists in one clean web page."
  actionLabel="Convert to HTML"
  progressLabel="Reading pages"
  doneTitle="Your HTML is ready"
  notice="This extracts text and rebuilds its structure from font sizes and spacing. Images, columns and exact positions are not kept. Scanned PDFs have no text to read; run OCR first."
  convert={convert}
/>
