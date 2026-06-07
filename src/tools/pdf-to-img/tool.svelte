<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import { ArrowRight, LoaderCircle } from "@lucide/svelte";
  import { PdfToJpgState } from "./helper.svelte";

  const store = new PdfToJpgState();

  const formats = ["jpeg", "png", "webp"] as const;
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files[0])}
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
          {formatBytes(store.state.file.size)}
        </span>
        <span class="text-muted-foreground/40">·</span>
        <span class="font-mono tabular-nums">
          {store.state.pageCount} pages
        </span>
      </FileRow>
    </ToolPanel>

    <ToolPanel title="Format">
      <div class="grid grid-cols-3 gap-1 rounded-sm bg-muted/40 p-1">
        {#each formats as fmt}
          <button
            type="button"
            onclick={() => (store.state.format = fmt)}
            class={cn(
              "rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
              store.state.format === fmt
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {fmt}
          </button>
        {/each}
      </div>

      {#if store.state.format !== "png"}
        <div class="mt-5 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span
              class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
            >
              Quality
            </span>
            <span class="font-mono text-sm tabular-nums text-primary">
              {Math.round(store.state.quality * 100)}%
            </span>
          </div>
          <Input
            id="quality-range"
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            bind:value={store.state.quality}
            class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted/60 accent-primary"
          />
          <div
            class="flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60"
          >
            <span>Low</span>
            <span>Balanced</span>
            <span>High</span>
          </div>
        </div>
      {/if}
    </ToolPanel>

    <ToolPanel title="Summary">
      <dl class="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 sm:grid-cols-3">
        <div class="flex flex-col gap-1 bg-card px-4 py-3">
          <dt class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Format
          </dt>
          <dd class="font-mono text-sm uppercase tabular-nums text-foreground">
            {store.state.format}
          </dd>
        </div>
        {#if store.state.format !== "png"}
          <div class="flex flex-col gap-1 bg-card px-4 py-3">
            <dt class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
              Quality
            </dt>
            <dd class="font-mono text-sm tabular-nums text-foreground">
              {Math.round(store.state.quality * 100)}%
            </dd>
          </div>
        {/if}
        <div class="flex flex-col gap-1 bg-card px-4 py-3">
          <dt class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Output
          </dt>
          <dd class="font-mono text-sm tabular-nums text-foreground">
            ZIP · {store.state.pageCount} images
          </dd>
        </div>
      </dl>
    </ToolPanel>

    <ToolFooter hint={store.isProcessing ? store.progressLabel : "Convert pages to images"}>
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.convert()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progressLabel}
        {:else}
          Convert
          <ArrowRight class="size-4" />
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
