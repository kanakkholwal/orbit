<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
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
  import { ArrowRight, BookmarkPlus, LoaderCircle } from "@lucide/svelte";
  import { TableOfContentsState } from "./helper.svelte";

  const store = new TableOfContentsState();

  const fontSizes = ["10", "11", "12", "14", "16", "18", "24"];
  const fontFamilies = [
    { id: "0", label: "Times Roman" },
    { id: "1", label: "Times Bold" },
    { id: "2", label: "Times Italic" },
    { id: "4", label: "Helvetica" },
    { id: "5", label: "Helvetica Bold" },
    { id: "8", label: "Courier" },
  ];
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files[0])}
  />
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar
      label="Table of contents"
      onReset={() => store.reset()}
      resetLabel="Clear"
    />

    <ToolPanel title="Source">
      <FileRow name={store.state.file.name} onRemove={() => store.reset()}>
        <span class="font-mono tabular-nums">
          {formatBytes(store.state.file.size)}
        </span>
      </FileRow>
    </ToolPanel>

    <ToolPanel title="Format">
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <Label
            for="toc-title"
            class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
          >
            TOC title
          </Label>
          <Input
            id="toc-title"
            type="text"
            bind:value={store.state.title}
            class="h-10 rounded-sm font-mono text-sm"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-2">
            <Label
              for="font-size"
              class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
            >
              Font size
            </Label>
            <Select type="single" bind:value={store.state.fontSize}>
              <SelectTrigger class="h-10 rounded-sm" id="font-size">
                {store.state.fontSize}pt
              </SelectTrigger>
              <SelectContent>
                {#each fontSizes as size}
                  <SelectItem value={size}>{size}pt</SelectItem>
                {/each}
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-2">
            <Label
              for="font-family"
              class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
            >
              Font family
            </Label>
            <Select type="single" bind:value={store.state.fontFamily}>
              <SelectTrigger class="h-10 rounded-sm" id="font-family">
                {fontFamilies.find((f) => f.id === store.state.fontFamily)
                  ?.label || "Helvetica"}
              </SelectTrigger>
              <SelectContent>
                {#each fontFamilies as f}
                  <SelectItem value={f.id}>{f.label}</SelectItem>
                {/each}
              </SelectContent>
            </Select>
          </div>
        </div>

        <label
          class="flex cursor-pointer items-start gap-3 rounded-sm border border-border/60 bg-muted/20 px-4 py-3 text-sm transition-colors hover:bg-muted/30"
        >
          <input
            type="checkbox"
            bind:checked={store.state.addBookmark}
            class="mt-0.5 size-3.5 rounded-xs border-border accent-primary"
          />
          <span class="flex flex-col gap-0.5">
            <span class="font-medium text-foreground">
              Add bookmark entry
            </span>
            <span class="text-xs text-muted-foreground">
              Insert a bookmark pointing to the new TOC page.
            </span>
          </span>
        </label>
      </div>
    </ToolPanel>

    <ToolPanel title="Note">
      <div
        class="flex items-start gap-3 rounded-sm border border-border/60 bg-muted/20 px-4 py-3"
      >
        <span
          class="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary"
        >
          <BookmarkPlus class="size-3.5" />
        </span>
        <p class="text-xs leading-relaxed text-muted-foreground">
          The TOC is generated from your existing PDF bookmarks and inserted as
          a new clickable page at the start of the document.
        </p>
      </div>
    </ToolPanel>

    <ToolFooter hint={store.isProcessing ? store.progressLabel : "Generate TOC page"}>
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.generateTOC()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progressLabel}
        {:else}
          Generate TOC
          <ArrowRight class="size-4" />
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
