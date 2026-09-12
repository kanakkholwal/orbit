<script lang="ts">
  import { FileRow, ProgressLine, ResultCard, StatusPill, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconArrowRight as ArrowRight,
    IconDownload as Download,
    IconPlus as Plus,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { StripPdfState } from "./helper.svelte";

  const store = new StripPdfState();
  let addInput = $state<HTMLInputElement | null>(null);

  const pendingCount = $derived(store.pendingFiles.length);
  const doneCount = $derived(store.strippedCount);
  const showResult = $derived(!store.isProcessing && doneCount > 0);
  const keptPages = $derived(store.doneFiles.reduce((sum, f) => sum + (f.keptPages ?? 0), 0));
  const originalPages = $derived(store.doneFiles.reduce((sum, f) => sum + (f.originalPages ?? 0), 0));
  const plural = (n: number, word = "file") => `${n} ${word}${n === 1 ? "" : "s"}`;
</script>

{#if store.files.length === 0}
  <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop PDFs to keep one page per section</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Keep the last page of each labelled section, plus the final page. Files without page labels stay as they are.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard
        title={`Kept ${plural(keptPages, "page")} of ${originalPages}`}
        description={`${plural(doneCount)} stripped and ready to download.${store.skippedCount > 0 ? ` ${plural(store.skippedCount)} had nothing to remove.` : ""}`}
      >
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadResults()}>
            <Download />
            {doneCount === 1 ? "Download" : "Download all as ZIP"}
          </Button>
          <Button variant="ghost" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="strip-pdf" />
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
            onRemove={file.status === "idle" && !store.isProcessing ? () => store.removeFile(file.id) : undefined}
          >
            <span>{formatBytes(file.size)}</span>
            {#if file.status === "done" && file.keptPages != null}
              <ArrowRight class="size-3" aria-label="stripped to" />
              <span class="font-medium text-foreground">{file.keptPages} of {plural(file.originalPages ?? 0, "page")}</span>
            {:else if file.note}
              <span>· {file.note}</span>
            {/if}

            {#snippet trailing()}
              {#if file.status === "processing"}
                <StatusPill status="processing" label="Stripping" />
              {:else if file.status === "done"}
                <StatusPill status="done" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="text-muted-foreground hover:text-foreground"
                  aria-label={`Download stripped ${file.file.name}`}
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

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if pendingCount > 0}
        <span class="block truncate">{plural(pendingCount)} ready</span>
      {:else if doneCount > 0}
        <span class="block truncate">All files checked</span>
      {:else}
        <span class="block truncate">None of these files have page labels to strip</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || pendingCount === 0}>
      {store.isProcessing ? "Stripping…" : pendingCount > 0 ? `Strip ${plural(pendingCount)}` : "Strip"}
    </Button>
  </ToolFooter>
{/if}
