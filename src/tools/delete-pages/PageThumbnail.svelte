<script lang="ts">
  import { PageCard } from "$components/tool";
  import type { DeletePagesState } from "./helper.svelte";

  let { store, index }: { store: DeletePagesState; index: number } = $props();

  const selected = $derived(store.state.pagesToDelete.has(index));
</script>

<PageCard
  render={(canvas) => store.renderThumbnail(canvas, index)}
  number={index + 1}
  onToggle={() => store.togglePage(index)}
  {selected}
  dimWhenSelected
  ariaLabel={`Page ${index + 1}${selected ? ", will be deleted" : ""}`}
  footerNote={selected ? "Delete" : undefined}
  footerNoteStrong
/>
