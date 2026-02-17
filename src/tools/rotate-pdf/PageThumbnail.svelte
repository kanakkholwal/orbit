<script lang="ts">
  import { Loader2, RotateCcw, RotateCw } from "@lucide/svelte";
  import type { RotatePdfState } from "./helper.svelte";

  let { store, index } = $props<{ store: RotatePdfState; index: number }>();

  let canvasEl: HTMLCanvasElement;
  let isRendered = $state(false);
  let isVisible = $state(false);

  // Lazy render
  function lazyLoad(node: HTMLElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isVisible = true;
          if (canvasEl && !isRendered) {
            store
              .renderThumbnail(canvasEl, index)
              .then(() => (isRendered = true));
          }
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }

  const pageData = $derived(store.state.pages[index]);
</script>

<div class="relative flex flex-col gap-2" use:lazyLoad>
  <div
    class="relative group overflow-hidden rounded-xl border border-border bg-muted/30 p-4 aspect-3/4 flex items-center justify-center"
  >
    {#if !isRendered}
      <Loader2 class="animate-spin text-muted-foreground" />
    {/if}

    <canvas
      bind:this={canvasEl}
      class="h-full w-full object-contain transition-transform duration-300 ease-out shadow-sm"
      class:opacity-0={!isRendered}
      class:opacity-100={isRendered}
      style="transform: rotate({pageData?.rotation || 0}deg);"
    ></canvas>

    <div
      class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[1px]"
    >
      <button
        onclick={() => store.rotatePage(index, -90)}
        class="p-2 rounded-full bg-background/90 text-foreground hover:bg-background shadow-lg transition-transform hover:scale-110"
        title="Rotate Left"
      >
        <RotateCcw size={18} />
      </button>
      <button
        onclick={() => store.rotatePage(index, 90)}
        class="p-2 rounded-full bg-background/90 text-foreground hover:bg-background shadow-lg transition-transform hover:scale-110"
        title="Rotate Right"
      >
        <RotateCw size={18} />
      </button>
    </div>

    <div
      class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-background/80 backdrop-blur-sm shadow-sm"
    >
      {index + 1}
    </div>
  </div>
</div>
