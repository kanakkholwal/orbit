<script lang="ts">
  import { PageCard, pageAction } from "$components/tool";
  import {
    IconChevronLeft as ChevronLeft,
    IconChevronRight as ChevronRight,
    IconCopyPlus as CopyPlus,
    IconTrash as Trash,
  } from "$lib/icons";
  import type { OrganizePdfState, PageItem } from "./helper.svelte";

  type Props = { store: OrganizePdfState; page: PageItem; index: number; total: number };

  let { store, page, index, total }: Props = $props();

  const sourceNumber = $derived(page.originalIndex + 1);
  const overlay = `${pageAction} bg-background/90 shadow-xs hover:bg-background`;
</script>

{#snippet actions()}
  <button type="button" onclick={() => store.duplicatePage(page.id)} aria-label={`Duplicate page ${sourceNumber}`} class={overlay}>
    <CopyPlus class="size-4" />
  </button>
  <button
    type="button"
    onclick={() => store.deletePage(page.id)}
    disabled={total <= 1}
    aria-label={`Delete page ${sourceNumber}`}
    class="{overlay} hover:text-destructive"
  >
    <Trash class="size-4" />
  </button>
{/snippet}

{#snippet footer()}
  <span class="flex items-center justify-between gap-1">
    <button type="button" onclick={() => store.movePage(index, index - 1)} disabled={index === 0} aria-label={`Move page ${sourceNumber} earlier`} class={pageAction}>
      <ChevronLeft class="size-4" />
    </button>
    <span class="truncate text-xs tabular-nums text-muted-foreground">Page {sourceNumber}</span>
    <button type="button" onclick={() => store.movePage(index, index + 1)} disabled={index === total - 1} aria-label={`Move page ${sourceNumber} later`} class={pageAction}>
      <ChevronRight class="size-4" />
    </button>
  </span>
{/snippet}

<PageCard
  render={(canvas) => store.renderThumbnail(canvas, page.originalIndex)}
  number={index + 1}
  ariaLabel={`Page ${sourceNumber}, position ${index + 1}`}
  draggable
  {actions}
  {footer}
/>
