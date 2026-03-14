<script lang="ts">
    import { useScroll } from "@embedpdf/plugin-scroll/svelte";
    import type { ThumbMeta } from "@embedpdf/plugin-thumbnail";
    import {
        ThumbImg,
        ThumbnailsPane,
    } from "@embedpdf/plugin-thumbnail/svelte";

    interface ThumbnailsSidebarProps {
        documentId: string;
    }

    let { documentId }: ThumbnailsSidebarProps = $props();

    const scroll = useScroll(() => documentId);

    const handleClick = (pageIndex: number) => {
        scroll.provides?.scrollToPage?.({
            pageNumber: pageIndex + 1,
            behavior: "smooth",
        });
    };
</script>

<div class="flex h-full w-52 flex-col bg-background">
    <ThumbnailsPane {documentId} style="width: 100%; height: 100%;">
        {#snippet children(meta: ThumbMeta)}
            <button
                style:position="absolute"
                style:width="100%"
                style:height="{meta.wrapperHeight}px"
                style:top="{meta.top}px"
                style:display="flex"
                style:flex-direction="column"
                style:align-items="center"
                style:padding="6px"
                class="cursor-pointer"
                onclick={() => handleClick(meta.pageIndex)}
            >
                <div
                    style:width="{meta.width}px"
                    style:height="{meta.height}px"
                    class="overflow-hidden rounded transition-all {scroll.state
                        .currentPage ===
                    meta.pageIndex + 1
                        ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                        : 'ring-1 ring-border'}"
                >
                    <ThumbImg
                        {meta}
                        {documentId}
                        style="width: 100%; height: 100%; display: block;"
                    />
                </div>
                <span
                    style:height="{meta.labelHeight}px"
                    class="mt-1 text-[10px] tabular-nums text-muted-foreground"
                >
                    {meta.pageIndex + 1}
                </span>
            </button>
        {/snippet}
    </ThumbnailsPane>
</div>
