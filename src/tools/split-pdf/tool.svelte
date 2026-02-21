<script lang="ts">
  import Button from "$components/ui/button/button.svelte";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import {
    CheckCircle2,
    FileStack,
    Grid,
    Layers,
    Loader2,
    RefreshCcw,
    Scissors,
    Trash2,
  } from "@lucide/svelte";
  import { SplitState } from "./helper.svelte";

  const store = new SplitState();
  let uploadArea: ReturnType<typeof UploadArea>;

  // Visual Page Thumbnail Component (Inline for simplicity or extract)
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
</script>

<UploadArea
  bind:this={uploadArea}
  accept=".pdf"
  multiple={false}
  onFilesSelected={(files) => store.loadFile(files[0])}
  class={store.file ? "hidden" : ""}
/>
{#if store.file}
  <div class="sticky top-0 z-20 border-b border-border rounded-lg p-4 backdrop-blur bg-accent">
    <div
      class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600"
        >
          <Scissors size={20} />
        </div>
        <div>
          <h3
            class="text-sm font-semibold text-foreground truncate max-w-50"
            title={store.fileName}
          >
            {store.fileName}
          </h3>
          <p class="text-xs text-muted-foreground">
            {store.pageCount} Pages
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="secondary" onclick={() => uploadArea.click()}>
          <RefreshCcw size={16} /> Change File
        </Button>
        <Button variant="destructive_soft" onclick={() => store.reset()}>
          <Trash2 size={16} /> Clear
        </Button>
      </div>
    </div>

    <div class="mt-6 flex space-x-1 rounded-xl bg-muted/50 p-1">
      <Button
        variant={store.mode === "range" ? "outline" : "ghost"}
        onclick={() => (store.mode = "range")}
      >
        <Layers size={16} /> Range
      </Button>
      <Button
        variant={store.mode === "visual" ? "outline" : "ghost"}
        onclick={() => (store.mode = "visual")}
      >
        <Grid size={16} /> Visual
      </Button>
      <Button
        variant={store.mode === "n-times" ? "outline" : "ghost"}
        onclick={() => (store.mode = "n-times")}
      >
        <FileStack size={16} /> N-Pages
      </Button>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 py-6">
    {#if store.mode === "range"}
      <div class="mx-auto max-w-lg space-y-6">
        <div class="rounded-xl border border-border bg-card p-6 shadow-sm">
          <Label
            for="range-input"
            class="mb-2"
          >
            Enter Page Range
          </Label>
          <Input
            id="range-input"
            type="text"
            placeholder="e.g. 1-5, 8, 11-13"
            bind:value={store.rangeInput}
            class="flex h-12 w-full rounded-md"
          />
          <p class="mt-2 text-xs text-muted-foreground">
            Use commas for separate pages (<code>1, 3, 5</code>) and hyphens for
            ranges (<code>1-5</code>).
          </p>
        </div>
      </div>
    {:else if store.mode === "n-times"}
      <div class="mx-auto max-w-lg space-y-6">
        <div class="rounded-xl border border-border bg-card p-4 shadow-sm">
          <Label
            for="n-input"
            class="mb-2"
          >
            Split every N pages
          </Label>
          <div class="flex items-center gap-4">
            <Input
              id="n-input"
              type="number"
              min="1"
              bind:value={store.nTimesValue}
              class="flex h-12 w-32 rounded-md"
            />
            <span class="text-sm text-muted-foreground">pages per file</span>
          </div>
          <p
            class="mt-4 text-xs text-muted-foreground border-l-2 border-primary/50 pl-3"
          >
            This will create multiple PDF files, each containing {store.nTimesValue}
            pages. The result will be a ZIP file.
          </p>
        </div>
      </div>
    {:else if store.mode === "visual"}
      <div
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        {#each { length: store.pageCount } as _, i}
          <button
            use:lazy={i}
            onclick={() => store.togglePageSelection(i)}
            class="group relative flex aspect-3/4 cursor-pointer flex-col overflow-hidden rounded-xl border-2 transition-all hover:shadow-md {store.selectedPages.has(
              i,
            )
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-transparent hover:border-primary/50'}"
          >
            <canvas class="h-full w-full object-contain"></canvas>

            <div
              class="absolute inset-0 bg-black/0 transition-colors {store.selectedPages.has(
                i,
              )
                ? 'bg-primary/10'
                : 'group-hover:bg-black/5'}"
            >
              <div class="absolute right-2 top-2">
                {#if store.selectedPages.has(i)}
                  <div
                    class="rounded-full bg-primary text-primary-foreground p-0.5 shadow-sm"
                  >
                    <CheckCircle2 size={16} />
                  </div>
                {:else}
                  <div
                    class="h-5 w-5 rounded-full border-2 border-muted-foreground/50 bg-background/50"
                  ></div>
                {/if}
              </div>
            </div>

            <div
              class="absolute bottom-0 left-0 right-0 bg-card/90 py-1 text-center text-[10px] font-medium text-muted-foreground backdrop-blur-sm"
            >
              Page {i + 1}
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <div class="border-t border-border bg-background p-4 text-center">
    <Button
      size="lg"
      variant="dark"
      class="px-8 h-11 min-w-50"
      onclick={() => store.processSplit()}
      disabled={store.isProcessing ||
        (store.mode === "range" && !store.rangeInput) ||
        (store.mode === "visual" && store.selectedPages.size === 0)}
    >
      {#if store.isProcessing}
        <Loader2 class="animate-spin" /> {store.progress.text}
      {:else}
        {store.mode === "n-times" ? "Split & Zip" : "Download Selection"}
      {/if}
    </Button>
  </div>
{/if}
