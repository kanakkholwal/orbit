<script lang="ts">
  import {
    IconLoader2 as Loader,
    IconRotate2 as RotateLeft,
    IconRotateClockwise as RotateRight,
  } from "@tabler/icons-svelte";
  import { normalizeTurn, type RotatePdfState } from "./helper.svelte";

  let { store, index }: { store: RotatePdfState; index: number } = $props();

  let canvas: HTMLCanvasElement;
  let isRendered = $state(false);

  const rotation = $derived(store.state.pages[index]?.rotation ?? 0);
  const turn = $derived(normalizeTurn(rotation));
  const sideways = $derived(turn === 90 || turn === 270);
  const pageNumber = $derived(index + 1);

  function lazy(node: HTMLElement) {
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (!isRendered && canvas) {
          store
            .renderThumbnail(canvas, index)
            .then(() => (isRendered = true))
            .catch(console.error);
        }
        obs.disconnect();
      },
      { rootMargin: "200px" }
    );
    obs.observe(node);
    return { destroy: () => obs.disconnect() };
  }

  const actionClass =
    "grid size-9 place-items-center rounded-lg text-muted-foreground outline-none transition-[opacity,color,background-color] duration-150 hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100";
</script>

<div
  use:lazy
  class="group relative flex flex-col gap-1.5 rounded-xl border bg-card p-1.5 transition-[border-color,box-shadow] duration-150 hover:shadow-sm {turn
    ? 'border-primary'
    : 'border-border hover:border-border-strong'}"
>
  <div class="relative grid aspect-3/4 place-items-center overflow-hidden rounded-lg bg-muted">
    {#if !isRendered}
      <Loader class="absolute size-4 animate-spin text-muted-foreground" />
    {/if}
    <canvas
      bind:this={canvas}
      class="pointer-events-none h-auto! max-h-full w-auto! max-w-full transition-[opacity,transform] duration-300 ease-out {isRendered
        ? 'opacity-100'
        : 'opacity-0'}"
      style:transform={`rotate(${rotation}deg) scale(${sideways ? 0.75 : 1})`}
    ></canvas>
    <span
      class="absolute left-1.5 top-1.5 rounded-md bg-background/90 px-1.5 py-0.5 text-caption font-medium tabular-nums text-foreground shadow-xs"
      aria-hidden="true"
    >
      {pageNumber}
    </span>
    {#if turn}
      <span
        class="absolute right-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-caption font-medium tabular-nums text-primary-foreground shadow-xs"
      >
        {turn}°
      </span>
    {/if}
  </div>

  <div class="flex items-center justify-between gap-1">
    <button
      type="button"
      onclick={() => store.rotatePage(index, -90)}
      aria-label={`Turn page ${pageNumber} left`}
      class={actionClass}
    >
      <RotateLeft class="size-4" />
    </button>
    <span class="truncate text-caption tabular-nums text-muted-foreground">
      Page {pageNumber}<span class="sr-only">{turn ? `, turned ${turn} degrees` : ""}</span>
    </span>
    <button
      type="button"
      onclick={() => store.rotatePage(index, 90)}
      aria-label={`Turn page ${pageNumber} right`}
      class={actionClass}
    >
      <RotateRight class="size-4" />
    </button>
  </div>
</div>
