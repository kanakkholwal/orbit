<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconFileSpreadsheet as FileSpreadsheet,
    IconLoader2 as LoaderCircle,
    IconTableOptions as TableProperties,
  } from "@tabler/icons-svelte";
  import { PdfToExcelState } from "./helper.svelte";

  const store = new PdfToExcelState();
</script>

{#if !store.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files)}
  />
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar
      label={store.file.file.name}
      onReset={() => store.reset()}
      resetLabel="Clear"
    />

    <ToolPanel title="Source">
      <FileRow
        name={store.file.file.name}
        onRemove={() => store.reset()}
      >
        <span class="font-mono tabular-nums">
          {formatBytes(store.file.originalSize)}
        </span>
      </FileRow>
    </ToolPanel>

    <ToolPanel title="How it works">
      <div
        class="flex items-start gap-3 rounded-sm border border-border/60 bg-muted/20 px-4 py-3"
      >
        <span
          class="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary"
        >
          <TableProperties class="size-3.5" />
        </span>
        <p class="text-xs leading-relaxed text-muted-foreground">
          Scans the document for grid structures, then writes each detected
          table to its own sheet in an Excel (.xlsx) workbook.
        </p>
      </div>
    </ToolPanel>

    <ToolFooter
      hint={store.isProcessing ? store.progress.text : "Extract tables to Excel"}
    >
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.process()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progress.text}
        {:else}
          <FileSpreadsheet class="size-4" />
          Extract to Excel
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
