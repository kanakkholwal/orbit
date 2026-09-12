<script lang="ts">
  import { FileRow, OptionGroup, ResultCard, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconLoader2 as Loader, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { ExtractPagesState } from "./helper.svelte";

  const store = new ExtractPagesState();
  const uid = $props.id();

  const field =
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-body tabular-nums text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring";

  const s = $derived(store.state);
  const busy = $derived(s.isProcessing);
  const selected = $derived(store.targetPages(s.pagesToExtract));
  const selectedSet = $derived(new Set(selected));
  const pages = $derived(Array.from({ length: s.pageCount }, (_, i) => i));
  const blocker = $derived(
    !s.pagesToExtract.trim()
      ? "Pick pages or type them to continue."
      : selected.length === 0
        ? `Those pages are not in this file. It has ${s.pageCount} pages.`
        : null
  );
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;

  function toRange(indices: number[]) {
    const parts: string[] = [];
    let i = 0;
    while (i < indices.length) {
      let j = i;
      while (j + 1 < indices.length && indices[j + 1] === indices[j] + 1) j++;
      parts.push(i === j ? `${indices[i] + 1}` : `${indices[i] + 1}-${indices[j] + 1}`);
      i = j + 1;
    }
    return parts.join(", ");
  }

  function toggle(index: number) {
    const next = new Set(selected);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    store.state.pagesToExtract = toRange([...next].sort((a, b) => a - b));
  }

  function setPages(indices: number[]) {
    store.state.pagesToExtract = toRange(indices);
  }
</script>

{#if !s.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files[0])}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to pull pages out</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Choose the pages you need. Each one is saved as its own PDF.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !busy}
      <ResultCard
        title={`Saved ${pageLabel(store.result.count)}`}
        description={`Each page is its own PDF, bundled in ${store.result.name}.`}
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
      </ResultCard>
    {/if}

    <FileRow
      name={s.file.name}
      meta={`${formatBytes(s.file.size)} · ${pageLabel(s.pageCount)}`}
      onRemove={busy ? undefined : () => store.reset()}
    />

    <ToolBar label="Pages" count={s.pageCount} meta={`${selected.length} selected`}>
      {#snippet actions()}
        <Button variant="outline" size="sm" disabled={busy} onclick={() => setPages(pages)}>Select all</Button>
        <Button variant="ghost" size="sm" disabled={busy || selected.length === 0} onclick={() => setPages([])}>
          Clear
        </Button>
      {/snippet}
    </ToolBar>

    <ul class="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-2" aria-label="Pages in this file">
      {#each pages as index (index)}
        {@const active = selectedSet.has(index)}
        <li>
          <button
            type="button"
            aria-pressed={active}
            aria-label={`Page ${index + 1}`}
            disabled={busy}
            onclick={() => toggle(index)}
            class={cn(
              "grid aspect-3/4 w-full place-items-center rounded-lg border text-body tabular-nums outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              active
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground"
            )}
          >
            {index + 1}
          </button>
        </li>
      {/each}
    </ul>
  </div>

  <WorkspaceInspector title="Extract">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Pages to keep" description="Tap pages in the grid, or type them like 1, 3-5, 8.">
        <label for="{uid}-pages" class="sr-only">Pages to keep</label>
        <input
          id="{uid}-pages"
          type="text"
          bind:value={store.state.pagesToExtract}
          placeholder="1, 3-5, 8"
          aria-invalid={s.pagesToExtract.trim() !== "" && selected.length === 0}
          class={cn(field, s.pagesToExtract.trim() !== "" && selected.length === 0 && "border-destructive")}
        />
      </OptionGroup>

      <OptionGroup label="What you get">
        <dl class="flex flex-col divide-y divide-border rounded-xl border border-border">
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Pages</dt>
            <dd class="font-medium tabular-nums text-foreground">{selected.length} of {s.pageCount}</dd>
          </div>
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Download</dt>
            <dd class="font-medium text-foreground">One ZIP file</dd>
          </div>
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Inside</dt>
            <dd class="font-medium text-foreground">A PDF per page</dd>
          </div>
        </dl>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if busy}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          {s.progress || "Extracting…"}
        </span>
      {:else if blocker}
        <span class={cn("block truncate", s.pagesToExtract.trim() && "text-destructive")}>{blocker}</span>
      {:else}
        <span class="block truncate tabular-nums">{pageLabel(selected.length)} selected: {toRange(selected)}</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.extract()} disabled={busy || blocker !== null}>
      {busy ? "Extracting…" : `Extract ${pageLabel(selected.length)}`}
    </Button>
  </ToolFooter>
{/if}
