<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Label } from "$components/ui/label";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$components/ui/select";
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

  <UploadArea
    bind:this={uploadArea}
    accept={ACCEPTED_FORMATS.join(",")}
    onFilesSelected={(files) => store.addFiles(files)}
    class={store.files.length > 0 ? "hidden" : ""}
  />
{#if store.files.length > 0}
  <div
    class="sticky top-0 z-20 border-b border-border bg-accent/95 p-4 rounded-lg"
  >
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600"
        >
          <ImageIcon size={18} />
        </div>
        <span class="text-sm font-semibold">{store.files.length} Images</span>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="ghost" onclick={() => uploadArea.click()}>
          <Plus size={16} /> Add Images
        </Button>
        <Button variant="destructive_soft" onclick={() => store.reset()}>
          <Trash2 size={16} /> Clear
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 py-6">
    <div class="mx-auto max-w-3xl space-y-6">
      <div class="rounded-xl border border-border bg-card p-4 shadow-sm">
        <Label for="quality-select" class="mb-2">PDF Quality</Label>
        <Select type="single" bind:value={store.quality}>
          <SelectTrigger class="w-30 h-10" id="settings.level">
            {store.quality}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High Quality (Original Size)</SelectItem>
            <SelectItem value="medium">Medium Quality (Recommended)</SelectItem>
            <SelectItem value="low">Low Quality (Smallest File)</SelectItem>
          </SelectContent>
        </Select>

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
              class="absolute inset-x-0 bottom-0 bg-card/60 p-2 text-card-foreground backdrop-blur-sm"
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

  <div class="border-t border-border p-4 text-center">
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
{/if}
