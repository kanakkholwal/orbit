<script lang="ts">
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    FileSpreadsheet,
    FileText,
    Loader2,
    TableProperties,
    Trash2,
    Zap
  } from "@lucide/svelte";
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
  <div class="sticky top-0 z-20 border-b border-border bg-accent/50 p-4 rounded-lg">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-sm font-semibold flex items-center gap-2">
        <FileText size={18} class="text-primary" />
        File Selected
      </h2>
      <div class="flex items-center gap-2">
        <Button variant="ghost" onclick={() => store.reset()}>
          <Trash2 size={16} /> Clear
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-6 space-y-8">
    <div class="max-w-2xl mx-auto space-y-6">
      
      <div class="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
        <div class="flex items-center gap-4 min-w-0 flex-1">
          <div class="bg-green-500/10 text-green-600 p-3 rounded-lg shrink-0">
              <TableProperties size={24} />
          </div>
          <div class="min-w-0">
            <div class="truncate font-semibold text-foreground">{store.file.file.name}</div>
            <div class="text-sm text-muted-foreground mt-0.5">{formatBytes(store.file.originalSize)}</div>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-blue-500/10 border border-blue-500/20 p-5 text-sm text-blue-700 dark:text-blue-400 leading-relaxed shadow-sm">
        <p class="font-semibold mb-2 flex items-center gap-2">
            <Zap size={16} class="fill-current" /> How this works
        </p>
        <p>This tool scans your PDF to detect grid structures and tabular data. If tables are found, it extracts them and places each table on a separate sheet in an Excel (.xlsx) workbook.</p>
      </div>

    </div>
  </div>

  <div class="border-t border-border p-4 text-center">
    <Button
      size="lg"
      variant="dark"
      class="px-8 h-11 min-w-50"
      onclick={() => store.process()}
      disabled={store.isProcessing}
    >
      {#if store.isProcessing}
        <Loader2 class="animate-spin mr-2" size={18} /> {store.progress.text}
      {:else}
        Extract to Excel <FileSpreadsheet size={18} class="ml-2" />
      {/if}
    </Button>
  </div>
{/if}