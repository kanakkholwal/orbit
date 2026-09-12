<script lang="ts">
  import {
    FileRow,
    OptionGroup,
    OptionToggle,
    ProgressLine,
    ResultCard,
    StatusPill,
    ToolBar,
    ToolFooter,
  } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconPlus as Plus, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { FlattenPdfState } from "./helper.svelte";

  const store = new FlattenPdfState();
  let addInput = $state<HTMLInputElement | null>(null);

  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const pendingCount = $derived(store.pendingFiles.length);
  const doneCount = $derived(store.doneFiles.length);
  const nothingSelected = $derived(!store.options.forms && !store.options.comments);
  const showResult = $derived(!store.isProcessing && doneCount > 0);
  const totals = $derived(store.totals);

  const resultTitle = $derived.by(() => {
    const parts = [
      totals.fields > 0 ? plural(totals.fields, "field") : "",
      totals.comments > 0 ? plural(totals.comments, "comment") : "",
    ].filter(Boolean);
    return parts.length > 0 ? `Flattened ${parts.join(" and ")}` : "Flattening finished";
  });

  const resultDescription = $derived.by(() => {
    const lines = [`${plural(doneCount, "file")} downloaded. Nothing in ${doneCount === 1 ? "it" : "them"} can be edited now.`];
    if (totals.removed > 0) lines.push(`${plural(totals.removed, "item")} with no visible look ${totals.removed === 1 ? "was" : "were"} deleted.`);
    if (totals.kept > 0) lines.push(`${plural(totals.kept, "item")} had no saved look and ${totals.kept === 1 ? "was" : "were"} left as ${totals.kept === 1 ? "it was" : "they were"}.`);
    return lines.join(" ");
  });

  function rowDetail(file: (typeof store.files)[number]): string {
    const r = file.report;
    if (!r) return "";
    return [
      r.fields > 0 ? plural(r.fields, "field") : "",
      r.comments > 0 ? plural(r.comments, "comment") : "",
      r.removed > 0 ? `${r.removed} deleted` : "",
      r.kept > 0 ? `${r.kept} left editable` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }
</script>

{#if store.files.length === 0}
  <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop PDFs to flatten</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Lock filled-in forms and comments into the page so nobody can change them. Files never leave this device.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard title={resultTitle} description={resultDescription}>
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadResults()}>
            <Download />
            {doneCount === 1 ? "Download again" : "Download all as ZIP"}
          </Button>
          <Button variant="ghost" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="flatten-pdf" />
      </ResultCard>
    {/if}

    <ToolBar
      label="Files"
      count={store.files.length}
      meta={formatBytes(store.totalSize)}
      onReset={store.isProcessing ? undefined : () => store.reset()}
      resetLabel="Clear all"
    >
      {#snippet actions()}
        <Button variant="outline" size="sm" disabled={store.isProcessing} onclick={() => addInput?.click()}>
          <Plus />
          Add files
        </Button>
      {/snippet}
    </ToolBar>

    <ul class="flex flex-col gap-2">
      {#each store.files as file (file.id)}
        <li>
          <FileRow
            name={file.file.name}
            onRemove={file.status !== "processing" && file.status !== "done" && !store.isProcessing
              ? () => store.removeFile(file.id)
              : undefined}
          >
            <span>{formatBytes(file.size)}</span>
            {#if file.status === "done"}
              <span class="font-medium text-foreground">{rowDetail(file)}</span>
            {:else if file.note}
              <span>· {file.note}</span>
            {/if}

            {#snippet trailing()}
              {#if file.status === "processing"}
                <StatusPill status="processing" label="Flattening" />
              {:else if file.status === "done"}
                <StatusPill status="done" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="text-muted-foreground hover:text-foreground"
                  aria-label={`Download flattened ${file.file.name}`}
                  onclick={() => store.downloadOne(file.id)}
                >
                  <Download class="size-4" />
                </Button>
              {:else if file.status === "error"}
                <StatusPill status="error" label="Failed" />
              {:else if file.note}
                <StatusPill status="idle" label="Skipped" />
              {/if}
            {/snippet}
          </FileRow>
        </li>
      {/each}
    </ul>

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

  <WorkspaceInspector title="Flatten">
    <div class="flex flex-col gap-6">
      <OptionGroup
        label="What to flatten"
        description="Each item is drawn onto the page exactly as it looks now, then its editable version is removed."
      >
        <div class="-my-2.5 flex flex-col divide-y divide-border">
          <OptionToggle
            label="Form fields"
            description="Text boxes, checkboxes and dropdowns keep their answers"
            bind:checked={store.options.forms}
          />
          <OptionToggle
            label="Comments and markup"
            description="Highlights, drawings, stamps and sticky notes"
            bind:checked={store.options.comments}
          />
        </div>
      </OptionGroup>

      <OptionGroup
        label="Items with no saved look"
        description="Some fields and comments were saved without a picture of how they look, so they cannot be drawn onto the page."
      >
        <div class="-my-2.5 flex flex-col divide-y divide-border">
          <OptionToggle
            label="Delete them"
            description="Otherwise they stay editable"
            bind:checked={store.options.removeLeftovers}
            disabled={nothingSelected}
          />
        </div>
      </OptionGroup>

      <p class="text-caption text-muted-foreground">
        Links stay clickable. A sticky note becomes its small icon; the note text is not kept on the page.
      </p>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if nothingSelected}
        <span class="block truncate">Turn on form fields or comments to flatten</span>
      {:else if pendingCount > 0}
        <span class="block truncate">{plural(pendingCount, "file")} ready</span>
      {:else if doneCount > 0}
        <span class="block truncate">All files flattened</span>
      {:else}
        <span class="block truncate">Nothing to flatten in these files</span>
      {/if}
    {/snippet}

    <Button
      variant="primary"
      onclick={() => store.process()}
      disabled={store.isProcessing || pendingCount === 0 || nothingSelected}
    >
      {store.isProcessing ? "Flattening…" : pendingCount > 0 ? `Flatten ${plural(pendingCount, "file")}` : "Flatten"}
    </Button>
  </ToolFooter>
{/if}
