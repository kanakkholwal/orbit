<script lang="ts">
  import { PageCard, pageAction } from "$components/tool";
  import { IconRotate2 as RotateLeft, IconRotateClockwise as RotateRight } from "$lib/icons";
  import { normalizeTurn, type RotatePdfState } from "./helper.svelte";

  let { store, index }: { store: RotatePdfState; index: number } = $props();

  const rotation = $derived(store.state.pages[index]?.rotation ?? 0);
  const turn = $derived(normalizeTurn(rotation));
  const pageNumber = $derived(index + 1);
</script>

{#snippet badge()}
  {#if turn}
    <span class="rounded-md bg-primary px-1.5 py-0.5 text-xs font-medium tabular-nums text-primary-foreground shadow-xs">{turn}°</span>
  {/if}
{/snippet}

{#snippet footer()}
  <span class="flex items-center justify-between gap-1">
    <button type="button" onclick={() => store.rotatePage(index, -90)} aria-label={`Turn page ${pageNumber} left`} class={pageAction}>
      <RotateLeft class="size-4" />
    </button>
    <span class="truncate text-xs tabular-nums text-muted-foreground">
      Page {pageNumber}<span class="sr-only">{turn ? `, turned ${turn} degrees` : ""}</span>
    </span>
    <button type="button" onclick={() => store.rotatePage(index, 90)} aria-label={`Turn page ${pageNumber} right`} class={pageAction}>
      <RotateRight class="size-4" />
    </button>
  </span>
{/snippet}

<PageCard
  render={(canvas) => store.renderThumbnail(canvas, index)}
  number={pageNumber}
  {rotation}
  highlight={turn !== 0}
  {badge}
  {footer}
/>
