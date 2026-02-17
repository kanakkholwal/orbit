<script lang="ts">
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    ArrowRight,
    FileText,
    FileType,
    Loader2,
    Settings2,
    Trash2
  } from "@lucide/svelte";
  import { PdfToJpgState } from "./helper.svelte";
  import Button from "$components/ui/button/button.svelte";

  const store = new PdfToJpgState();
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
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600"
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
              <Settings2 size={18} class="text-primary" />
              <h3 class="font-semibold">Export Settings</h3>
            </div>

            <div class="space-y-3">
              <label
                for="format-select"
                class="flex items-center gap-2 text-sm font-medium"
              >
                <FileType size={16} class="text-muted-foreground" /> Output Format
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  class="flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-all {store
                    .state.format === 'jpeg'
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                    : 'border-border bg-background hover:bg-muted'}"
                  onclick={() => (store.state.format = "jpeg")}
                >
                  JPG
                </button>
                <button
                  class="flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-all {store
                    .state.format === 'png'
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                    : 'border-border bg-background hover:bg-muted'}"
                  onclick={() => (store.state.format = "png")}
                >
                  PNG
                </button>
                <button
                  class="flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-all {store
                    .state.format === 'webp'
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                    : 'border-border bg-background hover:bg-muted'}"
                  onclick={() => (store.state.format = "webp")}
                >
                  WebP
                </button>
              </div>
            </div>

            {#if store.state.format !== "png"}
              <div class="space-y-4 pt-2">
                <div class="flex items-center justify-between">
                  <label for="quality-range" class="text-sm font-medium"
                    >Image Quality</label
                  >
                  <span class="text-sm font-bold text-primary"
                    >{Math.round(store.state.quality * 100)}%</span
                  >
                </div>

                <input
                  id="quality-range"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  bind:value={store.state.quality}
                  class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
                />

                <div
                  class="flex justify-between text-[10px] text-muted-foreground px-1"
                >
                  <span>Low Size</span>
                  <span>Balanced</span>
                  <span>High Quality</span>
                </div>
              </div>
            {/if}
          </div>

          <div
            class="rounded-lg bg-blue-500/10 p-4 text-xs text-blue-600 dark:text-blue-400"
          >
            <p class="font-medium mb-1">Export Summary:</p>
            <ul class="list-disc pl-4 space-y-1">
              <li>
                Format: <strong>{store.state.format.toUpperCase()}</strong>
              </li>
              {#if store.state.format !== "png"}
                <li>
                  Quality: <strong
                    >{Math.round(store.state.quality * 100)}%</strong
                  >
                </li>
              {/if}
              <li>
                Output: A ZIP file containing {store.state.pageCount} images.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="border-t border-border bg-background p-4 text-center">
        <Button
        size="lg"
        variant="dark"
        class="px-8 h-11 min-w-50"
          onclick={() => store.convert()}
          disabled={store.state.isProcessing}
        >
          {#if store.state.isProcessing}
            <Loader2 class="animate-spin" /> {store.state.progress}
          {:else}
            Convert to Images <ArrowRight size={18} />
          {/if}
        </Button>
      </div>
    </div>
  {/if}
</div>
