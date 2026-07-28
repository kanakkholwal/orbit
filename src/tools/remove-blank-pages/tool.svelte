<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconFileUnknown as FileQuestion,
    IconLoader2 as LoaderCircle,
    IconSearch as Search,
    IconBolt as Zap,
  } from "@tabler/icons-svelte";
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
  <div class="flex flex-col gap-8">
    <ToolBar
      label={store.state.file.name}
      count={store.state.pageCount}
      onReset={() => store.reset()}
      resetLabel="Clear"
    />

    <ToolPanel title="Source">
      <FileRow name={store.state.file.name}>
        <span class="font-mono tabular-nums">
          {formatBytes(store.state.originalSize)}
        </span>
        <span class="text-muted-foreground/40">·</span>
        <span class="font-mono tabular-nums">
          {store.state.pageCount} pages
        </span>
      </FileRow>
    </ToolPanel>

    <ToolPanel title="Detection">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <Label
            for="sensitivity"
            class="label-eyebrow text-muted-foreground"
          >
            Sensitivity
          </Label>
          <span class="font-mono text-sm tabular-nums text-primary">
            {store.state.sensitivity}%
          </span>
        </div>
        <input
          id="sensitivity"
          type="range"
          min="0"
          max="100"
          step="5"
          bind:value={store.state.sensitivity}
          class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted/60 accent-primary"
        />
        <p class="text-xs leading-relaxed text-muted-foreground">
          Higher values catch pages with tiny artifacts (scan dust). Lower
          values only flag pure-white pages.
        </p>
      </div>

      <Button
        variant="outline"
        class="mt-4 w-full rounded-sm"
        onclick={() => store.detectBlankPages()}
        disabled={store.state.isDetecting || store.isProcessing}
      >
        {#if store.state.isDetecting}
          <LoaderCircle class="size-3.5 animate-spin" />
          {store.progressLabel}
        {:else}
          <Search class="size-3.5" />
          Detect blank pages
        {/if}
      </Button>
    </ToolPanel>

    {#if store.state.hasPerformedDetection}
      <ToolPanel
        title="Results"
        counter={store.state.detectedPages.length}
      >
        {#if store.state.detectedPages.length === 0}
          <div
            class="flex flex-col items-center gap-3 rounded-sm border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center"
          >
            <span class="inline-flex size-10 items-center justify-center rounded-sm bg-muted/60 text-muted-foreground">
              <FileQuestion class="size-4" />
            </span>
            <p class="label-eyebrow text-muted-foreground">
              No blank pages found
            </p>
            <p class="max-w-xs text-xs text-muted-foreground">
              Try increasing sensitivity if some were missed.
            </p>
          </div>
        {:else}
          <div
            class="rounded-sm border border-primary/20 bg-primary/5 px-4 py-2.5 label-eyebrow text-primary"
          >
            Found {store.state.detectedPages.length} potentially blank page{store
              .state.detectedPages.length === 1
              ? ""
              : "s"} · click to deselect
          </div>

          <div
            class="mt-4 grid max-h-112 grid-cols-2 gap-3 overflow-y-auto rounded-sm border border-border/60 bg-muted/20 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {#each store.state.detectedPages as pageInfo (pageInfo.index)}
              <PageThumbnail {store} {pageInfo} />
            {/each}
          </div>
        {/if}
      </ToolPanel>
    {/if}

    {#if store.state.hasPerformedDetection && store.state.detectedPages.length > 0}
      <ToolFooter
        hint={store.isProcessing
          ? store.progress.text
          : `${store.state.detectedPages.filter((p) => p.isSelected).length} marked for removal`}
      >
        <Button
          size="lg"
          variant="destructive"
          class="rounded-sm px-6 shadow-sm"
          onclick={() => store.process()}
          disabled={store.isProcessing ||
            store.state.detectedPages.filter((p) => p.isSelected).length === 0}
        >
          {#if store.isProcessing}
            <LoaderCircle class="size-4 animate-spin" />
            {store.progressLabel}
          {:else}
            <Zap class="size-4" />
            Remove selected
          {/if}
        </Button>
      </ToolFooter>
    {/if}
  </div>
{/if}
