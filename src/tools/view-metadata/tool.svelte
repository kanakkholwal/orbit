<script lang="ts">
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    Check,
    Copy,
    FileSearch,
    FileText,
    Loader2,
    Trash2
  } from "@lucide/svelte";
  import { ViewMetadataState } from "./helper.svelte";

  const store = new ViewMetadataState();
  let copied = $state(false);

  function handleCopy() {
      store.copyAsJson();
      copied = true;
      setTimeout(() => copied = false, 2000);
  }
</script>

{#if !store.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files)}
  />
{:else}
  <div class="sticky top-0 z-20 border-b border-border bg-accent/50 p-4 rounded-lg">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-sm font-semibold flex items-center gap-2">
        <FileText size={18} class="text-primary" />
        {store.file.file.name}
        <span class="text-xs font-normal text-muted-foreground ml-2">
          {formatBytes(store.file.originalSize)}
        </span>
      </h2>
      <div class="flex items-center gap-2">
        <Button variant="ghost" onclick={() => store.reset()}>
          <Trash2 size={16} /> Clear
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6 space-y-6">
    <div class="max-w-4xl mx-auto space-y-6">
      
      {#if store.isProcessing}
          <div class="rounded-xl border border-border bg-card p-12 shadow-sm flex flex-col items-center justify-center space-y-4">
            <Loader2 class="animate-spin text-primary" size={32} />
            <p class="text-sm font-medium text-muted-foreground">Reading Document Metadata...</p>
          </div>
      {:else}
          
          <div class="flex items-center justify-between">
             <h3 class="text-lg font-bold text-foreground flex items-center gap-2">
                 <FileSearch size={20} class="text-primary"/> Document Properties
             </h3>
             <Button variant="outline" size="sm" onclick={handleCopy} disabled={Object.keys(store.flatMetadataRecord).length === 0}>
                 {#if copied}
                    <Check size={14} class="mr-2 text-green-500" /> Copied
                 {:else}
                    <Copy size={14} class="mr-2" /> Copy as JSON
                 {/if}
             </Button>
          </div>

          {#if store.infoDictionary}
              <div class="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                  <div class="bg-muted/50 px-4 py-3 border-b border-border font-semibold text-sm">
                      {store.infoDictionary.title}
                  </div>
                  <ul class="divide-y divide-border/50 text-sm">
                      {#if store.infoDictionary.items.length === 0}
                          <li class="p-4 text-muted-foreground italic text-center">No Info Dictionary data found.</li>
                      {:else}
                          {#each store.infoDictionary.items as item}
                              <li class="flex flex-col sm:flex-row p-4 hover:bg-muted/20 transition-colors">
                                  <strong class="w-48 shrink-0 text-muted-foreground font-medium mb-1 sm:mb-0">{item.key}</strong>
                                  <div class="flex-1 text-foreground break-all">{item.value}</div>
                              </li>
                          {/each}
                      {/if}
                  </ul>
              </div>
          {/if}

          {#if store.xmpMetadata}
              <div class="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                  <div class="bg-muted/50 px-4 py-3 border-b border-border font-semibold text-sm">
                      {store.xmpMetadata.title}
                  </div>
                  <ul class="divide-y divide-border/50 text-sm">
                      {#if store.xmpMetadata.items.length === 0}
                          {#if store.xmpMetadata.rawString}
                              <li class="p-4">
                                  <p class="text-destructive text-xs italic mb-2">Could not parse XML. Showing raw XMP string:</p>
                                  <pre class="text-xs text-muted-foreground whitespace-pre-wrap break-all bg-muted p-4 rounded-md">{store.xmpMetadata.rawString}</pre>
                              </li>
                          {:else}
                              <li class="p-4 text-muted-foreground italic text-center">No XMP metadata found.</li>
                          {/if}
                      {:else}
                          {#each store.xmpMetadata.items as item}
                              <li class="flex flex-col sm:flex-row p-4 hover:bg-muted/20 transition-colors" style="padding-left: {1 + (item.indentLevel * 1.5)}rem">
                                  {#if item.value === ''}
                                      <strong class="w-full text-foreground font-semibold">{item.key}</strong>
                                  {:else}
                                      <strong class="w-48 shrink-0 text-muted-foreground font-medium mb-1 sm:mb-0">{item.key}</strong>
                                      <div class="flex-1 text-foreground break-all">{item.value}</div>
                                  {/if}
                              </li>
                          {/each}
                      {/if}
                  </ul>
              </div>
          {/if}

          {#if store.formFields && store.formFields.items.length > 0}
              <div class="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                  <div class="bg-muted/50 px-4 py-3 border-b border-border font-semibold text-sm">
                      {store.formFields.title}
                  </div>
                  <ul class="divide-y divide-border/50 text-sm">
                      {#each store.formFields.items as item}
                          <li class="flex flex-col sm:flex-row p-4 hover:bg-muted/20 transition-colors">
                              <strong class="w-48 shrink-0 text-muted-foreground font-medium mb-1 sm:mb-0">{item.key}</strong>
                              <div class="flex-1 text-foreground break-all">{item.value}</div>
                          </li>
                      {/each}
                  </ul>
              </div>
          {/if}

      {/if}
    </div>
  </div>
{/if}