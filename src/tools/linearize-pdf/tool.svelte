<script lang="ts">
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    FastForward,
    FileText,
    Info,
    Loader2,
    Plus,
    Trash2,
    Zap
  } from "@lucide/svelte";
  import { LinearizePdfState } from "./helper.svelte";

  const store = new LinearizePdfState();
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
        <FastForward size={18} class="text-primary" />
        {store.files.length} Document{store.files.length > 1 ? "s" : ""} Selected
      </h2>
      <div class="flex items-center gap-2">
        <Button variant="ghost" onclick={() => uploadArea.click()} disabled={store.isProcessing}>
          <Plus size={16} /> Add More
        </Button>
        <Button variant="ghost" onclick={() => store.reset()} disabled={store.isProcessing}>
          <Trash2 size={16} /> Clear All
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-6 space-y-8">
    <div class="max-w-3xl mx-auto space-y-6">
      
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

     

      <div class="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5 shadow-sm space-y-3">
        <h3 class="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2 text-sm">
            <Info size={16} /> What is linearization?
        </h3>
        <ul class="text-xs text-blue-600/90 dark:text-blue-400/90 space-y-1.5 list-disc list-inside ml-1">
          <li>Optimizes internal PDF structure for the web.</li>
          <li>Enables progressive loading (the first page displays immediately while the rest downloads).</li>
          <li>Drastically improves user experience for large PDFs hosted online.</li>
          <li>Commonly known as "Fast Web View".</li>
        </ul>
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
        Linearize PDF(s) <Zap size={18} class="ml-2 fill-current" />
      {/if}
    </Button>
  </div>
{/if}