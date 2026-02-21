<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    CheckCircle2,
    FileQuestion,
    FileText,
    Loader2,
    Search,
    Trash2,
    Zap,
  } from "@lucide/svelte";
  import { RemoveBlankPagesState } from "./helper.svelte";
  import PageThumbnail from "./PageThumbnail.svelte";

  const store = new RemoveBlankPagesState();
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
    <div class="max-w-4xl mx-auto space-y-8">
      <div
        class="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 max-w-xl mx-auto"
      >
        <h3
          class="text-sm font-semibold flex items-center gap-2 border-b border-border pb-3"
        >
          <Search size={16} class="text-primary" /> Detection Settings
        </h3>

        <div class="space-y-4">
          <div class="space-y-2">
            <div class="flex justify-between">
              <Label for="sensitivity">Sensitivity</Label>
              <span class="text-xs font-medium">{store.state.sensitivity}%</span
              >
            </div>
            <input
              id="sensitivity"
              type="range"
              min="0"
              max="100"
              step="5"
              bind:value={store.state.sensitivity}
              class="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
            <p class="text-[10px] text-muted-foreground">
              Higher sensitivity catches pages with tiny artifacts (like scan
              dust). Lower sensitivity only catches pure white pages.
            </p>
          </div>

          <Button
            variant="outline"
            class="w-full"
            onclick={() => store.detectBlankPages()}
            disabled={store.state.isDetecting || store.isProcessing}
          >
            {#if store.state.isDetecting}
              <Loader2 class="animate-spin mr-2" size={16} />
              {store.progress}
            {:else}
              <Search size={16} class="mr-2" /> Detect Blank Pages
            {/if}
          </Button>
        </div>
      </div>

      {#if store.state.hasPerformedDetection}
        <div
          class="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6"
        >
          <h3
            class="text-sm font-semibold flex items-center gap-2 border-b border-border pb-3"
          >
            <CheckCircle2 size={16} class="text-primary" /> Review Results
          </h3>

          {#if store.state.detectedPages.length === 0}
            <div
              class="flex flex-col items-center justify-center py-8 text-muted-foreground"
            >
              <FileQuestion size={32} class="mb-2 opacity-50" />
              <p class="text-sm font-medium">No blank pages detected.</p>
              <p class="text-xs">
                Try increasing the sensitivity if you think some were missed.
              </p>
            </div>
          {:else}
            <div
              class="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-lg text-sm mb-4"
            >
              Found <strong>{store.state.detectedPages.length}</strong> potentially
              blank page(s). Click on a thumbnail to unselect it if you want to keep
              it.
            </div>

            <div
              class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 bg-muted/30 p-4 rounded-lg border border-border max-h-100 overflow-y-auto"
            >
              {#each store.state.detectedPages as pageInfo (pageInfo.index)}
                <PageThumbnail {store} {pageInfo} />
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  {#if store.state.hasPerformedDetection && store.state.detectedPages.length > 0}
    <div class="border-t border-border p-4 text-center">
      <Button
        size="lg"
        variant="destructive"
        class="px-8 h-11 min-w-50"
        onclick={() => store.process()}
        disabled={store.isProcessing ||
          store.state.detectedPages.filter((p) => p.isSelected).length === 0}
      >
        {#if store.isProcessing}
          <Loader2 class="animate-spin mr-2" size={18} /> {store.progress}
        {:else}
          Remove Selected Pages <Zap size={18} class="ml-2 fill-current" />
        {/if}
      </Button>
    </div>
  {/if}
{/if}
