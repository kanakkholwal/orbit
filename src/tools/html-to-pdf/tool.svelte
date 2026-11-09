<script lang="ts">
  import { FileConvert } from "$components/tool";
  import { htmlToMarkdown } from "$utils/html-to-md";
  import { markdownToPdf } from "$utils/md-to-pdf";

  async function convert(file: File) {
    const base = file.name.replace(/\.(html?|xhtml)$/i, "");
    const bytes = await markdownToPdf(htmlToMarkdown(await file.text()), { title: base });
    return { blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), name: base + ".pdf" };
  }
</script>

<FileConvert
  accept=".html,.htm,.xhtml,text/html"
  uploadTitle="Drop an HTML file to turn into a PDF"
  uploadDescription="Headings, paragraphs, lists, links, code and tables become a clean PDF."
  actionLabel="Convert to PDF"
  progressLabel="Converting"
  doneTitle="Your PDF is ready"
  notice="This reads the document structure, not the styling. CSS, images, scripts and page layout are ignored, and web pages that need a server cannot be fetched by URL. Save the page as an .html file first."
  convert={convert}
/>
