<script lang="ts">
  import { FileRow, ProgressLine, ResultCard, StatusPill, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconPlus as Plus, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { ReversePagesState } from "./helper.svelte";

  const store = new ReversePagesState();
  let addInput = $state<HTMLInputElement | null>(null);

  const pendingCount = $derived(store.files.filter((f) => f.status === "pending").length);
  const doneCount = $derived(store.doneFiles.length);
  const showResult = $derived(!store.isProcessing && doneCount > 0);
  const plural = (n: number) => `${n} ${n === 1 ? "file" : "files"}`;
</script>

{#if store.files.length === 0}
  <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop PDFs to flip the page order</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        The last page becomes the first. Handy for scans that came out of the feeder backwards.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard
        title={`Reversed ${plural(doneCount)}`}
        description={doneCount === 1
          ? "The reversed file is downloaded."
          : "Each file was reversed on its own and downloaded as one ZIP."}
      >
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadResults()}>
            <Download />
            Download again
          </Button>
          <Button variant="ghost" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="reverse-pages" />
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
            onRemove={file.status === "pending" && !store.isProcessing ? () => store.removeFile(file.id) : undefined}
          >
            <span>{formatBytes(file.originalSize)}</span>
            {#if file.status === "done" && file.pages !== undefined}
              <span>· {file.pages} {file.pages === 1 ? "page" : "pages"} reversed</span>
            {/if}

            {#snippet trailing()}
              {#if file.status === "processing"}
                <StatusPill status="processing" label="Reversing" />
              {:else if file.status === "done"}
                <StatusPill status="done" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="text-muted-foreground hover:text-foreground"
                  aria-label={`Download reversed ${file.file.name}`}
                  onclick={() => store.downloadOne(file.id)}
                >
                  <Download class="size-4" />
                </Button>
              {:else if file.status === "error"}
                <StatusPill status="error" label={file.error || "Failed"} />
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
        <span class="block truncate">{plural(pendingCount)} ready · each file is reversed on its own</span>
      {:else}
        <span class="block truncate">All files reversed</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || pendingCount === 0}>
      {store.isProcessing ? "Reversing…" : pendingCount > 0 ? `Reverse ${plural(pendingCount)}` : "Reverse"}
    </Button>
  </ToolFooter>
{/if}
