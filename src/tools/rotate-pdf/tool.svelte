<script lang="ts">
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { ArrowRight, Loader2, RefreshCcw, Rotate3D, RotateCcw, RotateCw, Trash2 } from "@lucide/svelte";
  import { RotatePdfState } from "./helper.svelte";
  import PageThumbnail from "./PageThumbnail.svelte";
  import Button from "$components/ui/button/button.svelte";

  const store = new RotatePdfState();
</script>

<div class="h-full w-full">
  
  {#if !store.state.file}
      <UploadArea 
        accept=".pdf"
        multiple={false}
        onFilesSelected={(files) => store.loadFile(files[0])} 
      />
  {:else}
    <div class="flex flex-col h-full">
      
      <div class="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         
         <div class="flex items-center gap-3 overflow-hidden max-w-[200px] sm:max-w-xs">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
               <Rotate3D size={18} />
            </div>
            <div class="min-w-0">
               <h3 class="truncate text-sm font-medium">{store.state.file.name}</h3>
               <p class="text-[10px] text-muted-foreground">{store.state.pageCount} Pages</p>
            </div>
         </div>

         <div class="flex items-center gap-2">
            <button 
               class="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
               onclick={() => store.rotateAll(-90)}
            >
               <RotateCcw size={14} /> <span class="hidden sm:inline">Left All</span>
            </button>
            <button 
               class="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
               onclick={() => store.rotateAll(90)}
            >
               <RotateCw size={14} /> <span class="hidden sm:inline">Right All</span>
            </button>
            <button 
               class="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
               onclick={() => store.resetRotations()}
               title="Reset"
            >
               <RefreshCcw size={14} />
            </button>
         </div>

         <button 
            onclick={() => store.reset()}
            class="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Remove File"
         >
            <Trash2 size={18} />
         </button>
      </div>

      <div class="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
         <div class="mx-auto max-w-5xl">
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
               {#each store.state.pages as _, i (i)}
                  <PageThumbnail {store} index={i} />
               {/each}
            </div>
         </div>
      </div>

      <div class="border-t border-border bg-background p-4 text-center">
        <Button
        size="lg"
        variant="dark"
        class="px-8 h-11 min-w-50"
          onclick={() => store.save()}
          disabled={store.state.isProcessing}
        >
          {#if store.state.isProcessing}
            <Loader2 class="animate-spin" /> {store.state.progress}
          {:else}
            Apply & Download <ArrowRight size={18} />
          {/if}
        </Button>
      </div>

    </div>
  {/if}
</div>