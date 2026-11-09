<script lang="ts">
  import { FileConvert } from "$components/tool";
  import mammoth from "mammoth";
  import { htmlToMarkdown } from "$utils/html-to-md";
  import { markdownToPdf } from "$utils/md-to-pdf";

  async function convert(file: File) {
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    const bytes = await markdownToPdf(htmlToMarkdown(html), { title: file.name.replace(/\.docx$/i, "") });
    return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), name: file.name.replace(/\.docx$/i, "") + ".pdf" };
  }
</script>

<FileConvert
  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  uploadTitle="Drop a Word document to turn into a PDF"
  uploadDescription="Headings, paragraphs, lists and tables are kept. Nothing is uploaded."
  actionLabel="Convert to PDF"
  progressLabel="Converting"
  doneTitle="Your PDF is ready"
  notice="Orbit reads the text, headings, lists and tables from a .docx file. Images, text boxes, page headers and exact fonts are not copied, and the layout is rebuilt rather than reproduced. Older .doc files are not supported; save them as .docx first."
  convert={convert}
/>
