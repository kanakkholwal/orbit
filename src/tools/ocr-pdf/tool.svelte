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
  import { tesseractLanguages } from "$constants/tesseract-languages";
  import { formatBytes } from "$utils/helper";
  import {
    Check,
    ChevronDown,
    ChevronUp,
    ClipboardCopy,
    Download,
    FileText,
    Loader2,
    ScanText,
    Settings2,
    Trash2
  } from "@lucide/svelte";
  import { slide } from "svelte/transition";
  import { OcrPdfState } from "./helper.svelte";

  const store = new OcrPdfState();
  
  let showAdvanced = $state(false);
  let langSearch = $state("");
  let copied = $state(false);

  const filteredLangs = $derived(
      Object.entries(tesseractLanguages).filter(([code, name]) => 
          name.toLowerCase().includes(langSearch.toLowerCase()) || 
          code.toLowerCase().includes(langSearch.toLowerCase())
      )
  );

  function handleCopy() {
      store.copyText();
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
        <Button variant="ghost" onclick={() => store.reset()} disabled={store.isProcessing}>
          <Trash2 size={16} /> Clear
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6 space-y-6">
    <div class="max-w-4xl mx-auto space-y-6">
      
      {#if !store.isProcessing && !store.searchablePdfBytes}
          <div class="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 class="text-sm font-semibold flex items-center gap-2 border-b border-border pb-2">
                Languages in Document
            </h3>
            
            <div class="space-y-2">
                <div class="relative">
                    <Input 
                        type="text" 
                        placeholder="Search languages..." 
                        bind:value={langSearch}
                        class="bg-background shadow-sm"
                    />
                </div>
                
                <div class="max-h-48 overflow-y-auto border border-border rounded-lg p-2 bg-muted/30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
                    {#each filteredLangs as [code, name]}
                        <label class="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer text-sm transition-colors">
                            <input 
                                type="checkbox" 
                                value={code}
                                checked={store.selectedLangs.includes(code)}
                                onchange={() => store.toggleLanguage(code)}
                                class="rounded border-border text-primary focus:ring-primary w-4 h-4"
                            />
                            {name}
                        </label>
                    {/each}
                </div>
                <p class="text-xs text-muted-foreground pt-1">
                    Selected: <span class="font-semibold text-foreground">{store.selectedLangs.map(code => tesseractLanguages[code]).join(', ') || 'None'}</span>
                </p>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-card p-6 shadow-sm">
            <button 
                class="flex items-center justify-between w-full text-sm font-semibold text-left"
                onclick={() => showAdvanced = !showAdvanced}
            >
                <div class="flex items-center gap-2">
                    <Settings2 size={16} class="text-primary"/> Advanced Settings
                    <span class="text-xs font-normal text-muted-foreground ml-2 hidden sm:inline">(Recommended to improve accuracy)</span>
                </div>
                {#if showAdvanced} <ChevronUp size={16} /> {:else} <ChevronDown size={16} /> {/if}
            </button>

            {#if showAdvanced}
                <div transition:slide class="mt-6 space-y-6 border-t border-border pt-4">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <Label for="ocr-resolution">Resolution</Label>
                            <Select type="single" bind:value={store.resolution}>
                                <SelectTrigger id="ocr-resolution" class="w-full">
                                    {#if store.resolution === '2.0'} Standard (192 DPI)
                                    {:else if store.resolution === '3.0'} High (288 DPI)
                                    {:else} Ultra (384 DPI) {/if}
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2.0">Standard (192 DPI)</SelectItem>
                                    <SelectItem value="3.0">High (288 DPI)</SelectItem>
                                    <SelectItem value="4.0">Ultra (384 DPI)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div class="space-y-2 pt-8">
                            <label class="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    bind:checked={store.binarize} 
                                    class="rounded border-border text-primary focus:ring-primary w-4 h-4"
                                />
                                Binarize Image 
                                <span class="text-xs text-muted-foreground ml-1">(Enhances contrast for clean scans)</span>
                            </label>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <Label for="whitelist-preset">Character Whitelist Preset</Label>
                            <Select type="single" value={store.whitelistPreset} onValueChange={(v) => store.handlePresetChange(v as string)}>
                                <SelectTrigger id="whitelist-preset" class="w-full">
                                    {store.whitelistPreset === 'none' ? 'None (All characters)' : 
                                     store.whitelistPreset === 'custom' ? 'Custom...' : 
                                     store.whitelistPreset}
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None (All characters)</SelectItem>
                                    <SelectItem value="alphanumeric">Alphanumeric + Basic</SelectItem>
                                    <SelectItem value="numbers-currency">Numbers + Currency</SelectItem>
                                    <SelectItem value="letters-only">Letters Only</SelectItem>
                                    <SelectItem value="numbers-only">Numbers Only</SelectItem>
                                    <SelectItem value="invoice">Invoice/Receipt</SelectItem>
                                    <SelectItem value="custom">Custom...</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div class="space-y-2">
                            <Label for="ocr-whitelist">Custom Whitelist</Label>
                            <Input 
                                id="ocr-whitelist" 
                                type="text" 
                                bind:value={store.customWhitelist}
                                disabled={store.whitelistPreset !== 'custom' && store.whitelistPreset !== 'none'}
                                placeholder="e.g. abc123$.,-"
                                class="font-mono text-sm"
                            />
                            <p class="text-[10px] text-muted-foreground">Only these characters will be recognized.</p>
                        </div>
                    </div>

                </div>
            {/if}
          </div>
      {/if}

      {#if store.isProcessing}
          <div class="rounded-xl border border-border bg-card p-8 shadow-sm flex flex-col items-center justify-center space-y-6 text-center">
            <Loader2 class="animate-spin text-primary" size={48} />
            <div class="w-full max-w-md space-y-2">
                <div class="flex justify-between text-sm font-medium">
                    <span>{store.progressStatus}</span>
                    <span>{store.progressPercent.toFixed(0)}%</span>
                </div>
                <div class="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div class="h-full bg-primary transition-all duration-300" style={`width: ${store.progressPercent}%`}></div>
                </div>
            </div>
            
            <div class="w-full max-w-md bg-black text-green-400 font-mono text-xs p-3 rounded-md text-left h-32 overflow-y-auto mt-4">
                {#each store.progressLog as log}
                    <div>{log}</div>
                {/each}
            </div>
          </div>
      {/if}

      {#if store.searchablePdfBytes && !store.isProcessing}
          <div class="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div class="flex items-center gap-3 pb-4 border-b border-border">
                <div class="bg-green-500/10 text-green-500 p-2 rounded-full">
                    <Check size={24} />
                </div>
                <div>
                    <h3 class="text-lg font-bold text-foreground">OCR Complete</h3>
                    <p class="text-sm text-muted-foreground">Your searchable PDF and extracted text are ready.</p>
                </div>
            </div>

            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <Label>Extracted Text</Label>
                    <Button variant="ghost" size="sm" onclick={handleCopy} class="h-8 text-muted-foreground hover:text-foreground">
                        {#if copied}
                            <Check size={14} class="mr-1 text-green-500" /> Copied
                        {:else}
                            <ClipboardCopy size={14} class="mr-1" /> Copy Text
                        {/if}
                    </Button>
                </div>
                <textarea 
                    readonly
                    class="w-full h-48 bg-muted/30 border border-border rounded-lg p-4 font-mono text-sm resize-y focus:outline-none"
                    value={store.extractedText}
                ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <Button variant="outline" size="lg" onclick={() => store.downloadTxt()} class="w-full">
                    <Download size={16} class="mr-2" /> Download as .txt
                </Button>
                <Button variant="dark" size="lg" onclick={() => store.downloadPdf()} class="w-full">
                    <Download size={16} class="mr-2" /> Download Searchable PDF
                </Button>
            </div>
          </div>
      {/if}

    </div>
  </div>

  {#if !store.isProcessing && !store.searchablePdfBytes}
      <div class="border-t border-border p-4 text-center">
        <Button
          size="lg"
          variant="dark"
          class="px-8 h-11 min-w-50"
          onclick={() => store.process()}
          disabled={store.selectedLangs.length === 0}
        >
          Start OCR <ScanText size={18} class="ml-2" />
        </Button>
      </div>
  {/if}
{/if}