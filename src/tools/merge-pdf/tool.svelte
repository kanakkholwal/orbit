<script lang="ts">
  import {
    ArrowRight,
    FileStack,
    Grid,
    Loader2,
    Plus,
    Trash2,
  } from "@lucide/svelte";
  import Sortable from "sortablejs";
  import { setContext } from "svelte";
  import { MERGE_STATE_KEY, MergeState } from "./helper.svelte";

  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileModeItem from "./FileModeItem.svelte";
  import PageModeThumbnail from "./PageModeThumbnail.svelte";
  import Button from "$components/ui/button/button.svelte";

  const localStore = new MergeState();
  setContext(MERGE_STATE_KEY, localStore);

  let uploadArea: ReturnType<typeof UploadArea>;
  // --- Sortable Actions ---
  function sortableList(node: HTMLElement) {
    const sort = Sortable.create(node, {
      handle: ".drag-handle",
      animation: 200,
      ghostClass: "opacity-40",
      dragClass: "cursor-grabbing",
      onEnd: (evt) => {
        if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
          const items = [...localStore.files];
          const [moved] = items.splice(evt.oldIndex, 1);
          items.splice(evt.newIndex, 0, moved);
          localStore.files = items;
        }
      },
    });
    return { destroy: () => sort.destroy() };
  }

  function sortableGrid(node: HTMLElement) {
    const sort = Sortable.create(node, {
      animation: 200,
      ghostClass: "opacity-40",
      dragClass: "cursor-grabbing",
      delay: 100, // Slight delay to prevent accidental drags on touch
      delayOnTouchOnly: true,
      onEnd: (evt) => {
        if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
          const items = [...localStore.allPages];
          const [moved] = items.splice(evt.oldIndex, 1);
          items.splice(evt.newIndex, 0, moved);
          localStore.allPages = items;
        }
      },
    });
    return { destroy: () => sort.destroy() };
  }
</script>

<div class="p-6">
  {#if localStore.files.length === 0}
    <UploadArea
      bind:this={uploadArea}
      onFilesSelected={(files) => localStore.addFiles(files)}
    />
  {:else}
    <div class="mx-auto max-w-4xl space-y-6">
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sticky top-4 z-30 bg-background/80 backdrop-blur-md p-2 rounded-xl border border-border/50 shadow-sm"
      >
        <div class="flex p-1 bg-muted rounded-lg">
          <button
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 {localStore.mode ===
            'file'
              ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}"
            onclick={() => (localStore.mode = "file")}
          >
            <FileStack size={16} />
            <span>File Mode</span>
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 {localStore.mode ===
            'page'
              ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}"
            onclick={() => (localStore.mode = "page")}
          >
            <Grid size={16} />
            <span>Page Mode</span>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-accent transition-colors"
            onclick={() => uploadArea.click()}
          >
            <Plus size={16} />
            <span class="hidden sm:inline">Add Files</span>
            <span class="sm:hidden">Add</span>
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            onclick={() => localStore.reset()}
          >
            <Trash2 size={16} />
            <span class="hidden sm:inline">Clear All</span>
          </button>
        </div>
      </div>

      <div
        class="min-h-125 rounded-xl border border-border bg-card shadow-sm p-4 sm:p-6 relative overflow-hidden"
      >
        {#if localStore.mode === "file"}
          <div class="flex flex-col gap-3" use:sortableList>
            {#each localStore.files as file (file.id)}
              <FileModeItem
                {file}
                onRemove={() => localStore.removeFile(file.id)}
              />
            {/each}
          </div>

          <div
            class="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-4"
          >
            <div class="flex gap-3">
              <div class="p-2 rounded-full bg-primary/10 text-primary h-fit">
                <FileStack size={18} />
              </div>
              <div class="text-sm">
                <p class="font-semibold text-foreground mb-1">Quick Tips</p>
                <ul
                  class="list-disc list-outside ml-4 space-y-1 text-muted-foreground"
                >
                  <li>
                    Drag the handle <span
                      class="inline-block align-middle opacity-50"
                      ><Grid size={12} /></span
                    > on the left to reorder files.
                  </li>
                  <li>
                    Type page numbers (e.g., <code>1-3, 5</code>) to merge only
                    specific parts of a file.
                  </li>
                  <li>
                    Leave the page range blank to include the entire file.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        {:else}
          <div
            class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            use:sortableGrid
          >
            {#each localStore.allPages as item (item.id)}
              <PageModeThumbnail {item} store={localStore} />
            {/each}
          </div>

          {#if localStore.allPages.length === 0}
            <div
              class="flex flex-col items-center justify-center h-64 text-muted-foreground"
            >
              <Loader2 class="animate-spin mb-2" />
              <p>Loading pages...</p>
            </div>
          {/if}
        {/if}
      </div>
    </div>

    <div
      class="fixed bottom-8 left-1/2 z-40 -translate-x-1/2 w-full max-w-sm px-4"
    >
      <Button
        size="lg"
        variant="dark"
        class="px-8 h-11 min-w-50"
        onclick={() => localStore.mergeAndDownload()}
        disabled={localStore.isProcessing}
      >
        {#if localStore.isProcessing}
          <Loader2 class="animate-spin" />
          <span>{localStore.progress.text || "Processing..."}</span>
        {:else}
          <span>Merge PDF</span>
          <ArrowRight
            size={20}
            class="transition-transform group-hover:translate-x-1"
          />
        {/if}
      </Button>
    </div>
  {/if}
</div>
