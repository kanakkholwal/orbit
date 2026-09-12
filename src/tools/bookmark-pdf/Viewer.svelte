<script lang="ts">
  import { cn } from "$lib/utils";
  import { IconLoader2 as Loader } from "@tabler/icons-svelte";
  import { untrack } from "svelte";
  import type { BookmarkPdfState } from "./helper.svelte";

  let { store, class: className }: { store: BookmarkPdfState; class?: string } = $props();

  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let boxWidth = $state(0);
  let boxHeight = $state(0);
  let pageAspect = $state(1 / 1.414);
  let rendering = $state(true);
  let renderToken = 0;

  const page = $derived(store.state.currentPage);
  const stageWidth = $derived(Math.max(160, Math.min(boxWidth - 32, (boxHeight - 32) * pageAspect)));

  $effect(() => {
    const target = canvasEl;
    const current = page;
    if (!target || !store.state.file) return;
    untrack(() => render(target, current));
  });

  async function render(target: HTMLCanvasElement, current: number) {
    const token = ++renderToken;
    rendering = true;
    const offscreen = document.createElement("canvas");
    try {
      await store.renderCurrentPage(offscreen, 1000);
      if (token !== renderToken || current !== store.state.currentPage) return;
      target.width = offscreen.width;
      target.height = offscreen.height;
      target.getContext("2d")?.drawImage(offscreen, 0, 0);
      if (offscreen.height > 0) pageAspect = offscreen.width / offscreen.height;
    } finally {
      if (token === renderToken) rendering = false;
    }
  }
</script>

<div
  bind:clientWidth={boxWidth}
  bind:clientHeight={boxHeight}
  class={cn("relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted p-4", className)}
>
  {#if rendering}
    <div class="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-muted" aria-live="polite">
      <Loader class="size-4 animate-spin text-primary" />
      <span class="text-body text-muted-foreground">Loading page {page}</span>
    </div>
  {/if}
  <canvas
    bind:this={canvasEl}
    class="block h-auto bg-fixed-light shadow-sm"
    style:width={`${stageWidth}px`}
    aria-label={`Page ${page} of ${store.state.file?.name ?? "the PDF"}`}
  ></canvas>
</div>
