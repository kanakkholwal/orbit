<script lang="ts">
  import { cn } from "$lib/utils";
  import { useScroll } from "@embedpdf/plugin-scroll/svelte";
  import type { ThumbMeta } from "@embedpdf/plugin-thumbnail";
  import { ThumbImg, ThumbnailsPane } from "@embedpdf/plugin-thumbnail/svelte";

  interface ThumbnailsSidebarProps {
    documentId: string;
  }

  let { documentId }: ThumbnailsSidebarProps = $props();

  const scroll = useScroll(() => documentId);
</script>

<div class="flex h-full w-full flex-col bg-background">
  <ThumbnailsPane {documentId} style="width: 100%; height: 100%;">
    {#snippet children(meta: ThumbMeta)}
      {@const current = scroll.state.currentPage === meta.pageIndex + 1}
      <button
        type="button"
        aria-label={`Page ${meta.pageIndex + 1}`}
        aria-current={current ? "page" : undefined}
        onclick={() => scroll.provides?.scrollToPage?.({ pageNumber: meta.pageIndex + 1, behavior: "smooth" })}
        class="group absolute flex w-full flex-col items-center gap-1.5 pt-2 outline-none"
        style:height="{meta.wrapperHeight}px"
        style:top="{meta.top}px"
      >
        <span
          class={cn(
            "block overflow-hidden rounded-md bg-white shadow-xs ring-offset-2 ring-offset-background transition-shadow duration-150 group-focus-visible:ring-2 group-focus-visible:ring-ring",
            current ? "ring-2 ring-primary" : "ring-1 ring-border group-hover:ring-border-strong"
          )}
          style:width="{meta.width}px"
          style:height="{meta.height}px"
        >
          <ThumbImg {meta} {documentId} style="width: 100%; height: 100%; display: block;" />
        </span>
        <span
          class={cn("text-caption tabular-nums", current ? "font-medium text-foreground" : "text-muted-foreground")}
          style:height="{meta.labelHeight}px"
        >
          {meta.pageIndex + 1}
        </span>
      </button>
    {/snippet}
  </ThumbnailsPane>
</div>
