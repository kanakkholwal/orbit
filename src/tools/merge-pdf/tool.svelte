<script lang="ts">
  import { OptionGroup, ResultCard, SegmentedControl, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { arrayMove, sortableList } from "$lib/actions/sortable-list";
  import { formatBytes } from "$utils/helper";
  import {
    IconDownload as Download,
    IconLoader2 as Loader,
    IconPlus as Plus,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { setContext } from "svelte";
  import FileModeItem from "./FileModeItem.svelte";
  import { MERGE_STATE_KEY, MergeState } from "./helper.svelte";
  import PageModeThumbnail from "./PageModeThumbnail.svelte";

  const store = new MergeState();
  setContext(MERGE_STATE_KEY, store);

  let addInput = $state<HTMLInputElement | null>(null);

  const modes = [
    { value: "file" as const, label: "Files" },
    { value: "page" as const, label: "Pages" },
  ];

  const fileListSort = {
    onReorder: (o: number, n: number) => {
      store.files = arrayMove(store.files, o, n);
      store.result = null;
    },
    options: { handle: ".drag-handle", animation: 200, ghostClass: "opacity-40", dragClass: "cursor-grabbing" },
  };

  const pageGridSort = {
    onReorder: (o: number, n: number) => {
      store.allPages = arrayMove(store.allPages, o, n);
      store.result = null;
    },
    options: { animation: 200, ghostClass: "opacity-40", dragClass: "cursor-grabbing", delay: 150, delayOnTouchOnly: true },
  };

  const fileNumber = $derived(new Map(store.files.map((f, i) => [f.id, i + 1])));
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
</script>

{#if store.files.length === 0}
  <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop PDFs to merge</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Add two or more files, put them in order, then save them as one PDF.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="mx-auto flex w-full flex-col gap-4 {store.mode === 'file' ? 'max-w-4xl' : ''}">
    {#if store.result && !store.isProcessing}
      <ResultCard
        title={`Merged into ${pageLabel(store.result.pages)}`}
        description={`${store.result.name} is downloaded.`}
      >
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadResult()}>
            <Download />
            Download again
          </Button>
          <Button variant="ghost" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="merge-pdf" />
      </ResultCard>
    {/if}

    <ToolBar
      label={store.mode === "file" ? "Files" : "Pages"}
      count={store.mode === "file" ? store.files.length : store.allPages.length}
      meta={store.mode === "file" ? formatBytes(store.totalSize) : `from ${store.files.length} files`}
      onReset={store.isProcessing ? undefined : () => store.reset()}
      resetLabel="Clear all"
    >
      {#snippet actions()}
        <SegmentedControl name="merge-mode" options={modes} bind:value={store.mode} size="sm" class="w-40" />
        <Button variant="outline" size="sm" disabled={store.isProcessing} onclick={() => addInput?.click()}>
          <Plus />
          <span class="hidden sm:inline">Add files</span>
          <span class="sr-only sm:hidden">Add files</span>
        </Button>
      {/snippet}
    </ToolBar>

    {#if store.mode === "file"}
      <p class="text-body text-muted-foreground">
        Files are joined top to bottom. Drag a row or use the arrows to reorder.
      </p>
      <div class="flex flex-col gap-2" use:sortableList={fileListSort}>
        {#each store.files as file, i (file.id)}
          <FileModeItem {file} index={i} total={store.files.length} {store} />
        {/each}
      </div>
    {:else if store.allPages.length === 0}
      <div class="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <Loader class="size-5 animate-spin text-primary" />
        <p class="text-body">Loading pages</p>
      </div>
    {:else}
      <p class="text-body text-muted-foreground">
        Drag pages into the order you want. Removed pages are left out of the merged file.
      </p>
      <div
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        use:sortableList={pageGridSort}
      >
        {#each store.allPages as item, i (item.id)}
          <PageModeThumbnail {item} {store} position={i + 1} fileNumber={fileNumber.get(item.fileId) ?? 0} />
        {/each}
      </div>
    {/if}

    <input
      bind:this={addInput}
      type="file"
      accept=".pdf,application/pdf"
      multiple
      class="hidden"
      onchange={(e) => {
        const picked = Array.from(e.currentTarget.files ?? []);
        if (picked.length > 0) store.addFiles(picked);
        e.currentTarget.value = "";
      }}
    />
  </div>

  <WorkspaceInspector title="Output">
    <div class="flex flex-col gap-6">
      <OptionGroup label="File name" description="Saved to your downloads as a PDF.">
        <label for="merge-output-name" class="sr-only">File name</label>
        <input
          id="merge-output-name"
          type="text"
          bind:value={store.outputName}
          placeholder="merged.pdf"
          class="h-10 w-full rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring"
        />
      </OptionGroup>

      <OptionGroup label="Result">
        <dl class="flex flex-col divide-y divide-border rounded-xl border border-border">
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Files</dt>
            <dd class="font-medium tabular-nums text-foreground">{store.files.length}</dd>
          </div>
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Pages</dt>
            <dd class="font-medium tabular-nums text-foreground">{store.resultPageCount}</dd>
          </div>
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Order</dt>
            <dd class="font-medium text-foreground">{store.mode === "file" ? "By file" : "Custom pages"}</dd>
          </div>
        </dl>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Merging {pageLabel(store.resultPageCount)}…
        </span>
      {:else if store.hasRangeIssues}
        <span class="block truncate text-destructive">Fix the highlighted page ranges to continue.</span>
      {:else if store.files.length === 1 && store.mode === "file"}
        <span class="block truncate">Add another file to merge.</span>
      {:else}
        <span class="block truncate tabular-nums">
          {store.files.length} files · {pageLabel(store.resultPageCount)} in the result
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.mergeAndDownload()} disabled={!store.canMerge}>
      {store.isProcessing ? "Merging…" : `Merge ${store.files.length} ${store.files.length === 1 ? "file" : "files"}`}
    </Button>
  </ToolFooter>
{/if}
