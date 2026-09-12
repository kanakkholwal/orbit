<script lang="ts">
  import { OptionGroup, ResultCard, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import {
    IconDownload as Download,
    IconLoader2 as Loader,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { DeletePagesState } from "./helper.svelte";
  import PageThumbnail from "./PageThumbnail.svelte";

  const store = new DeletePagesState();
  const uid = $props.id();

  const total = $derived(store.state.pageCount);
  const selected = $derived(store.selectedCount);
  const remaining = $derived(total - selected);
  const issue = $derived(store.inputIssue);
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
</script>

{#if !store.state.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files[0])}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to delete pages</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Pick the pages you don't need and save a copy without them.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard
        title={`Deleted ${pageLabel(store.result.deleted)}`}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="delete-pages" />
      </ResultCard>
    {/if}

    <ToolBar
      label={`${selected} of ${total} selected`}
      meta={store.state.file.name}
      onReset={store.isProcessing ? undefined : () => store.reset()}
      resetLabel="Close file"
    >
      {#snippet actions()}
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
      {/snippet}
    </ToolBar>

    <p class="text-body text-muted-foreground">Tap the pages you want to delete. Tap again to keep a page.</p>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {#each { length: total } as _, i (i)}
        <PageThumbnail {store} index={i} />
      {/each}
    </div>
  </div>

  <WorkspaceInspector title="Pages to delete">
    <div class="flex flex-col gap-6">
      <OptionGroup
        label="Page numbers"
        description="Type pages and ranges, like 1, 3-5, 8. Tapping pages fills this in for you."
      >
        <label for={`${uid}-pages`} class="sr-only">Pages to delete</label>
        <input
          id={`${uid}-pages`}
          type="text"
          inputmode="numeric"
          value={store.state.inputText}
          oninput={(e) => store.handleInputUpdate(e.currentTarget.value)}
          placeholder="1, 3-5, 8"
          aria-invalid={issue ? "true" : undefined}
          aria-describedby={issue ? `${uid}-pages-issue` : undefined}
          class="h-10 w-full rounded-lg border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring {issue
            ? 'border-destructive'
            : 'border-border'}"
        />
        {#if issue}
          <span id={`${uid}-pages-issue`} class="text-caption text-destructive">{issue}</span>
        {/if}
      </OptionGroup>

      <OptionGroup label="Result">
        <dl class="flex flex-col divide-y divide-border rounded-xl border border-border">
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Pages now</dt>
            <dd class="font-medium tabular-nums text-foreground">{total}</dd>
          </div>
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">To delete</dt>
            <dd class="font-medium tabular-nums text-foreground">{selected}</dd>
          </div>
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Pages left</dt>
            <dd class="font-medium tabular-nums text-foreground">{remaining}</dd>
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
          Deleting {pageLabel(selected)}…
        </span>
      {:else if issue}
        <span class="block truncate text-destructive">Fix the page numbers to continue.</span>
      {:else if selected === 0}
        <span class="block truncate">Select the pages you want to delete.</span>
      {:else if remaining === 0}
        <span class="block truncate text-destructive">Keep at least one page in the PDF.</span>
      {:else}
        <span class="block truncate tabular-nums">Delete {pageLabel(selected)}, {remaining} remain.</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={!store.canDelete}>
      {store.isProcessing ? "Deleting…" : selected > 0 ? `Delete ${pageLabel(selected)}` : "Delete pages"}
    </Button>
  </ToolFooter>
{/if}
