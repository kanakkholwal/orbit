<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
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
    FileText,
    Loader2,
    Settings2,
    Trash2,
    Zap
  } from "@lucide/svelte";
  import { slide } from "svelte/transition";
  import { FixPageSizeState } from "./helper.svelte";

  const store = new FixPageSizeState();
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

  <div class="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6 space-y-8">
    <div class="max-w-3xl mx-auto space-y-6">
      
      <div class="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <h3 class="text-sm font-semibold flex items-center gap-2 border-b border-border pb-3">
          <Settings2 size={16} class="text-primary"/> Resize Settings
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div class="space-y-4">
                <div class="space-y-2">
                    <Label for="target-size">Target Page Size</Label>
                    <Select type="single" bind:value={store.targetSize}>
                        <SelectTrigger id="target-size" class="w-full">
                            {#if store.targetSize === 'A4'} A4 (210 × 297 mm)
                            {:else if store.targetSize === 'Letter'} Letter (8.5 × 11 in)
                            {:else if store.targetSize === 'Legal'} Legal (8.5 × 14 in)
                            {:else if store.targetSize === 'A3'} A3 (297 × 420 mm)
                            {:else if store.targetSize === 'A5'} A5 (148 × 210 mm)
                            {:else if store.targetSize === 'Tabloid'} Tabloid (11 × 17 in)
                            {:else} Custom... {/if}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                            <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                            <SelectItem value="Legal">Legal (8.5 × 14 in)</SelectItem>
                            <SelectItem value="A3">A3 (297 × 420 mm)</SelectItem>
                            <SelectItem value="A5">A5 (148 × 210 mm)</SelectItem>
                            <SelectItem value="Tabloid">Tabloid (11 × 17 in)</SelectItem>
                            <SelectItem value="Custom">Custom...</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {#if store.targetSize === 'Custom'}
                    <div transition:slide class="grid grid-cols-3 gap-3 bg-muted/30 p-3 rounded-lg border border-border">
                        <div class="space-y-1.5">
                            <Label for="custom-width" class="text-xs">Width</Label>
                            <Input type="number" id="custom-width" step="0.01" min="0.1" bind:value={store.customWidth} class="h-9 text-sm" />
                        </div>
                        <div class="space-y-1.5">
                            <Label for="custom-height" class="text-xs">Height</Label>
                            <Input type="number" id="custom-height" step="0.01" min="0.1" bind:value={store.customHeight} class="h-9 text-sm" />
                        </div>
                        <div class="space-y-1.5">
                            <Label for="custom-units" class="text-xs">Units</Label>
                            <Select type="single" bind:value={store.customUnits}>
                                <SelectTrigger id="custom-units" class="h-9 text-sm">
                                    {store.customUnits === 'in' ? 'Inches' : 'mm'}
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="in">Inches</SelectItem>
                                    <SelectItem value="mm">mm</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                {/if}
            </div>

            <div class="space-y-2">
                <Label for="orientation">Orientation</Label>
                <Select type="single" bind:value={store.orientation}>
                    <SelectTrigger id="orientation" class="w-full">
                        {#if store.orientation === 'auto'} Auto (Keep Original)
                        {:else if store.orientation === 'portrait'} Portrait
                        {:else} Landscape {/if}
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="auto">Auto (Keep Original)</SelectItem>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="space-y-2 sm:col-span-2">
                <Label>Content Scaling</Label>
                <div class="flex flex-col sm:flex-row gap-3">
                    <label class="flex-1 flex items-start gap-3 p-4 rounded-lg border border-border cursor-pointer transition-colors hover:bg-muted/50 has-checked:bg-primary/5 has-checked:border-primary/50">
                        <input 
                            type="radio" 
                            name="scaling-mode" 
                            value="fit" 
                            bind:group={store.scalingMode}
                            class="mt-0.5 rounded-full border-border text-primary focus:ring-primary w-4 h-4"
                        />
                        <div>
                            <span class="font-medium text-sm text-foreground block">Fit Content (Add Margins)</span>
                            <span class="text-xs text-muted-foreground">Preserves all original content. May add blank margins if aspect ratios differ.</span>
                        </div>
                    </label>

                    <label class="flex-1 flex items-start gap-3 p-4 rounded-lg border border-border cursor-pointer transition-colors hover:bg-muted/50 has-checked:bg-primary/5 has-checked:border-primary/50">
                        <input 
                            type="radio" 
                            name="scaling-mode" 
                            value="fill" 
                            bind:group={store.scalingMode}
                            class="mt-0.5 rounded-full border-border text-primary focus:ring-primary w-4 h-4"
                        />
                        <div>
                            <span class="font-medium text-sm text-foreground block">Fill Page (Crop)</span>
                            <span class="text-xs text-muted-foreground">Scales content to fill the entire target page. May crop edges if aspect ratios differ.</span>
                        </div>
                    </label>
                </div>
            </div>

            <div class="space-y-2 sm:col-span-2">
                <Label for="bg-color">Background Color</Label>
                <div class="flex items-center gap-3">
                    <Input 
                        id="bg-color" 
                        type="color" 
                        class="w-20 p-1 cursor-pointer h-10" 
                        bind:value={store.backgroundColor} 
                    />
                    <div class="flex flex-col">
                        <span class="text-sm font-mono uppercase font-medium">{store.backgroundColor}</span>
                        <span class="text-xs text-muted-foreground">Color applied to empty margins if "Fit Content" is used.</span>
                    </div>
                </div>
            </div>

        </div>
      </div>
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
        <Loader2 class="animate-spin mr-2" size={18} /> Standardizing Pages...
      {:else}
        Fix Page Size <Zap size={18} class="ml-2 fill-current" />
      {/if}
    </Button>
  </div>
{/if}