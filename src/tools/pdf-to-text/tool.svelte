<script lang="ts">
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    AlertTriangle,
    FileCode2,
    FileText,
    Loader2,
    Trash2, // Icon representing raw text/code
    Zap
  } from "@lucide/svelte";
  import { PdfToTextState } from "./helper.svelte";

  const store = new PdfToTextState();
  let uploadArea: ReturnType<typeof UploadArea>;
</script>

<UploadArea
  bind:this={uploadArea}
  accept=".pdf"
  multiple={true}
  onFilesSelected={(files) => store.addFiles(files)}
  class={store.files.length > 0 ? "hidden" : ""}
/>
{#if store.files.length > 0}
  <div class="sticky top-0 z-20 border-b border-border bg-accent/50 p-4 rounded-lg">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-sm font-semibold flex items-center gap-2">
        <FileCode2 size={18} class="text-primary" />
        {store.files.length} Document{store.files.length > 1 ? "s" : ""} Selected
      </h2>
      <div class="flex items-center gap-2">
        <Button variant="ghost" onclick={() => uploadArea.click()} disabled={store.isProcessing}>
          <Zap size={16} /> Add More
        </Button>
        <Button variant="ghost" onclick={() => store.reset()} disabled={store.isProcessing}>
          <Trash2 size={16} /> Clear All
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-6 space-y-8">
    <div class="max-w-3xl mx-auto space-y-6">
      
      <div class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-sm flex gap-3 text-amber-600 dark:text-amber-400">
        <AlertTriangle size={20} class="shrink-0 mt-0.5" />
        <div class="text-sm leading-relaxed">
            <strong>Note:</strong> This tool works ONLY with digitally created PDFs. If your PDF is a scanned image or photograph, it contains no digital text layer. For scanned documents, please use the <a href="/tools/ocr-pdf" class="underline font-semibold hover:text-amber-500">OCR PDF tool</a> instead.
        </div>
      </div>

      <div class="grid gap-3">
        {#each store.files as file (file.id)}
          <div class="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-xs transition-colors hover:border-primary/30">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="bg-primary/10 text-primary p-2 rounded-md shrink-0">
                  <FileText size={20} />
              </div>
              <div class="min-w-0">
                <div class="truncate font-medium text-sm">{file.file.name}</div>
                <div class="text-xs text-muted-foreground">{formatBytes(file.originalSize)}</div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 ml-2"
              onclick={() => store.removeFile(file.id)}
              disabled={store.isProcessing}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        {/each}
      </div>

    
    </div>
  </div>

  <div class="border-t border-border p-4 text-center">
    <Button
      size="lg"
      variant="dark"
      class="px-8 h-11 min-w-50"
      onclick={() => store.process()}
      disabled={store.isProcessing || store.files.length === 0}
    >
      {#if store.isProcessing}
        <Loader2 class="animate-spin mr-2" size={18} /> {store.progress.text}
      {:else}
        Extract Text <Zap size={18} class="ml-2 fill-current" />
      {/if}
    </Button>
  </div>
{/if}