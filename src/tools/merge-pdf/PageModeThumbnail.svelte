<script lang="ts">
  import { Loader2 } from '@lucide/svelte';
  import type { MergeState, PageItem } from './helper.svelte';

  let { item, store } = $props<{ item: PageItem; store: MergeState }>();
  
  let canvas: HTMLCanvasElement;
  let isRendered = $state(false);

  // Lazy render
  function lazy(node: HTMLElement) {
    const obs = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting) {
        if (!isRendered && canvas) {
            store.renderThumbnail(canvas, item.fileId, item.pageIndex)
                .then(() => isRendered = true);
        }
        obs.disconnect();
      }
    });
    obs.observe(node);
    return { destroy: () => obs.disconnect() };
  }
</script>

<div 
  use:lazy
  class="relative flex aspect-3/4 cursor-move flex-col items-center justify-center overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:ring-2 hover:ring-primary"
  title="{item.fileName} - Page {item.pageIndex + 1}"
>
  {#if !isRendered}
    <Loader2 class="animate-spin text-muted-foreground m-auto" />
  {/if}
  
  <canvas 
    bind:this={canvas} 
    class:opacity-0={!isRendered}
    class:opacity-100={isRendered}
    class="h-full w-full object-contain transition-opacity duration-300"
  ></canvas>

  <div class="absolute bottom-0 left-0 right-0 bg-card py-1 text-center text-[10px] text-card-foreground backdrop-blur-sm rounded-b-lg">
    Page {item.pageIndex + 1}
  </div>
</div>