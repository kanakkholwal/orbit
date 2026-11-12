<script lang="ts">
  import { PageCard } from "$components/tool";
  import type { SplitState } from "./helper.svelte";

  type Props = { store: SplitState; index: number; part?: number };

  let { store, index, part }: Props = $props();

  const selectable = $derived(part === undefined);
  const selected = $derived(selectable && store.selectedPages.has(index));
</script>

<PageCard
  render={(canvas) => store.renderThumbnail(canvas, index)}
  number={index + 1}
  onToggle={selectable ? () => store.togglePageSelection(index) : undefined}
  {selected}
  ariaLabel={selectable ? `Page ${index + 1}` : `Page ${index + 1}, file ${part}`}
  footerNote={part !== undefined ? `File ${part}` : undefined}
  footerNoteStrong
/>
