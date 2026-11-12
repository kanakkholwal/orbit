<script lang="ts">
  import { PageCard, pageAction } from "$components/tool";
  import { IconX as X } from "$lib/icons";
  import type { MergeState, PageItem } from "./helper.svelte";

  type Props = { item: PageItem; store: MergeState; position: number; fileNumber: number };

  let { item, store, position, fileNumber }: Props = $props();
</script>

{#snippet actions()}
  <button
    type="button"
    onclick={() => store.removePage(item.id)}
    aria-label={`Remove page ${item.pageIndex + 1} of ${item.fileName}`}
    class="{pageAction} bg-background/90 shadow-xs hover:bg-background hover:text-destructive"
  >
    <X class="size-4" />
  </button>
{/snippet}

<PageCard
  render={(canvas) => store.renderThumbnail(canvas, item.fileId, item.pageIndex)}
  number={position}
  ariaLabel={`${item.fileName}, page ${item.pageIndex + 1}`}
  draggable
  {actions}
  footerLabel={`File ${fileNumber}`}
  footerNote={`p. ${item.pageIndex + 1}`}
/>
