<script lang="ts">
  import { FileRow, ProgressLine, ResultCard, StatusPill, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconPlus as Plus, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { PdfToWordState } from "./helper.svelte";

  const store = new PdfToWordState();
  let addInput = $state<HTMLInputElement | null>(null);

  const pendingCount = $derived(store.files.filter((f) => f.status === "pending").length);
  const doneCount = $derived(store.doneFiles.length);
  const showResult = $derived(!store.isProcessing && doneCount > 0);
  const plural = (n: number) => `${n} ${n === 1 ? "file" : "files"}`;
</script>

{#if store.files.length === 0}
  <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop PDFs to turn into Word files</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Get documents you can edit in Word, Pages or Google Docs, with the layout kept as close as possible.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard
        title={`Converted ${plural(doneCount)} to Word`}
        description={doneCount === 1 ? "The Word file is downloaded." : "The Word files are downloaded as one ZIP."}
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

    <p class="text-body text-muted-foreground">Pages with busy layouts can take a little longer to convert.</p>

    <ul class="flex flex-col gap-2">
      {#each store.files as file (file.id)}
        <li>
          <FileRow
            name={file.file.name}
            onRemove={file.status === "pending" && !store.isProcessing ? () => store.removeFile(file.id) : undefined}
          >
            <span>{formatBytes(file.originalSize)}</span>
            {#if file.status === "done" && file.resultBlob}
              <span>· Word file {formatBytes(file.resultBlob.size)}</span>
            {/if}

            {#snippet trailing()}
              {#if file.status === "processing"}
                <StatusPill status="processing" label="Converting" />
              {:else if file.status === "done"}
                <StatusPill status="done" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="text-muted-foreground hover:text-foreground"
                  aria-label={`Download Word file for ${file.file.name}`}
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
        <span class="block truncate">{plural(pendingCount)} ready</span>
      {:else}
        <span class="block truncate">All files converted</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || pendingCount === 0}>
      {store.isProcessing ? "Converting…" : pendingCount > 0 ? `Convert ${plural(pendingCount)}` : "Convert"}
    </Button>
  </ToolFooter>
{/if}
