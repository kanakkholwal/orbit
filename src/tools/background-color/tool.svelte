<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconLoader2 as LoaderCircle, IconBucketDroplet as PaintBucket, IconBolt as Zap } from "@tabler/icons-svelte";
  import { BackgroundColorState } from "./helper.svelte";

  const store = new BackgroundColorState();
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
      <FileRow name={store.state.file.name} onRemove={() => store.reset()}>
        <span class="font-mono tabular-nums">
          {formatBytes(store.state.originalSize)}
        </span>
        <span class="text-muted-foreground">·</span>
        <span class="font-mono tabular-nums">
          {store.state.pageCount} pages
        </span>
      </FileRow>
    </ToolPanel>

    <ToolPanel title="Background">
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <Label
            for="page-range"
            class="label-eyebrow text-muted-foreground"
          >
            Pages to color
          </Label>
          <Input
            id="page-range"
            type="text"
            placeholder="e.g. 1-3, 5 — leave blank for all"
            bind:value={store.state.pageRange}
            class="h-10 rounded-sm font-mono text-sm"
          />
        </div>

        <div class="flex flex-col gap-2">
          <Label
            for="bg-color"
            class="label-eyebrow text-muted-foreground"
          >
            Color
          </Label>
          <div class="flex items-center gap-3">
            <Input
              id="bg-color"
              type="color"
              class="h-12 w-20 cursor-pointer rounded-sm p-1"
              bind:value={store.state.colorHex}
            />
            <div class="flex flex-col gap-0.5">
              <span class="font-mono text-sm uppercase tabular-nums text-foreground">
                {store.state.colorHex}
              </span>
              <span
                class="label-eyebrow text-muted-foreground"
              >
                Click swatch to choose
              </span>
            </div>
          </div>
        </div>
      </div>
    </ToolPanel>

    <ToolPanel title="How it works">
      <div
        class="flex items-start gap-3 rounded-sm border border-border bg-muted/20 px-4 py-3"
      >
        <span
          class="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary"
        >
          <PaintBucket class="size-3.5" />
        </span>
        <p class="text-xs leading-relaxed text-muted-foreground">
          Most PDF pages are transparent. This tool inserts a solid color layer
          beneath the existing content. Pages that already contain an opaque
          white background image will block the new color.
        </p>
      </div>
    </ToolPanel>

    <ToolFooter hint={store.isProcessing ? "Processing" : "Apply background"}>
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.process()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          Processing
        {:else}
          <Zap class="size-4" />
          Apply background
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
