<script lang="ts">
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    FileText,
    Loader2,
    MessageSquareOff,
    Trash2,
    Zap,
  } from "@lucide/svelte";
  import { RemoveAnnotationsState } from "./helper.svelte";

  const store = new RemoveAnnotationsState();
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    onFilesSelected={(files) => store.loadFile(files)}
  />
{:else}
  <div
    class="sticky top-0 z-20 border-b border-border bg-accent/50 p-4 rounded-lg"
  >
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-sm font-semibold flex items-center gap-2">
        <FileText size={18} class="text-primary" />
        {store.state.file.name}
        <span class="text-xs font-normal text-muted-foreground ml-2">
          {formatBytes(store.state.originalSize)} • {store.state.pageCount} Pages
        </span>
      </h2>
      <div class="flex items-center gap-2">
        <Button variant="ghost" onclick={() => store.reset()}>
          <Trash2 size={16} /> Clear
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-6 space-y-8">
    <div class="max-w-xl mx-auto space-y-8">
      <div
        class="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col items-center text-center space-y-4"
      >
        <div
          class="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2"
        >
          <MessageSquareOff size={32} />
        </div>

        <h3 class="text-lg font-semibold">Ready to Strip Annotations</h3>

        <p class="text-sm text-muted-foreground leading-relaxed max-w-md">
          Clicking the button below will permanently remove all comments,
          highlights, stamps, and interactive form fields from your PDF
          document.
        </p>
      </div>
    </div>
  </div>

  <div class="border-t border-border p-4 text-center">
    <Button
      size="lg"
      variant="destructive"
      class="px-8 h-11 min-w-50"
      onclick={() => store.process()}
      disabled={store.isProcessing}
    >
      {#if store.isProcessing}
        <Loader2 class="animate-spin mr-2" size={18} /> Processing...
      {:else}
        Remove All Annotations <Zap size={18} class="ml-2 fill-current" />
      {/if}
    </Button>
  </div>
{/if}
