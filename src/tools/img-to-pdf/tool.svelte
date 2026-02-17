<script lang="ts">
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    ArrowRight,
    FileIcon,
    Image as ImageIcon,
    Loader2,
    Plus,
    Trash2,
  } from "@lucide/svelte";
  import Sortable from "sortablejs";
  import { ACCEPTED_FORMATS, JpgToPdfState } from "./helper.svelte";
  import { Button } from "$components/ui/button";

  const store = new JpgToPdfState();
  let uploadArea: ReturnType<typeof UploadArea>;

  // Drag and drop sorting
  function sortable(node: HTMLElement) {
    const sort = Sortable.create(node, {
      animation: 150,
      ghostClass: "opacity-50",
      handle: ".drag-handle", // Make whole item draggable or specific handle
      onEnd: (evt) => {
        if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
          const items = [...store.files];
          const [moved] = items.splice(evt.oldIndex, 1);
          items.splice(evt.newIndex, 0, moved);
          store.files = items;
        }
      },
    });
    return { destroy: () => sort.destroy() };
  }
</script>

<div class="h-full w-full">
  {#if store.files.length === 0}
    <UploadArea
      bind:this={uploadArea}
      accept={ACCEPTED_FORMATS.join(",")}
      onFilesSelected={(files) => store.addFiles(files)}
    />
  {:else}
    <div class="flex flex-col h-full">
      <div
        class="sticky top-0 z-20 border-b border-border bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/60"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600"
            >
              <ImageIcon size={18} />
            </div>
            <span class="text-sm font-semibold"
              >{store.files.length} Images</span
            >
          </div>

          <div class="flex items-center gap-2">
            <button
              class="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              onclick={() => uploadArea.click()}
            >
              <Plus size={16} /> Add Images
            </button>
            <button
              class="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-destructive/10 hover:text-destructive text-destructive"
              onclick={() => store.reset()}
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto bg-muted/10 p-6">
        <div class="mx-auto max-w-3xl space-y-6">
          <div class="rounded-xl border border-border bg-card p-4 shadow-sm">
            <label for="quality-select" class="block text-sm font-medium mb-2"
              >PDF Quality</label
            >
            <select
              id="quality-select"
              bind:value={store.quality}
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="high">High Quality (Original Size)</option>
              <option value="medium">Medium Quality (Recommended)</option>
              <option value="low">Low Quality (Smallest File)</option>
            </select>
            <p class="mt-2 text-xs text-muted-foreground">
              Controls the compression level of images inside the PDF.
            </p>
          </div>

          <div
            use:sortable
            class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
          >
            {#each store.files as item (item.id)}
              <div
                class="drag-handle group relative aspect-3/4 cursor-move overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:ring-2 hover:ring-primary/20"
              >
                {#if item.previewUrl}
                  <img
                    src={item.previewUrl}
                    class="h-full w-full object-cover"
                    alt="preview"
                  />
                {:else}
                  <div
                    class="flex h-full w-full flex-col items-center justify-center bg-muted text-muted-foreground"
                  >
                    <FileIcon size={32} />
                    <span class="mt-2 text-[10px] font-bold uppercase"
                      >{item.file.name.split(".").pop()}</span
                    >
                  </div>
                {/if}
                <div
                  class="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-white backdrop-blur-sm"
                >
                  <p class="truncate text-[10px] font-medium">
                    {item.file.name}
                  </p>
                  <p class="text-[9px] opacity-70">
                    {formatBytes(item.file.size)}
                  </p>
                </div>

                <button
                  onclick={(e) => {
                    e.stopPropagation();
                    store.removeFile(item.id);
                  }}
                  class="absolute right-1 top-1 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>

                <div
                  class="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-[10px] font-bold shadow-sm backdrop-blur-sm"
                >
                  {store.files.indexOf(item) + 1}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="border-t border-border bg-background p-4 text-center">
        <Button
        size="lg"
        variant="dark"
        class="px-8 h-11 min-w-50"
          onclick={() => store.convert()}
          disabled={store.isProcessing}
        >
          {#if store.isProcessing}
            <Loader2 class="animate-spin" />
            {store.progress.text || "Converting..."}
          {:else}
            Convert to PDF <ArrowRight size={18} />
          {/if}
        </Button>
      </div>
    </div>
  {/if}
</div>
