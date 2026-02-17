<script lang="ts">
  import UploadArea from "$components/ui/UploadArea.svelte";
  import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Crop,
    Loader2,
    Trash2,
  } from "@lucide/svelte";
  import CropperCanvas from "./CropperCanvas.svelte";
  import { CropPdfState } from "./helper.svelte";

  const store = new CropPdfState();
</script>

<div class="h-full w-full">
  {#if !store.state.file}
    <UploadArea
      accept=".pdf"
      multiple={false}
      onFilesSelected={(files) => store.loadFile(files[0])}
    />
  {:else}
    <div class="flex flex-col h-full">
      <div
        class="border-b border-border bg-background/50 p-4 backdrop-blur-sm sticky top-0 z-20"
      >
        <div
          class="mx-auto max-w-4xl flex flex-wrap items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"
            >
              <Crop size={18} />
            </div>
            <div class="hidden sm:block">
              <h3 class="text-sm font-medium">{store.state.file.name}</h3>
              <p class="text-[10px] text-muted-foreground">
                {store.state.pageCount} Pages
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
            <button
              disabled={store.state.currentPage <= 1}
              onclick={() => store.setPage(store.state.currentPage - 1)}
              class="p-1 rounded-md hover:bg-background disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span class="text-xs font-mono w-16 text-center">
              {store.state.currentPage} / {store.state.pageCount}
            </span>
            <button
              disabled={store.state.currentPage >= store.state.pageCount}
              onclick={() => store.setPage(store.state.currentPage + 1)}
              class="p-1 rounded-md hover:bg-background disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onclick={() => store.reset()}
            class="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
        <div class="mx-auto max-w-4xl space-y-6">
          <div class="flex flex-wrap items-center gap-4 text-sm">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={store.state.applyToAll}
                class="rounded border-primary text-primary focus:ring-primary"
              />
              <span>Apply crop to all pages</span>
            </label>

            <div class="h-4 w-px bg-border"></div>

            <label
              class="flex items-center gap-2 cursor-pointer"
              title="Converts pages to images. Fixes stubborn PDFs but removes text selection."
            >
              <input
                type="checkbox"
                bind:checked={store.state.isDestructive}
                class="rounded border-primary text-primary focus:ring-primary"
              />
              <span>Flatten (Destructive)</span>
            </label>
          </div>

          <CropperCanvas {store} />
        </div>
      </div>

      <div class="border-t border-border bg-background p-4 text-center">
        <button
          onclick={() => store.crop()}
          disabled={store.state.isProcessing}
          class="inline-flex h-11 min-w-50 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {#if store.state.isProcessing}
            <Loader2 class="animate-spin" /> {store.state.progress}
          {:else}
            Crop PDF <ArrowRight size={18} />
          {/if}
        </button>
      </div>
    </div>
  {/if}
</div>
