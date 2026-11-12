<script lang="ts">
  import { PageCard } from "$components/tool";
  import type { RemoveBlankPagesState } from "./helper.svelte";

  type Props = { store: RemoveBlankPagesState; pageInfo: { index: number; isSelected: boolean } };

  let { store, pageInfo }: Props = $props();
</script>

<PageCard
  render={(canvas) => store.renderThumbnail(canvas, pageInfo.index)}
  number={pageInfo.index + 1}
  onToggle={() => store.togglePageSelection(pageInfo.index)}
  selected={pageInfo.isSelected}
  ariaLabel={`Page ${pageInfo.index + 1}${pageInfo.isSelected ? ", will be removed" : ", will be kept"}`}
  footerNote={pageInfo.isSelected ? "Remove" : "Keep"}
  footerNoteStrong={pageInfo.isSelected}
/>
