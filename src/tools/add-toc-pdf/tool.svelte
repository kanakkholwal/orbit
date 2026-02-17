<script lang="ts">
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    ArrowRight,
    FileText,
    Loader2,
    Settings2,
    Trash2,
  } from "@lucide/svelte";
  import { TableOfContentsState } from "./helper.svelte";

  const store = new TableOfContentsState();
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files[0])}
  />
{:else}
  <div class="flex flex-col h-full">
    <div class="border-b border-border bg-background/50 p-6 backdrop-blur-sm">
      <div
        class="mx-auto flex max-w-2xl items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
      >
        <div class="flex items-center gap-4 overflow-hidden">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"
          >
            <FileText size={20} />
          </div>
          <div class="min-w-0">
            <h3 class="truncate text-sm font-medium">
              {store.state.file.name}
            </h3>
            <p class="text-xs text-muted-foreground">
              {formatBytes(store.state.file.size)}
            </p>
          </div>
        </div>
        <button
          onclick={() => store.reset()}
          class="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto bg-muted/10 p-6">
      <div class="mx-auto max-w-lg space-y-8">
        <div
          class="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div class="flex items-center gap-2 border-b border-border pb-4 mb-4">
            <Settings2 size={18} class="text-primary" />
            <h3 class="font-semibold">Format Options</h3>
          </div>

          <div class="space-y-2">
            <label for="toc-title" class="text-sm font-medium"
              >TOC Page Title</label
            >
            <input
              id="toc-title"
              type="text"
              bind:value={store.state.title}
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div class="space-y-2">
            <label for="font-size" class="text-sm font-medium">Font Size</label>
            <select
              id="font-size"
              bind:value={store.state.fontSize}
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="10">10pt</option>
              <option value="11">11pt</option>
              <option value="12">12pt</option>
              <option value="14">14pt</option>
              <option value="16">16pt</option>
              <option value="18">18pt</option>
              <option value="24">24pt</option>
            </select>
          </div>

          <div class="space-y-2">
            <label for="font-family" class="text-sm font-medium"
              >Font Family</label
            >
            <select
              id="font-family"
              bind:value={store.state.fontFamily}
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="0">Times Roman</option>
              <option value="1">Times Bold</option>
              <option value="2">Times Italic</option>
              <option value="4">Helvetica</option>
              <option value="5">Helvetica Bold</option>
              <option value="8">Courier</option>
            </select>
          </div>

          <div class="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="add-bookmark"
              bind:checked={store.state.addBookmark}
              class="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
            />
            <label
              for="add-bookmark"
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Add bookmark entry for TOC page
            </label>
          </div>
        </div>

        <div
          class="rounded-lg bg-blue-500/10 p-4 text-xs text-blue-600 dark:text-blue-400"
        >
          <p class="font-medium mb-1">Note:</p>
          <p>
            This tool uses your existing PDF bookmarks to generate a clickable
            Table of Contents page at the beginning of the document.
          </p>
        </div>
      </div>
    </div>

    <div class="border-t border-border bg-background p-4 text-center">
      <button
        onclick={() => store.generateTOC()}
        disabled={store.state.isProcessing}
        class="inline-flex h-11 min-w-50 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {#if store.state.isProcessing}
          <Loader2 class="animate-spin" /> {store.state.progress}
        {:else}
          Generate TOC <ArrowRight size={18} />
        {/if}
      </button>
    </div>
  </div>
{/if}
