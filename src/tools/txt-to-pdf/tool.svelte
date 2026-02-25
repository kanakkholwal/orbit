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
    AlignLeft,
    FileText,
    Keyboard,
    Loader2,
    Settings2,
    Trash2,
    UploadCloud,
    Zap
  } from "@lucide/svelte";
  import { TxtToPdfState } from "./helper.svelte";

  const store = new TxtToPdfState();
</script>

<div class="flex-1 overflow-y-auto p-6 space-y-8">
  <div class="max-w-4xl mx-auto space-y-8">
    
    <div class="flex gap-2 p-1 rounded-lg bg-muted border border-border w-full max-w-md mx-auto">
      <Button 
        variant={store.mode === 'upload' ? 'dark' : 'ghost'} 
        class="flex-1 gap-2"
        onclick={() => store.mode = 'upload'}
      >
        <UploadCloud size={16} /> Upload Files
      </Button>
      <Button 
        variant={store.mode === 'text' ? 'dark' : 'ghost'} 
        class="flex-1 gap-2"
        onclick={() => store.mode = 'text'}
      >
        <Keyboard size={16} /> Type Text
      </Button>
    </div>

    {#if store.mode === 'upload'}
      {#if store.files.length === 0}
        <UploadArea
          accept=".txt, text/plain"
          multiple={true}
          onFilesSelected={(files) => store.addFiles(files)}
        />
      {:else}
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold flex items-center gap-2">
                    <FileText size={18} class="text-primary" />
                    {store.files.length} File{store.files.length > 1 ? "s" : ""} Selected
                </h3>
                <Button variant="ghost" size="sm" onclick={() => store.reset()}>
                    <Trash2 size={16} class="mr-2"/> Clear All
                </Button>
            </div>
            
            <div class="grid gap-3">
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
            </div>

            <UploadArea
                accept=".txt, text/plain"
                multiple={true}
                onFilesSelected={(files) => store.addFiles(files)}
            />
        </div>
      {/if}
    {/if}

    {#if store.mode === 'text'}
      <div class="space-y-2">
        <div class="flex items-center justify-between">
            <Label class="text-sm font-medium flex items-center gap-2">
                <AlignLeft size={16} class="text-primary"/> Document Content
            </Label>
            <span class="text-xs text-muted-foreground">
                Auto-detects RTL (Arabic, Hebrew, Persian)
            </span>
        </div>
        <textarea
          bind:value={store.textContent}
          dir={store.textDirection}
          rows="12"
          class="w-full bg-background border border-input rounded-lg p-3 font-sans shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-y"
          placeholder="Start typing or paste your text here..."
        ></textarea>
      </div>
    {/if}

    <div class="space-y-4">
      <h3 class="text-sm font-semibold flex items-center gap-2 border-b border-border pb-2">
        <Settings2 size={16} class="text-primary"/> Formatting Options
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        
        <div class="space-y-2">
          <Label for="font-family">Font Family</Label>
          <Select type="single" bind:value={store.settings.fontFamily}>
            <SelectTrigger id="font-family" class="w-full h-10">
              {#if store.settings.fontFamily === 'helv'} Helvetica (Sans-serif)
              {:else if store.settings.fontFamily === 'tiro'} Tiro (Serif)
              {:else if store.settings.fontFamily === 'cour'} Courier (Monospace)
              {:else} Times (Serif) {/if}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="helv">Helvetica (Sans-serif)</SelectItem>
              <SelectItem value="tiro">Tiro (Serif)</SelectItem>
              <SelectItem value="cour">Courier (Monospace)</SelectItem>
              <SelectItem value="times">Times (Serif)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="font-size">Font Size (pt)</Label>
          <Input 
            id="font-size" 
            type="number" 
            min="6" max="72" 
            bind:value={store.settings.fontSize} 
          />
        </div>

        <div class="space-y-2">
          <Label for="text-color">Text Color</Label>
          <div class="flex items-center gap-2">
            <Input 
              id="text-color" 
              type="color" 
              class="w-16 p-1 cursor-pointer h-10" 
              bind:value={store.settings.textColor} 
            />
            <span class="text-sm font-mono uppercase text-muted-foreground">{store.settings.textColor}</span>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="page-size">Page Size</Label>
          <Select type="single" bind:value={store.settings.pageSize}>
            <SelectTrigger id="page-size" class="w-full h-10">
              {store.settings.pageSize}
            </SelectTrigger>
            <SelectContent class="max-h-75 overflow-y-auto">
                <SelectItem value="A3">A3</SelectItem>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="A5">A5</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
            </SelectContent>
          </Select>
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
    disabled={store.isProcessing || (store.mode === 'upload' && store.files.length === 0) || (store.mode === 'text' && !store.textContent)}
  >
    {#if store.isProcessing}
      <Loader2 class="animate-spin mr-2" size={18} /> {store.progress.text}
    {:else}
      Convert to PDF <Zap size={18} class="ml-2 fill-current" />
    {/if}
  </Button>
</div>