<script lang="ts">
  import { IconLoader2 as Loader, IconX as X } from "@tabler/icons-svelte";
  import type { MergeState, PageItem } from "./helper.svelte";

  type Props = { item: PageItem; store: MergeState; position: number; fileNumber: number };

  let { item, store, position, fileNumber }: Props = $props();

  let canvas: HTMLCanvasElement;
  let isRendered = $state(false);

  function lazy(node: HTMLElement) {
    const obs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      if (!isRendered && canvas) {
        store.renderThumbnail(canvas, item.fileId, item.pageIndex).then(() => (isRendered = true));
      }
      obs.disconnect();
    });
    obs.observe(node);
    return { destroy: () => obs.disconnect() };
  }
</script>

<div
  use:lazy
  class="group relative flex cursor-grab flex-col gap-1.5 rounded-xl border border-border bg-card p-1.5 transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-sm active:cursor-grabbing"
  title={`${item.fileName}, page ${item.pageIndex + 1}`}
>
  <div class="relative grid aspect-3/4 place-items-center overflow-hidden rounded-lg bg-muted">
    {#if !isRendered}
      <Loader class="absolute size-4 animate-spin text-muted-foreground" />
    {/if}
    <canvas
      bind:this={canvas}
      class="h-full w-full object-contain transition-opacity duration-300 {isRendered ? 'opacity-100' : 'opacity-0'}"
    ></canvas>
    <span class="absolute left-1.5 top-1.5 rounded-md bg-background/90 px-1.5 py-0.5 text-caption font-medium tabular-nums text-foreground shadow-xs">
      {position}
    </span>
    <button
      type="button"
      onclick={() => store.removePage(item.id)}
      aria-label={`Remove page ${item.pageIndex + 1} of ${item.fileName}`}
      class="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-md bg-background/90 text-muted-foreground shadow-xs outline-none transition-opacity hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
    >
      <X class="size-4" />
    </button>
  </div>
  <div class="flex items-center justify-between gap-1 px-0.5 text-caption tabular-nums text-muted-foreground">
    <span class="truncate">File {fileNumber}</span>
    <span class="shrink-0">p. {item.pageIndex + 1}</span>
  </div>
</div>
