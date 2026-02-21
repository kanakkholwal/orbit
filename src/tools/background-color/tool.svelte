<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import { FileText, Loader2, PaintBucket, Trash2, Zap } from "@lucide/svelte";
  import { BackgroundColorState } from "./helper.svelte";

  const store = new BackgroundColorState();
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
    <div class="max-w-md mx-auto space-y-8">
      <div
        class="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6"
      >
        <h3
          class="text-sm font-semibold flex items-center gap-2 border-b border-border pb-3"
        >
          <PaintBucket size={16} class="text-primary" /> Background Options
        </h3>

        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="page-range">Pages to Color</Label>
            <Input
              id="page-range"
              type="text"
              placeholder="e.g. 1-3, 5, or leave blank for all"
              bind:value={store.state.pageRange}
            />
            <p class="text-[10px] text-muted-foreground">
              Specify which pages should receive the background color.
            </p>
          </div>

          <div class="space-y-2">
            <Label for="bg-color">Background Color</Label>
            <div class="flex items-center gap-3">
              <Input
                id="bg-color"
                type="color"
                class="w-20 p-1 cursor-pointer h-12"
                bind:value={store.state.colorHex}
              />
              <div class="flex flex-col">
                <span class="text-sm font-mono uppercase font-medium"
                  >{store.state.colorHex}</span
                >
                <span class="text-xs text-muted-foreground"
                  >Click the swatch to select a color</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="rounded-lg bg-blue-500/10 p-4 text-xs text-blue-600 dark:text-blue-400 leading-relaxed"
      >
        <p>
          <strong>How it works:</strong> Most PDF pages have a transparent background.
          This tool creates a solid color layer and places your existing document
          on top of it. Scanned documents or pages that already have a solid white
          background image embedded will block the new color.
        </p>
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
        <Loader2 class="animate-spin mr-2" size={18} /> Processing...
      {:else}
        Apply Background Color <Zap size={18} class="ml-2 fill-current" />
      {/if}
    </Button>
  </div>
{/if}
