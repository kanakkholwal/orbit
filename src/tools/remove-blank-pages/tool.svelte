<script lang="ts">
  import { ChoiceList, OptionGroup, ProgressLine, ResultCard, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconDownload as Download,
    IconFileCheck as FileCheck,
    IconLoader2 as Loader,
    IconRefresh as Refresh,
    IconSearch as Search,
  } from "@tabler/icons-svelte";
  import { RemoveBlankPagesState, type BlankStrictness } from "./helper.svelte";
  import PageThumbnail from "./PageThumbnail.svelte";

  const store = new RemoveBlankPagesState();

  const strictness: { value: BlankStrictness; label: string; hint: string }[] = [
    { value: "strict", label: "Only empty pages", hint: "Pages with nothing on them at all" },
    { value: "balanced", label: "Nearly empty", hint: "Also pages with a stray mark or page number" },
    { value: "loose", label: "Scanned pages", hint: "Also catches dust and smudges from a scanner" },
  ];

  const found = $derived(store.state.detectedPages.length);
  const selected = $derived(store.selectedCount);
  const checked = $derived(store.state.hasPerformedDetection);
  const detecting = $derived(store.state.isDetecting);
  const busy = $derived(detecting || store.isProcessing);
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;

  async function open(files: File[]) {
    await store.loadFile(files);
    if (store.state.file) await store.detectBlankPages();
  }
</script>

{#if !store.state.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={open}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to remove blank pages</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        We find the empty pages for you. Check the list, then save a copy without them.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard
        title={`Removed ${pageLabel(store.result.removed)}`}
        description={`${store.result.name} has ${pageLabel(store.result.remaining)} and is downloaded.`}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="remove-blank-pages" />
      </ResultCard>
    {/if}

    <ToolBar
      label={checked && found > 0 ? `${selected} of ${found} selected` : "Pages"}
      count={checked && found > 0 ? undefined : store.state.pageCount}
      meta={`${store.state.file.name}, ${formatBytes(store.state.originalSize)}`}
      onReset={busy ? undefined : () => store.reset()}
      resetLabel="Close file"
    >
      {#snippet actions()}
        {#if checked && found > 0}
          <Button variant="outline" size="sm" disabled={selected === found || busy} onclick={() => store.selectAll()}>
            Select all
          </Button>
          <Button variant="outline" size="sm" disabled={selected === 0 || busy} onclick={() => store.clearSelection()}>
            Clear selection
          </Button>
        {/if}
        {#if checked}
          <Button variant="outline" size="sm" disabled={busy} onclick={() => store.detectBlankPages()}>
            <Search />
            Check again
          </Button>
        {/if}
      {/snippet}
    </ToolBar>

    {#if detecting}
      <div class="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-12 text-muted-foreground">
        <Loader class="size-5 animate-spin text-primary" />
        <p class="text-body">Looking for blank pages</p>
      </div>
    {:else if !checked}
      <div class="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <span class="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Search class="size-5" />
        </span>
        <h2 class="text-body-lg font-medium text-foreground">Find the blank pages</h2>
        <p class="max-w-sm text-body text-muted-foreground">
          We look at all {pageLabel(store.state.pageCount)} and show you the ones that look empty.
        </p>
      </div>
    {:else if found === 0}
      <div class="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <span class="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
          <FileCheck class="size-5" />
        </span>
        <h2 class="text-body-lg font-medium text-foreground">No blank pages found</h2>
        <p class="max-w-sm text-body text-muted-foreground">
          If you can see empty pages, choose Scanned pages in the settings and check again.
        </p>
      </div>
    {:else}
      <p class="text-body text-muted-foreground">
        These pages look blank. Tap a page to keep it in the file.
      </p>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {#each store.state.detectedPages as pageInfo (pageInfo.index)}
          <PageThumbnail {store} {pageInfo} />
        {/each}
      </div>
    {/if}
  </div>

  <WorkspaceInspector title="Detection">
    <div class="flex flex-col gap-6">
      <OptionGroup label="What counts as blank" description="Check again after changing this.">
        <ChoiceList name="blank-strictness" choices={strictness} bind:value={store.state.strictness} />
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if detecting}
        <ProgressLine
          label="Checking pages"
          current={store.progress.current}
          total={store.progress.total}
          class="max-w-md"
        />
      {:else if store.isProcessing}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Removing {pageLabel(selected)}…
        </span>
      {:else if !checked}
        <span class="block truncate">Find the blank pages in {pageLabel(store.state.pageCount)}.</span>
      {:else if found === 0}
        <span class="block truncate">No blank pages to remove.</span>
      {:else if selected === 0}
        <span class="block truncate">Select the pages you want to remove.</span>
      {:else if selected >= store.state.pageCount}
        <span class="block truncate text-destructive">Keep at least one page in the PDF.</span>
      {:else}
        <span class="block truncate tabular-nums">
          Remove {pageLabel(selected)}, {store.state.pageCount - selected} remain.
        </span>
      {/if}
    {/snippet}

    {#if !checked}
      <Button variant="primary" onclick={() => store.detectBlankPages()} disabled={busy}>
        {detecting ? "Checking…" : "Find blank pages"}
      </Button>
    {:else}
      <Button variant="primary" onclick={() => store.process()} disabled={busy || selected === 0 || selected >= store.state.pageCount}>
        {store.isProcessing
          ? "Removing…"
          : selected > 0
            ? `Remove ${pageLabel(selected)}`
            : "Remove blank pages"}
      </Button>
    {/if}
  </ToolFooter>
{/if}
