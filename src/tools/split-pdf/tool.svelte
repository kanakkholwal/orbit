<script lang="ts">
  import { OptionGroup, ProgressLine, ResultCard, SegmentedControl, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { IconDownload as Download, IconLoader2 as Loader, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { SplitState, type SplitMode } from "./helper.svelte";
  import PageThumbnail from "./PageThumbnail.svelte";

  const store = new SplitState();
  const uid = $props.id();

  const modes: { value: SplitMode; label: string }[] = [
    { value: "visual", label: "Pick pages" },
    { value: "n-times", label: "Every few pages" },
  ];

  const picking = $derived(store.mode !== "n-times");
  const total = $derived(store.pageCount);
  const selected = $derived(store.selectedPages.size);
  const rangeIssue = $derived(store.rangeIssue);
  const nIssue = $derived(store.nTimesIssue);
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
  const fileLabel = (n: number) => `${n} ${n === 1 ? "file" : "files"}`;

  const canSplit = $derived(
    !store.isProcessing && (picking ? selected > 0 && !rangeIssue : !nIssue)
  );

  const resultTitle = $derived.by(() => {
    const r = store.result;
    if (!r) return "";
    return r.kind === "zip" ? `Split into ${fileLabel(r.parts)}` : `Saved ${pageLabel(r.pages)} as a new PDF`;
  });
</script>

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files[0])}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to split</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Pull out the pages you need, or cut the file into smaller files of equal length.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard
        title={resultTitle}
        description={store.result.kind === "zip"
          ? `${store.result.name} holds ${fileLabel(store.result.parts)} and is downloaded.`
          : `${store.result.name} is downloaded.`}
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
        {#if store.result.kind === "pdf"}
          <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="split-pdf" />
        {/if}
      </ResultCard>
    {/if}

    <ToolBar
      label={picking ? `${selected} of ${total} selected` : "Pages"}
      count={picking ? undefined : total}
      meta={store.fileName}
      onReset={store.isProcessing ? undefined : () => store.reset()}
      resetLabel="Close file"
    >
      {#snippet actions()}
        {#if picking}
          <Button
            variant="outline"
            size="sm"
            disabled={selected === total || store.isProcessing}
            onclick={() => store.selectAll()}
          >
            Select all
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selected === 0 || store.isProcessing}
            onclick={() => store.clearSelection()}
          >
            Clear selection
          </Button>
        {/if}
      {/snippet}
    </ToolBar>

    <p class="text-body text-muted-foreground">
      {picking
        ? "Tap the pages you want in the new PDF. Tap again to leave a page out."
        : `Each new file gets ${pageLabel(store.chunkSize)}. The label under a page shows which file it goes in.`}
    </p>

    {#key store.mode}
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {#each { length: total } as _, i (i)}
          <PageThumbnail {store} index={i} part={picking ? undefined : Math.floor(i / store.chunkSize) + 1} />
        {/each}
      </div>
    {/key}
  </div>

  <WorkspaceInspector title="Split">
    <div class="flex flex-col gap-6">
      <OptionGroup
        label="How to split"
        description={picking
          ? "Save the pages you pick as one new PDF."
          : "Cut the PDF into files of the same length, saved together in a ZIP."}
      >
        <SegmentedControl name="split-mode" options={modes} bind:value={store.mode} />
      </OptionGroup>

      {#if picking}
        <OptionGroup
          label="Page numbers"
          description="Type pages and ranges, like 1-5, 8. Tapping pages fills this in for you."
        >
          <label for={`${uid}-range`} class="sr-only">Pages to keep</label>
          <input
            id={`${uid}-range`}
            type="text"
            inputmode="numeric"
            value={store.rangeInput}
            oninput={(e) => store.setRangeInput(e.currentTarget.value)}
            placeholder="1-5, 8"
            aria-invalid={rangeIssue ? "true" : undefined}
            aria-describedby={rangeIssue ? `${uid}-range-issue` : undefined}
            class="h-10 w-full rounded-lg border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring {rangeIssue
              ? 'border-destructive'
              : 'border-border'}"
          />
          {#if rangeIssue}
            <span id={`${uid}-range-issue`} class="text-caption text-destructive">{rangeIssue}</span>
          {/if}
        </OptionGroup>
      {:else}
        <OptionGroup label="Pages in each file">
          <label for={`${uid}-chunk`} class="sr-only">Pages in each file</label>
          <input
            id={`${uid}-chunk`}
            type="number"
            min="1"
            max={Math.max(1, total - 1)}
            step="1"
            bind:value={store.nTimesValue}
            aria-invalid={nIssue ? "true" : undefined}
            aria-describedby={nIssue ? `${uid}-chunk-issue` : undefined}
            class="h-10 w-full rounded-lg border bg-background px-3 text-body tabular-nums text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring {nIssue
              ? 'border-destructive'
              : 'border-border'}"
          />
          {#if nIssue}
            <span id={`${uid}-chunk-issue`} class="text-caption text-destructive">{nIssue}</span>
          {/if}
        </OptionGroup>
      {/if}

      <OptionGroup label="Result">
        <dl class="flex flex-col divide-y divide-border rounded-xl border border-border">
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Pages now</dt>
            <dd class="font-medium tabular-nums text-foreground">{total}</dd>
          </div>
          {#if picking}
            <div class="flex items-center justify-between px-3 py-2.5 text-body">
              <dt class="text-muted-foreground">In the new PDF</dt>
              <dd class="font-medium tabular-nums text-foreground">{selected}</dd>
            </div>
          {:else}
            <div class="flex items-center justify-between px-3 py-2.5 text-body">
              <dt class="text-muted-foreground">New files</dt>
              <dd class="font-medium tabular-nums text-foreground">{nIssue ? "None" : store.partCount}</dd>
            </div>
          {/if}
        </dl>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing && !picking && store.progress.total > 0}
        <ProgressLine
          label={store.progress.text}
          current={store.progress.current}
          total={store.progress.total}
          class="max-w-md"
        />
      {:else if store.isProcessing}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Splitting…
        </span>
      {:else if picking && rangeIssue}
        <span class="block truncate text-destructive">Fix the page numbers to continue.</span>
      {:else if picking && selected === 0}
        <span class="block truncate">Select the pages you want in the new PDF.</span>
      {:else if picking}
        <span class="block truncate tabular-nums">Save {pageLabel(selected)} as a new PDF. The original stays as it is.</span>
      {:else if nIssue}
        <span class="block truncate text-destructive">Fix the number of pages to continue.</span>
      {:else}
        <span class="block truncate tabular-nums">
          Make {fileLabel(store.partCount)} of up to {pageLabel(store.chunkSize)}, saved as a ZIP.
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.processSplit()} disabled={!canSplit}>
      {#if store.isProcessing}
        Splitting…
      {:else if picking}
        {selected > 0 ? `Save ${pageLabel(selected)} as PDF` : "Save pages as PDF"}
      {:else}
        {nIssue ? "Split into files" : `Split into ${fileLabel(store.partCount)}`}
      {/if}
    </Button>
  </ToolFooter>
{/if}
