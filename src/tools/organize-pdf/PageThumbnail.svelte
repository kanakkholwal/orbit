<script lang="ts">
  import { Button } from "$components/ui/button";
  import { CopyPlus, Loader2, Trash2 } from "@lucide/svelte";
  import type { OrganizePdfState, PageItem } from "./helper.svelte";

  let { store, page, index } = $props<{
    store: OrganizePdfState;
    page: PageItem;
    index: number;
  }>();

  let canvasEl: HTMLCanvasElement;
  let isRendered = $state(false);

  function lazyLoad(node: HTMLElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (canvasEl && !isRendered) {
            store
              .renderThumbnail(canvasEl, page.originalIndex)
              .then(() => (isRendered = true))
              .catch((e: any) => console.error(e));
          }
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }
</script>

<div class="relative group" use:lazyLoad>
  <div
    class="relative overflow-hidden rounded-xl border border-border bg-card/30 aspect-3/4 flex items-center justify-center cursor-move shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20"
  >
    {#if !isRendered}
      <div class="absolute inset-0 flex items-center justify-center">
        <Loader2 class="animate-spin text-muted-foreground" />
      </div>
    {/if}

    <canvas
      bind:this={canvasEl}
      class="h-full w-full object-contain pointer-events-none transition-opacity duration-300"
      class:opacity-0={!isRendered}
      class:opacity-100={isRendered}
    ></canvas>

    <div
      class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[1px]"
    >
      <Button
        onclick={(e) => {
          e.stopPropagation();
          store.duplicatePage(page.id);
        }}
        size="icon-sm"
        variant="default"
        class="rounded-full"
        title="Duplicate"
      >
        <CopyPlus size={18} />
      </Button>
      <Button
        onclick={(e) => {
          e.stopPropagation();
          store.deletePage(page.id);
        }}
        size="icon-sm"
        variant="destructive"
        class="rounded-full"
        title="Delete"
      >
        <Trash2 size={18} />
      </Button>
    </div>

    <div
      class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-background/90 backdrop-blur-sm shadow-sm border border-border"
    >
      {index + 1}
      <span class="text-muted-foreground font-normal ml-1"
        >(Src: {page.originalIndex + 1})</span
      >
    </div>
  </div>
</div>
