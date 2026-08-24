<script lang="ts">
  import { ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { cn } from "$lib/utils";
  import {
    IconCircleCheck as CheckCircle2,
    IconFileStack as FileStack,
    IconLayoutGrid as Grid,
    IconStack2 as Layers,
    IconLoader2 as LoaderCircle,
    IconRefresh as RefreshCcw,
  } from "@tabler/icons-svelte";
  import { SplitState } from "./helper.svelte";

  const store = new SplitState();
  let uploadArea: ReturnType<typeof UploadArea>;

  function lazy(node: HTMLElement, pageIndex: number) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const canvas = node.querySelector("canvas");
        if (canvas) store.renderThumbnail(canvas, pageIndex);
        obs.disconnect();
      }
    });
    obs.observe(node);
    return { destroy: () => obs.disconnect() };
  }

  const modes = [
    { id: "range", label: "Range", icon: Layers },
    { id: "visual", label: "Visual", icon: Grid },
    { id: "n-times", label: "N-pages", icon: FileStack },
  ] as const;
</script>

<UploadArea
  bind:this={uploadArea}
  accept=".pdf"
  multiple={false}
  onFilesSelected={(files) => store.loadFile(files[0])}
  class={store.file ? "hidden" : ""}
/>

{#if store.file}
  <div class="flex flex-col gap-8">
    <ToolBar
      label={store.fileName}
      count={store.pageCount}
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
          <RefreshCcw class="size-3.5" />
          <span class="hidden sm:inline">Change</span>
        </Button>
      {/snippet}
    </ToolBar>

    <ToolPanel title="Mode">
      <div class="flex rounded-sm bg-muted/40 p-1">
        {#each modes as mode}
          <button
            type="button"
            onclick={() => (store.mode = mode.id)}
            class={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 label-eyebrow transition-colors",
              store.mode === mode.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <mode.icon class="size-3" />
            {mode.label}
          </button>
        {/each}
      </div>
    </ToolPanel>

    {#if store.mode === "range"}
      <ToolPanel title="Page range">
        <div class="flex flex-col gap-2">
          <Label for="range-input" class="sr-only">Page range</Label>
          <Input
            id="range-input"
            type="text"
            placeholder="e.g. 1-5, 8, 11-13"
            bind:value={store.rangeInput}
            class="h-11 rounded-sm font-mono text-sm"
          />
          <p class="text-xs leading-relaxed text-muted-foreground">
            Use commas for separate pages
            <code class="rounded-xs bg-muted/60 px-1 font-mono text-caption text-foreground">1, 3, 5</code>
            and hyphens for ranges
            <code class="rounded-xs bg-muted/60 px-1 font-mono text-caption text-foreground">1-5</code>.
          </p>
        </div>
      </ToolPanel>
    {:else if store.mode === "n-times"}
      <ToolPanel title="Chunk size">
        <div class="flex items-center gap-3">
          <Input
            id="n-input"
            type="number"
            min="1"
            bind:value={store.nTimesValue}
            class="h-11 w-32 rounded-sm font-mono text-sm tabular-nums"
          />
          <span class="label-eyebrow text-muted-foreground">
            pages per file
          </span>
        </div>
        <p
          class="mt-3 border-l-2 border-primary/40 pl-3 text-xs leading-relaxed text-muted-foreground"
        >
          Creates multiple PDFs of {store.nTimesValue} pages each, packaged as a single ZIP.
        </p>
      </ToolPanel>
    {:else if store.mode === "visual"}
      <ToolPanel
        title="Pages"
        counter={`${store.selectedPages.size} / ${store.pageCount}`}
      >
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {#each { length: store.pageCount } as _, i}
            {@const isSelected = store.selectedPages.has(i)}
            <button
              type="button"
              use:lazy={i}
              onclick={() => store.togglePageSelection(i)}
              aria-pressed={isSelected}
              class={cn(
                "group relative flex aspect-3/4 cursor-pointer flex-col overflow-hidden rounded-sm border transition-colors",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <canvas class="h-full w-full object-contain"></canvas>

              <div
                class={cn(
                  "absolute inset-0 transition-colors",
                  isSelected ? "bg-primary/5" : "group-hover:bg-foreground/5"
                )}
              >
                <div class="absolute right-1.5 top-1.5">
                  {#if isSelected}
                    <span
                      class="inline-flex size-5 items-center justify-center rounded-xs bg-primary text-primary-foreground shadow-sm"
                    >
                      <CheckCircle2 class="size-3.5" />
                    </span>
                  {:else}
                    <span
                      class="inline-block size-4 rounded-xs border border-border bg-background/60"
                    ></span>
                  {/if}
                </div>
              </div>

              <div
                class="absolute inset-x-0 bottom-0 bg-card/90 py-1 text-center font-mono text-caption tabular-nums text-muted-foreground backdrop-blur-sm"
              >
                {String(i + 1).padStart(2, "0")}
              </div>
            </button>
          {/each}
        </div>
      </ToolPanel>
    {/if}

    <ToolFooter
      hint={store.isProcessing
        ? store.progress.text
        : store.mode === "n-times"
          ? "Split & package as ZIP"
          : `Selected ${store.mode === "visual" ? store.selectedPages.size : "range"}`}
    >
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.processSplit()}
        disabled={store.isProcessing ||
          (store.mode === "range" && !store.rangeInput) ||
          (store.mode === "visual" && store.selectedPages.size === 0)}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progress.text}
        {:else}
          {store.mode === "n-times" ? "Split & ZIP" : "Download"}
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
