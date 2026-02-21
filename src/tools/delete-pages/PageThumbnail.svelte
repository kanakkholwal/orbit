<script lang="ts">
  import { Loader2, Trash2 } from "@lucide/svelte";
  import type { DeletePagesState } from "./helper.svelte";

  let { store, index } = $props<{ store: DeletePagesState; index: number }>();

  let canvasEl: HTMLCanvasElement;
  let isRendered = $state(false);

  function lazyLoad(node: HTMLElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (canvasEl && !isRendered) {
            store
              .renderThumbnail(canvasEl, index)
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

  const isDeleted = $derived(store.state.pagesToDelete.has(index));
</script>

<div
  class="relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
  role="button"
  tabindex="0"
  use:lazyLoad
  onclick={() => store.togglePage(index)}
  onkeydown={(e) =>
    (e.key === "Enter" || e.key === " ") && store.togglePage(index)}
>
  <div
    class="relative overflow-hidden rounded-xl border aspect-3/4 flex items-center justify-center transition-all duration-200 shadow-sm
           {isDeleted
      ? 'border-destructive/50 ring-2 ring-destructive/20 opacity-70'
      : 'border-border bg-muted/30 hover:shadow-md'}"
  >
    {#if !isRendered}
      <div class="absolute inset-0 flex items-center justify-center">
        <Loader2 class="animate-spin text-muted-foreground" />
      </div>
    {/if}

    <canvas
      bind:this={canvasEl}
      class="h-full w-full object-contain transition-opacity duration-300 pointer-events-none"
      class:opacity-0={!isRendered}
      class:opacity-100={isRendered}
    ></canvas>

    {#if isDeleted}
      <div
        class="absolute inset-0 bg-destructive/10 flex items-center justify-center backdrop-blur-[1px]"
      >
        <div
          class="bg-destructive text-destructive-foreground p-3 rounded-full shadow-lg"
        >
          <Trash2 size={24} />
        </div>
      </div>
    {/if}

    {#if !isDeleted}
      <div
        class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]"
      >
        <div
          class="bg-background/90 text-destructive p-2 rounded-full shadow-sm scale-75 group-hover:scale-100 transition-transform"
        >
          <Trash2 size={20} />
        </div>
      </div>
    {/if}

    <div
      class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-background/90 backdrop-blur-sm shadow-sm border border-border"
    >
      {index + 1}
    </div>
  </div>
</div>
