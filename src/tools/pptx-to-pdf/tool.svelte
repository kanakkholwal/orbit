<script lang="ts">
  import { FileConvert } from "$components/tool";
  import { pptxToPdf } from "./convert";

  async function convert(file: File, progress: (current: number, total: number) => void) {
    const { bytes, slides, skipped } = await pptxToPdf(file, progress);
    const note = skipped > 0 ? ` ${skipped} unsupported picture${skipped === 1 ? " was" : "s were"} skipped.` : "";
    return {
      blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
      name: file.name.replace(/\.pptx$/i, "") + ".pdf",
      summary: `${slides} ${slides === 1 ? "slide" : "slides"} converted.${note}`,
    };
  }
</script>

<FileConvert
  accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
  uploadTitle="Drop a PowerPoint to turn into a PDF"
  uploadDescription="One PDF page per slide, with text and pictures placed where they are on the slide."
  actionLabel="Convert to PDF"
  progressLabel="Converting slides"
  doneTitle="Your PDF is ready"
  notice="Orbit places each slide\'s text boxes, colour fills and PNG or JPG pictures. Themes, charts, SmartArt, animations, non-Latin text and exact fonts are not reproduced, so check the result. Older .ppt files are not supported; save them as .pptx first."
  convert={convert}
/>
