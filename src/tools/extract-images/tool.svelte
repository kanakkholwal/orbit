<script lang="ts">
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    Download,
    FileQuestion,
    FileText,
    Image as ImageIcon,
    Loader2,
    Trash2,
    Zap
  } from "@lucide/svelte";
  import { ExtractImagesState } from "./helper.svelte";

  const store = new ExtractImagesState();
</script>

{#if store.files.length === 0}
  <UploadArea
    accept=".pdf"
    multiple={true}
    onFilesSelected={(files) => store.addFiles(files)}
  />
{:else}
  <div class="sticky top-0 z-20 border-b border-border bg-accent/50 p-4 rounded-lg">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-sm font-semibold flex items-center gap-2">
        {#if store.extractionDone}
            <ImageIcon size={18} class="text-primary" />
            {store.extractedImages.length} Image{store.extractedImages.length !== 1 ? "s" : ""} Extracted
        {:else}
            <FileText size={18} class="text-primary" />
            {store.files.length} File{store.files.length > 1 ? "s" : ""} Selected
        {/if}
      </h2>
      <div class="flex items-center gap-2">
        <Button variant="ghost" onclick={() => store.reset()}>
          <Trash2 size={16} /> Start Over
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-6 space-y-8">
    
    {#if !store.extractionDone}
        <div class="grid gap-3 max-w-3xl mx-auto">
          {#each store.files as file (file.id)}
            <div class="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-xs">
              <div class="min-w-0 flex-1">
                <div class="truncate font-medium">{file.file.name}</div>
                <div class="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatBytes(file.originalSize)}</span>
                </div>
              </div>
              <Button
                variant="destructive_soft"
                size="icon-sm"
                onclick={() => store.removeFile(file.id)}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          {/each}

          <div class="mt-4 flex justify-center">
              <UploadArea 
                accept=".pdf" 
                multiple={true} 
                onFilesSelected={(files) => store.addFiles(files)} 
              />
          </div>
        </div>
        
    {:else}
        <div class="max-w-6xl mx-auto">
            {#if store.extractedImages.length === 0}
                <div class="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-lg border border-border border-dashed">
                    <FileQuestion size={40} class="mb-4 opacity-50" />
                    <p class="text-lg font-medium">No Images Found</p>
                    <p class="text-sm mt-1">We couldn't find any embedded images in the provided documents.</p>
                </div>
            {:else}
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {#each store.extractedImages as image (image.id)}
                        <div class="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                            <div class="aspect-square bg-muted/50 flex items-center justify-center overflow-hidden p-2">
                                <img 
                                    src={image.url} 
                                    alt={image.name} 
                                    class="max-w-full max-h-full object-contain drop-shadow-sm" 
                                />
                            </div>
                            
                            <div class="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur border-t border-border p-2 translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-between">
                                <span class="text-xs font-medium truncate pr-2" title={image.name}>
                                    {image.name}
                                </span>
                                <Button 
                                    variant="dark" 
                                    size="icon-sm" 
                                    class="shrink-0"
                                    title="Download Image"
                                    onclick={() => store.downloadSingle(image.id)}
                                >
                                    <Download size={14} />
                                </Button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
  </div>

  <div class="border-t border-border p-4 text-center">
    {#if !store.extractionDone}
        <Button
          size="lg"
          variant="dark"
          class="px-8 h-11 min-w-50"
          onclick={() => store.extract()}
          disabled={store.isProcessing || store.files.length === 0}
        >
          {#if store.isProcessing}
            <Loader2 class="animate-spin mr-2" size={18} /> {store.progress.text}
          {:else}
            Extract Images <Zap size={18} class="ml-2 fill-current" />
          {/if}
        </Button>
    {:else if store.extractedImages.length > 0}
        <Button
          size="lg"
          variant="dark"
          class="px-8 h-11 min-w-50"
          onclick={() => store.downloadAll()}
          disabled={store.isProcessing}
        >
          {#if store.isProcessing}
            <Loader2 class="animate-spin mr-2" size={18} /> {store.progress.text}
          {:else}
            Download All (ZIP) <Download size={18} class="ml-2" />
          {/if}
        </Button>
    {/if}
  </div>
{/if}