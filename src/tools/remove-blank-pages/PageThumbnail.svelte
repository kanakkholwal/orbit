<script lang="ts">
  import { Loader2, Check } from "@lucide/svelte";
  import type { RemoveBlankPagesState } from "./helper.svelte";

  let { store, pageInfo } = $props<{ 
      store: RemoveBlankPagesState; 
      pageInfo: { index: number, isSelected: boolean } 
  }>();
  
  let canvasEl: HTMLCanvasElement;
  let isRendered = $state(false);

  function lazyLoad(node: HTMLElement) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (canvasEl && !isRendered) {
            store.renderThumbnail(canvasEl, pageInfo.index)
                 .then(() => isRendered = true)
                 .catch((e:any) => console.error(e));
        }
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }
</script>

<div 
    class="relative cursor-pointer group transition-all duration-200" 
    use:lazyLoad 
    onclick={() => store.togglePageSelection(pageInfo.index)}
>
  <div 
    class="relative overflow-hidden rounded-xl border-2 aspect-[3/4] flex items-center justify-center bg-muted/30 shadow-sm transition-all duration-200
           {pageInfo.isSelected ? 'border-destructive ring-2 ring-destructive/20 opacity-90' : 'border-border grayscale opacity-50'}"
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

    <div class="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border text-center py-1 text-xs font-medium">
        Page {pageInfo.index + 1}
    </div>

    {#if pageInfo.isSelected}
        <div class="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center shadow-md">
            <Check size={12} strokeWidth={3} />
        </div>
    {/if}
  </div>
</div>