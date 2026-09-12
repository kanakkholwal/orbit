<script lang="ts">
  import { FileRow, ProgressLine, ResultCard, StatusPill, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconDownload as Download,
    IconPhotoOff as PhotoOff,
    IconPlus as Plus,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { ExtractImagesState } from "./helper.svelte";

  const store = new ExtractImagesState();
  let addInput = $state<HTMLInputElement | null>(null);

  const done = $derived(store.extractionDone && !store.isProcessing);
  const imageCount = $derived(store.extractedImages.length);
  const totalSize = $derived(store.files.reduce((sum, f) => sum + f.originalSize, 0));
  const resultFiles = $derived(store.extractionDone ? store.resultFiles : []);
  const imageLabel = (n: number) => `${n} ${n === 1 ? "image" : "images"}`;
  const fileLabel = (n: number) => `${n} ${n === 1 ? "file" : "files"}`;
</script>

{#if store.files.length === 0}
  <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop PDFs to pull out their images</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Save every photo and picture inside your PDFs at its original quality.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.extractionDone && imageCount > 0}
      <ResultCard
        title={`Found ${imageLabel(imageCount)}`}
        description={`From ${fileLabel(store.files.length)}. Save them one at a time or all together.`}
      >
        {#snippet actions()}
          <Button variant="ghost" onclick={() => store.reset()} disabled={store.isProcessing}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <FileSuggestions files={resultFiles} heading="Continue with" exclude="extract-images" />
      </ResultCard>
    {/if}

    <ToolBar
      label={store.extractionDone ? "Images" : "Files"}
      count={store.extractionDone ? imageCount : store.files.length}
      meta={store.extractionDone ? `from ${fileLabel(store.files.length)}` : formatBytes(totalSize)}
      onReset={store.isProcessing ? undefined : () => store.reset()}
      resetLabel="Clear all"
    >
      {#snippet actions()}
        <Button variant="outline" size="sm" disabled={store.isProcessing} onclick={() => addInput?.click()}>
          <Plus />
          <span class="hidden sm:inline">Add files</span>
          <span class="sr-only sm:hidden">Add files</span>
        </Button>
      {/snippet}
    </ToolBar>

    {#if !store.extractionDone}
      <ul class="flex flex-col gap-2">
        {#each store.files as file (file.id)}
          <li>
            <FileRow
              name={file.file.name}
              meta={formatBytes(file.originalSize)}
              onRemove={store.isProcessing ? undefined : () => store.removeFile(file.id)}
            >
              {#snippet trailing()}
                {#if store.isProcessing}
                  <StatusPill status="processing" label="Searching" />
                {/if}
              {/snippet}
            </FileRow>
          </li>
        {/each}
      </ul>
    {:else if imageCount === 0}
      <div class="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <span class="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
          <PhotoOff class="size-5" />
        </span>
        <h2 class="text-body-lg font-medium text-foreground">No images found</h2>
        <p class="max-w-sm text-body text-muted-foreground">
          These files have no pictures saved inside them. Scanned pages count as whole pages, so try PDF to Image instead.
        </p>
      </div>
    {:else}
      <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {#each store.extractedImages as image (image.id)}
          <li class="group flex flex-col gap-1.5 rounded-xl border border-border bg-card p-1.5 transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-sm">
            <div class="relative grid aspect-square place-items-center overflow-hidden rounded-lg bg-muted p-2">
              <img src={image.url} alt={image.name} loading="lazy" class="max-h-full max-w-full object-contain" />
              <button
                type="button"
                onclick={() => store.downloadSingle(image.id)}
                aria-label={`Download ${image.name}`}
                class="absolute right-1.5 top-1.5 grid size-9 place-items-center rounded-lg bg-background/90 text-foreground shadow-xs outline-none transition-opacity hover:text-primary focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
              >
                <Download class="size-4" />
              </button>
            </div>
            <div class="flex items-center justify-between gap-2 px-0.5 text-caption tabular-nums text-muted-foreground">
              <span class="truncate" title={image.name}>{image.name}</span>
              <span class="shrink-0">{formatBytes(image.data.byteLength)}</span>
            </div>
          </li>
        {/each}
      </ul>
    {/if}

    <input
      bind:this={addInput}
      type="file"
      accept=".pdf,application/pdf"
      multiple
      class="hidden"
      onchange={(e) => {
        const picked = Array.from(e.currentTarget.files ?? []);
        if (picked.length > 0) store.addFiles(picked);
        e.currentTarget.value = "";
      }}
    />
  </div>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing && !store.extractionDone}
        <ProgressLine
          label={store.progress.text || "Opening files"}
          current={store.progress.current}
          total={store.progress.total}
          class="max-w-md"
        />
      {:else if store.isProcessing}
        <span class="block truncate text-foreground">Packing images into a ZIP…</span>
      {:else if done}
        <span class="block truncate">
          {imageCount > 0 ? `${imageLabel(imageCount)} ready to save` : "Add other files to try again."}
        </span>
      {:else}
        <span class="block truncate">{fileLabel(store.files.length)} ready</span>
      {/if}
    {/snippet}

    {#if store.extractionDone}
      <Button variant="primary" onclick={() => store.downloadAll()} disabled={store.isProcessing || imageCount === 0}>
        {store.isProcessing ? "Packing…" : "Download all as ZIP"}
      </Button>
    {:else}
      <Button variant="primary" onclick={() => store.extract()} disabled={store.isProcessing}>
        {store.isProcessing ? "Finding images…" : `Find images in ${fileLabel(store.files.length)}`}
      </Button>
    {/if}
  </ToolFooter>
{/if}
