<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Label } from "$components/ui/label";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$components/ui/select";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    AlignLeft,
    CheckCircle2,
    FileText,
    Loader2,
    MinusCircle,
    Settings2,
    Trash2
  } from "@lucide/svelte";
  import { DeskewPdfState } from "./helper.svelte";

  const store = new DeskewPdfState();
  let uploadArea: ReturnType<typeof UploadArea>;
</script>

<UploadArea
  bind:this={uploadArea}
  accept=".pdf"
  multiple={true}
  onFilesSelected={(files) => store.addFiles(files)}
  class={store.files.length > 0 ? "hidden" : ""}
/>
{#if store.files.length > 0}
  <div class="sticky top-0 z-20 border-b border-border bg-accent/50 p-4 rounded-lg">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-sm font-semibold flex items-center gap-2">
        <AlignLeft size={18} class="text-primary" />
        {store.files.length} Document{store.files.length > 1 ? "s" : ""} Selected
      </h2>
      <div class="flex items-center gap-2">
        <Button variant="ghost" onclick={() => uploadArea.click()} disabled={store.isProcessing}>
          Add More
        </Button>
        <Button variant="ghost" onclick={() => store.reset()} disabled={store.isProcessing}>
          <Trash2 size={16} /> Clear All
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6 space-y-6">
    <div class="max-w-4xl mx-auto space-y-6">
      
      <div class="grid gap-3">
        {#each store.files as file (file.id)}
          <div class="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary/30">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="bg-indigo-500/10 text-indigo-500 p-2 rounded-lg shrink-0">
                  <FileText size={20} />
              </div>
              <div class="min-w-0">
                <div class="truncate font-medium text-sm text-foreground">{file.file.name}</div>
                <div class="text-xs text-muted-foreground">{formatBytes(file.originalSize)}</div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 ml-2"
              onclick={() => store.removeFile(file.id)}
              disabled={store.isProcessing}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        {/each}
      </div>

    

      <div class="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <h3 class="text-sm font-semibold flex items-center gap-2 border-b border-border pb-3">
          <Settings2 size={16} class="text-primary"/> Deskew Settings
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <Label for="deskew-threshold">Skew Threshold (degrees)</Label>
                <Select type="single" bind:value={store.threshold}>
                    <SelectTrigger id="deskew-threshold" class="w-full">
                        {#if store.threshold === '0.1'} 0.1° (Very Sensitive)
                        {:else if store.threshold === '0.5'} 0.5° (Default)
                        {:else if store.threshold === '1.0'} 1.0° (Normal)
                        {:else} 2.0° (Less Sensitive) {/if}
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0.1">0.1° (Very Sensitive)</SelectItem>
                        <SelectItem value="0.5">0.5° (Default)</SelectItem>
                        <SelectItem value="1.0">1.0° (Normal)</SelectItem>
                        <SelectItem value="2.0">2.0° (Less Sensitive)</SelectItem>
                    </SelectContent>
                </Select>
                <p class="text-xs text-muted-foreground pt-1">Pages with skew below this angle won't be modified.</p>
            </div>

            <div class="space-y-2">
                <Label for="deskew-dpi">Processing Quality (DPI)</Label>
                <Select type="single" bind:value={store.dpi}>
                    <SelectTrigger id="deskew-dpi" class="w-full">
                        {#if store.dpi === '100'} 100 DPI (Fast)
                        {:else if store.dpi === '150'} 150 DPI (Default)
                        {:else if store.dpi === '200'} 200 DPI (Better)
                        {:else} 300 DPI (Best Quality) {/if}
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="100">100 DPI (Fast)</SelectItem>
                        <SelectItem value="150">150 DPI (Default)</SelectItem>
                        <SelectItem value="200">200 DPI (Better)</SelectItem>
                        <SelectItem value="300">300 DPI (Best Quality)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      {#if store.lastResult}
          <div class="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-sm">
              <h3 class="text-emerald-700 dark:text-emerald-400 font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} /> Deskew Results <span class="font-normal text-sm ml-2 opacity-80">({store.lastProcessedFileName})</span>
              </h3>
              
              <div class="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-emerald-500/20">
                  <div>
                      <p class="text-xs font-semibold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider">Total Pages</p>
                      <p class="text-2xl font-bold text-foreground">{store.lastResult.totalPages}</p>
                  </div>
                  <div>
                      <p class="text-xs font-semibold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider">Pages Corrected</p>
                      <p class="text-2xl font-bold text-foreground">{store.lastResult.correctedPages}</p>
                  </div>
              </div>

              <div class="max-h-48 overflow-y-auto pr-2 space-y-1">
                  {#each store.lastResult.angles as angle, idx}
                      <div class="flex items-center justify-between text-sm py-1.5 px-2 rounded-md hover:bg-background/50">
                          <span class="text-muted-foreground font-medium">Page {idx + 1}</span>
                          <div class="flex items-center gap-2">
                              <span class="tabular-nums font-mono {store.lastResult.corrected[idx] ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-muted-foreground'}">
                                  {angle > 0 ? '+' : ''}{angle.toFixed(2)}°
                              </span>
                              {#if store.lastResult.corrected[idx]}
                                  <span class="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Fixed</span>
                              {:else}
                                  <MinusCircle size={14} class="text-muted-foreground/50" />
                              {/if}
                          </div>
                      </div>
                  {/each}
              </div>
          </div>
      {/if}

    </div>
  </div>

  <div class="border-t border-border p-4 text-center">
    <Button
      size="lg"
      variant="dark"
      class="px-8 h-11 min-w-50"
      onclick={() => store.process()}
      disabled={store.isProcessing}
    >
      {#if store.isProcessing}
        <Loader2 class="animate-spin mr-2" size={18} /> {store.progress.text || 'Processing...'}
      {:else}
        Straighten PDF <AlignLeft size={18} class="ml-2" />
      {/if}
    </Button>
  </div>
{/if}