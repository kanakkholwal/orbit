<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconDownload as Download,
    IconFileUnknown as FileQuestion,
    IconLoader2 as LoaderCircle,
    IconPlus as Plus,
    IconBolt as Zap,
  } from "@tabler/icons-svelte";
  import { ExtractImagesState } from "./helper.svelte";

  const store = new ExtractImagesState();
  let uploadArea: ReturnType<typeof UploadArea>;
</script>

{#if store.files.length === 0}
  <UploadArea
    accept=".pdf"
    multiple={true}
    onFilesSelected={(files) => store.addFiles(files)}
  />
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar
      label={store.extractionDone ? "Extracted" : "Documents"}
      count={store.extractionDone
        ? store.extractedImages.length
        : store.files.length}
      onReset={() => store.reset()}
      resetLabel="Start over"
    >
      {#snippet actions()}
        {#if !store.extractionDone}
          <Button
            variant="outline"
            size="sm"
            onclick={() => uploadArea.click()}
            disabled={store.isProcessing}
            class="rounded-sm"
          >
            <Plus class="size-3.5" />
            <span class="hidden sm:inline">Add</span>
          </Button>
        {/if}
      {/snippet}
    </ToolBar>

    {#if !store.extractionDone}
      <ToolPanel title="Files" counter={store.files.length}>
        <ul class="flex flex-col gap-2">
          {#each store.files as file (file.id)}
            <li>
              <FileRow
                name={file.file.name}
                onRemove={() => store.removeFile(file.id)}
              >
                <span class="font-mono tabular-nums">
                  {formatBytes(file.originalSize)}
                </span>
              </FileRow>
            </li>
          {/each}
        </ul>
        <UploadArea
          bind:this={uploadArea}
          accept=".pdf"
          multiple={true}
          onFilesSelected={(files) => store.addFiles(files)}
          class="mt-4"
        />
      </ToolPanel>
    {:else}
      <ToolPanel title="Images" counter={store.extractedImages.length}>
        {#if store.extractedImages.length === 0}
          <div
            class="flex flex-col items-center gap-3 rounded-md border border-dashed border-border bg-muted/20 px-6 py-12 text-center"
          >
            <span class="inline-flex size-10 items-center justify-center rounded-sm bg-muted/60 text-muted-foreground">
              <FileQuestion class="size-4" />
            </span>
            <p class="label-eyebrow text-muted-foreground">
              No images found
            </p>
            <p class="max-w-sm text-sm text-muted-foreground">
              These documents do not contain any embedded images.
            </p>
          </div>
        {:else}
          <ul
            class="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border/60 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            {#each store.extractedImages as image (image.id)}
              <li
                class="group relative flex aspect-square flex-col bg-card transition-colors hover:bg-muted/40"
              >
                <div class="flex h-full w-full items-center justify-center p-3">
                  <img
                    src={image.url}
                    alt={image.name}
                    class="max-h-full max-w-full object-contain"
                  />
                </div>
                <div
                  class="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between gap-2 border-t border-border bg-card/95 px-2.5 py-2 backdrop-blur-md transition-transform group-hover:translate-y-0"
                >
                  <span
                    class="truncate font-mono text-caption tabular-nums text-muted-foreground"
                    title={image.name}
                  >
                    {image.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onclick={() => store.downloadSingle(image.id)}
                    class="rounded-sm text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    title="Download"
                  >
                    <Download class="size-3.5" />
                  </Button>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </ToolPanel>
    {/if}

    <ToolFooter
      hint={store.isProcessing
        ? store.progress.text
        : store.extractionDone
          ? `${store.extractedImages.length} image${store.extractedImages.length === 1 ? "" : "s"} ready`
          : `Scan ${store.files.length} document${store.files.length === 1 ? "" : "s"}`}
    >
      {#if !store.extractionDone}
        <Button
          size="lg"
          class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
          onclick={() => store.extract()}
          disabled={store.isProcessing || store.files.length === 0}
        >
          {#if store.isProcessing}
            <LoaderCircle class="size-4 animate-spin" />
            {store.progress.text}
          {:else}
            <Zap class="size-4" />
            Extract images
          {/if}
        </Button>
      {:else if store.extractedImages.length > 0}
        <Button
          size="lg"
          class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
          onclick={() => store.downloadAll()}
          disabled={store.isProcessing}
        >
          {#if store.isProcessing}
            <LoaderCircle class="size-4 animate-spin" />
            {store.progress.text}
          {:else}
            <Download class="size-4" />
            Download all (ZIP)
          {/if}
        </Button>
      {/if}
    </ToolFooter>
  </div>
{/if}
