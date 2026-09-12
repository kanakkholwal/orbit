<script lang="ts">
  import {
    IconChevronLeft as ChevronLeft,
    IconChevronRight as ChevronRight,
    IconCopyPlus as CopyPlus,
    IconLoader2 as Loader,
    IconTrash as Trash,
  } from "@tabler/icons-svelte";
  import type { OrganizePdfState, PageItem } from "./helper.svelte";

  type Props = { store: OrganizePdfState; page: PageItem; index: number; total: number };

  let { store, page, index, total }: Props = $props();

  let canvas: HTMLCanvasElement;
  let isRendered = $state(false);

  const sourceNumber = $derived(page.originalIndex + 1);

  function lazy(node: HTMLElement) {
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (!isRendered && canvas) {
          store
            .renderThumbnail(canvas, page.originalIndex)
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
    "grid size-9 place-items-center rounded-lg text-muted-foreground outline-none transition-[opacity,color,background-color] duration-150 hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none disabled:text-placeholder pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100";
</script>

<div
  use:lazy
  class="group relative flex cursor-grab flex-col gap-1.5 rounded-xl border border-border bg-card p-1.5 transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-sm active:cursor-grabbing"
>
  <div class="relative grid aspect-3/4 place-items-center overflow-hidden rounded-lg bg-muted">
    {#if !isRendered}
      <Loader class="absolute size-4 animate-spin text-muted-foreground" />
    {/if}
    <canvas
      bind:this={canvas}
      class="pointer-events-none h-auto! max-h-full w-auto! max-w-full transition-opacity duration-300 {isRendered
        ? 'opacity-100'
        : 'opacity-0'}"
    ></canvas>
    <span
      class="absolute left-1.5 top-1.5 rounded-md bg-background/90 px-1.5 py-0.5 text-caption font-medium tabular-nums text-foreground shadow-xs"
      aria-hidden="true"
    >
      {index + 1}
    </span>
    <div class="absolute right-1.5 top-1.5 flex flex-col gap-1 rounded-lg">
      <button
        type="button"
        onclick={() => store.duplicatePage(page.id)}
        aria-label={`Duplicate page ${sourceNumber}`}
        class="{actionClass} bg-background/90 shadow-xs hover:bg-background"
      >
        <CopyPlus class="size-4" />
      </button>
      <button
        type="button"
        onclick={() => store.deletePage(page.id)}
        disabled={total <= 1}
        aria-label={`Delete page ${sourceNumber}`}
        class="{actionClass} bg-background/90 shadow-xs hover:bg-background hover:text-destructive"
      >
        <Trash class="size-4" />
      </button>
    </div>
  </div>

  <div class="flex items-center justify-between gap-1">
    <button
      type="button"
      onclick={() => store.movePage(index, index - 1)}
      disabled={index === 0}
      aria-label={`Move page ${sourceNumber} earlier`}
      class={actionClass}
    >
      <ChevronLeft class="size-4" />
    </button>
    <span class="truncate text-caption tabular-nums text-muted-foreground">Page {sourceNumber}</span>
    <button
      type="button"
      onclick={() => store.movePage(index, index + 1)}
      disabled={index === total - 1}
      aria-label={`Move page ${sourceNumber} later`}
      class={actionClass}
    >
      <ChevronRight class="size-4" />
    </button>
  </div>
</div>
