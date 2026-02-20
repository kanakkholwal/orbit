<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    FileText,
    LayoutTemplate,
    Loader2,
    Trash2,
    Zap,
  } from "@lucide/svelte";
  import { HeaderFooterState } from "./helper.svelte";

  const store = new HeaderFooterState();
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    onFilesSelected={(files) => store.loadFile(files)}
  />
{:else}
  <div
    class="sticky top-0 z-20 border-b border-border bg-accent/50 p-4 rounded-lg"
  >
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-sm font-semibold flex items-center gap-2">
        <FileText size={18} class="text-primary" />
        {store.state.file.name}
        <span class="text-xs font-normal text-muted-foreground ml-2">
          {formatBytes(store.state.originalSize)} • {store.state.pageCount} Pages
        </span>
      </h2>
      <div class="flex items-center gap-2">
        <Button variant="ghost" onclick={() => store.reset()}>
          <Trash2 size={16} /> Clear
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-6 space-y-8">
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="space-y-4">
        <h3 class="text-sm font-semibold flex items-center gap-2 border-b pb-2">
          <LayoutTemplate size={16} class="text-primary" /> Formatting Options
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2">
            <Label for="page-range">Page Range (optional)</Label>
            <Input
              id="page-range"
              type="text"
              placeholder="e.g., 1-3, 5"
              bind:value={store.state.pageRange}
            />
            <p class="text-[10px] text-muted-foreground">
              Leave empty to apply to all pages.
            </p>
          </div>
          <div class="space-y-2">
            <Label for="font-size">Font Size (pt)</Label>
            <Input
              id="font-size"
              type="number"
              min="6"
              max="72"
              bind:value={store.state.fontSize}
            />
          </div>
          <div class="space-y-2">
            <Label for="font-color">Font Color</Label>
            <div class="flex items-center gap-2">
              <Input
                id="font-color"
                type="color"
                class="w-16 p-1 cursor-pointer h-10"
                bind:value={store.state.fontColor}
              />
              <span class="text-sm font-mono uppercase text-muted-foreground"
                >{store.state.fontColor}</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-sm font-semibold border-b pb-2">
          Header Configuration
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2">
            <Label for="header-left">Header Left</Label>
            <Input
              id="header-left"
              type="text"
              placeholder={"{page} of {total}"}
              bind:value={store.state.headerLeft}
            />
          </div>
          <div class="space-y-2">
            <Label for="header-center">Header Center</Label>
            <Input
              id="header-center"
              type="text"
              placeholder="Document Title"
              bind:value={store.state.headerCenter}
            />
          </div>
          <div class="space-y-2">
            <Label for="header-right">Header Right</Label>
            <Input
              id="header-right"
              type="text"
              placeholder="Date"
              bind:value={store.state.headerRight}
            />
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-sm font-semibold border-b pb-2">
          Footer Configuration
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2">
            <Label for="footer-left">Footer Left</Label>
            <Input
              id="footer-left"
              type="text"
              placeholder=""
              bind:value={store.state.footerLeft}
            />
          </div>
          <div class="space-y-2">
            <Label for="footer-center">Footer Center</Label>
            <Input
              id="footer-center"
              type="text"
              placeholder={"- {page} -"}
              bind:value={store.state.footerCenter}
            />
          </div>
          <div class="space-y-2">
            <Label for="footer-right">Footer Right</Label>
            <Input
              id="footer-right"
              type="text"
              placeholder=""
              bind:value={store.state.footerRight}
            />
          </div>
        </div>
      </div>

      <div
        class="rounded-lg bg-blue-500/10 p-4 text-xs text-blue-600 dark:text-blue-400"
      >
        <span class="font-semibold">Dynamic Variables:</span> Use
        <code>{"{page}"}</code>
        for the current page number and <code>{"{total}"}</code> for the total page
        count.
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
        <Loader2 class="animate-spin mr-2" size={18} /> Processing...
      {:else}
        Apply Header & Footer <Zap size={18} class="ml-2 fill-current" />
      {/if}
    </Button>
  </div>
{/if}
