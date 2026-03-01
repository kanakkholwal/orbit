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
    AlertTriangle,
    Download,
    FileImage,
    FileText,
    Loader2,
    Trash2
  } from "@lucide/svelte";
  import { slide } from "svelte/transition";
  import { PageDimensionsState } from "./helper.svelte";

  const store = new PageDimensionsState();
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
        <Button variant="ghost" onclick={() => store.reset()} disabled={store.isProcessing}>
          <Trash2 size={16} /> Clear
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6 space-y-6">
    <div class="max-w-6xl mx-auto space-y-6">
      
      {#if store.isProcessing}
          <div class="flex flex-col items-center justify-center py-20 text-muted-foreground">
             <Loader2 class="animate-spin mb-4 text-primary" size={32} />
             <p>Analyzing page dimensions...</p>
          </div>
      {:else if store.analyzedPagesData.length > 0}
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Pages</p>
                  <p class="text-3xl font-bold text-foreground">{store.summaryStats.totalPages}</p>
              </div>
              <div class="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Unique Sizes</p>
                  <p class="text-3xl font-bold text-foreground">{store.summaryStats.uniqueSizesCount}</p>
              </div>
              <div class="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Document Type</p>
                  <p class="text-3xl font-bold {store.summaryStats.hasMixedSizes ? 'text-amber-500' : 'text-emerald-500'}">
                      {store.summaryStats.hasMixedSizes ? 'Mixed Sizes' : 'Uniform'}
                  </p>
              </div>
          </div>

          {#if store.summaryStats.hasMixedSizes}
              <div transition:slide class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm flex gap-4 text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={24} class="shrink-0 mt-0.5" />
                  <div>
                      <h4 class="font-semibold text-sm mb-2">Mixed Page Sizes Detected</h4>
                      <p class="text-xs opacity-90 mb-3">This document contains pages with varying dimensions. This might cause issues if you plan to print it.</p>
                      <ul class="text-xs opacity-80 space-y-1 ml-4 list-disc">
                          {#each store.summaryStats.uniqueSizes as size}
                              <li>{size.label}: {size.count} page{size.count > 1 ? 's' : ''}</li>
                          {/each}
                      </ul>
                  </div>
              </div>
          {/if}

          <div class="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              
              <div class="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div class="flex items-center gap-3">
                      <Label for="units-select" class="font-medium">Display Units:</Label>
                      <Select type="single" bind:value={store.selectedUnit}>
                          <SelectTrigger id="units-select" class="w-36 h-9 bg-background">
                              {#if store.selectedUnit === 'pt'} Points (pt)
                              {:else if store.selectedUnit === 'in'} Inches (in)
                              {:else if store.selectedUnit === 'mm'} Millimeters (mm)
                              {:else} Pixels (px) {/if}
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="in">Inches (in)</SelectItem>
                              <SelectItem value="mm">Millimeters (mm)</SelectItem>
                              <SelectItem value="pt">Points (pt)</SelectItem>
                              <SelectItem value="px">Pixels (px)</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>

                  <Button variant="outline" size="sm" onclick={() => store.exportToCSV()}>
                      <Download size={14} class="mr-2" /> Export to CSV
                  </Button>
              </div>

              <div class="overflow-x-auto">
                  <table class="w-full text-sm text-left">
                      <thead class="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                          <tr>
                              <th class="px-5 py-3 font-semibold">Page</th>
                              <th class="px-5 py-3 font-semibold">Dimensions</th>
                              <th class="px-5 py-3 font-semibold">Standard Size</th>
                              <th class="px-5 py-3 font-semibold">Orientation</th>
                              <th class="px-5 py-3 font-semibold">Aspect Ratio</th>
                              <th class="px-5 py-3 font-semibold">Area</th>
                              <th class="px-5 py-3 font-semibold">Rotation</th>
                          </tr>
                      </thead>
                      <tbody class="divide-y divide-border/50">
                          {#each store.analyzedPagesData as page}
                              <tr class="hover:bg-muted/30 transition-colors">
                                  <td class="px-5 py-3 font-medium text-foreground">{page.pageNum}</td>
                                  <td class="px-5 py-3 tabular-nums">
                                      {store.convertPoints(page.width, store.selectedUnit)} × {store.convertPoints(page.height, store.selectedUnit)} {store.selectedUnit}
                                  </td>
                                  <td class="px-5 py-3">
                                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {page.standardSize === 'Custom' ? 'bg-secondary text-secondary-foreground' : 'bg-primary/10 text-primary'}">
                                          {page.standardSize}
                                      </span>
                                  </td>
                                  <td class="px-5 py-3 flex items-center gap-2">
                                      {#if page.orientation === 'Landscape'} <FileImage size={14} class="rotate-90 opacity-50" />
                                      {:else} <FileImage size={14} class="opacity-50" /> {/if}
                                      {page.orientation}
                                  </td>
                                  <td class="px-5 py-3 tabular-nums">{store.getAspectRatio(page.width, page.height)}</td>
                                  <td class="px-5 py-3 tabular-nums">{store.calculateArea(page.width, page.height, store.selectedUnit)}</td>
                                  <td class="px-5 py-3 tabular-nums">{page.rotation}°</td>
                              </tr>
                          {/each}
                      </tbody>
                  </table>
              </div>
          </div>
      {/if}
    </div>
  </div>
{/if}