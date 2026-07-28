<script lang="ts">
  import { ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Label } from "$components/ui/label";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$components/ui/select";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { arrayMove, sortableList } from "$lib/actions/sortable-list";
  import { formatBytes } from "$utils/helper";
  import { IconArrowRight as ArrowRight, IconFile as FileIcon, IconLoader2 as LoaderCircle, IconPlus as Plus, IconTrash as Trash2 } from "@tabler/icons-svelte";
  import { ACCEPTED_FORMATS, JpgToPdfState } from "./helper.svelte";

  const store = new JpgToPdfState();
  let uploadArea: ReturnType<typeof UploadArea>;
</script>

<UploadArea
  bind:this={uploadArea}
  accept={ACCEPTED_FORMATS.join(",")}
  onFilesSelected={(files) => store.addFiles(files)}
  class={store.files.length > 0 ? "hidden" : ""}
/>

{#if store.files.length > 0}
  <div class="flex flex-col gap-8">
    <ToolBar
      label="Images"
      count={store.files.length}
      onReset={() => store.reset()}
      resetLabel="Clear"
    >
      {#snippet actions()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => uploadArea.click()}
          class="rounded-sm"
        >
          <Plus class="size-3.5" />
          <span class="hidden sm:inline">Add</span>
        </Button>
      {/snippet}
    </ToolBar>

    <ToolPanel title="Quality">
      <div class="flex flex-col gap-2">
        <Label
          for="quality-select"
          class="label-eyebrow text-muted-foreground"
        >
          PDF quality
        </Label>
        <Select type="single" bind:value={store.quality}>
          <SelectTrigger class="h-10 rounded-sm" id="quality-select">
            {store.quality}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High · original size</SelectItem>
            <SelectItem value="medium">Medium · recommended</SelectItem>
            <SelectItem value="low">Low · smallest file</SelectItem>
          </SelectContent>
        </Select>
        <p class="text-xs leading-relaxed text-muted-foreground">
          Controls compression of embedded images.
        </p>
      </div>
    </ToolPanel>

    <ToolPanel title="Pages" counter={store.files.length}>
      <div
        use:sortableList={{
          onReorder: (o, n) => (store.files = arrayMove(store.files, o, n)),
          options: { handle: ".drag-handle" },
        }}
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
      >
        {#each store.files as item, i (item.id)}
          <div
            class="drag-handle group relative aspect-3/4 cursor-move overflow-hidden rounded-sm border border-border/60 bg-card transition-colors hover:border-primary/40"
          >
            {#if item.previewUrl}
              <img
                src={item.previewUrl}
                class="h-full w-full object-cover"
                alt="preview"
              />
            {:else}
              <div
                class="flex h-full w-full flex-col items-center justify-center bg-muted/40 text-muted-foreground"
              >
                <FileIcon class="size-7" />
                <span class="mt-2 label-eyebrow text-muted-foreground">
                  {item.file.name.split(".").pop()}
                </span>
              </div>
            {/if}

            <span
              class="absolute left-2 top-2 inline-flex size-5 items-center justify-center rounded-xs bg-background/85 font-mono text-[10px] tabular-nums text-foreground shadow-sm backdrop-blur-sm"
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <button
              type="button"
              onclick={(e) => {
                e.stopPropagation();
                store.removeFile(item.id);
              }}
              class="absolute right-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-xs bg-background/85 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
              aria-label="Remove image"
            >
              <Trash2 class="size-3" />
            </button>

            <div
              class="absolute inset-x-0 bottom-0 border-t border-border/60 bg-card/90 px-2.5 py-1.5 backdrop-blur-sm"
            >
              <p class="truncate font-mono text-[10px] tabular-nums text-foreground">
                {item.file.name}
              </p>
              <p
                class="label-eyebrow text-muted-foreground"
              >
                {formatBytes(item.file.size)}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </ToolPanel>

    <ToolFooter
      hint={store.isProcessing
        ? store.progress.text || "Converting"
        : `Compose ${store.files.length} image${store.files.length === 1 ? "" : "s"} into PDF`}
    >
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.convert()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progress.text || "Converting"}
        {:else}
          Convert to PDF
          <ArrowRight class="size-4" />
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
