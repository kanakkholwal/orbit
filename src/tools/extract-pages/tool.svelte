<script lang="ts">
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    ArrowRight,
    FileText,
    Info,
    Loader2,
    SplitSquareHorizontal,
    Trash2,
  } from "@lucide/svelte";
  import { ExtractPagesState } from "./helper.svelte";

  const store = new ExtractPagesState();
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
      <div class="border-b border-border bg-background/50 p-6 backdrop-blur-sm">
        <div
          class="mx-auto flex max-w-2xl items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div class="flex items-center gap-4 overflow-hidden">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600"
            >
              <FileText size={20} />
            </div>
            <div class="min-w-0">
              <h3 class="truncate text-sm font-medium">
                {store.state.file.name}
              </h3>
              <div
                class="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span>{formatBytes(store.state.file.size)}</span>
                <span>•</span>
                <span>{store.state.pageCount} Pages</span>
              </div>
            </div>
          </div>
          <button
            onclick={() => store.reset()}
            class="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto bg-muted/10 p-6">
        <div class="mx-auto max-w-lg space-y-8">
          <div
            class="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div
              class="flex items-center gap-2 border-b border-border pb-4 mb-4"
            >
              <SplitSquareHorizontal size={18} class="text-primary" />
              <h3 class="font-semibold">Extraction Settings</h3>
            </div>

            <div class="space-y-4">
              <div class="space-y-2">
                <label for="pages-input" class="text-sm font-medium"
                  >Pages to Extract</label
                >
                <input
                  id="pages-input"
                  type="text"
                  bind:value={store.state.pagesToExtract}
                  placeholder="e.g. 1, 3-5, 8"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p class="text-[11px] text-muted-foreground">
                  Total available pages: <strong>{store.state.pageCount}</strong
                  >
                </p>
              </div>

              <div
                class="rounded-lg bg-muted p-4 text-xs text-muted-foreground"
              >
                <div class="flex gap-2 mb-2 font-medium text-foreground">
                  <Info size={14} /> Examples:
                </div>
                <ul class="space-y-1 list-disc pl-4">
                  <li>
                    <strong>1, 2, 3</strong> : Extracts specific single pages.
                  </li>
                  <li><strong>1-5</strong> : Extracts a range of pages.</li>
                  <li>
                    <strong>1, 3-5, 8</strong> : Combines single pages and ranges.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-border bg-background p-4 text-center">
        <button
          onclick={() => store.extract()}
          disabled={store.state.isProcessing || !store.state.pagesToExtract}
          class="inline-flex h-11 min-w-50 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {#if store.state.isProcessing}
            <Loader2 class="animate-spin" /> {store.state.progress}
          {:else}
            Extract Pages <ArrowRight size={18} />
          {/if}
        </button>
      </div>
    </div>
  {/if}
</div>
