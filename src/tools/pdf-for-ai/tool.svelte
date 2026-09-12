<script lang="ts">
  import { FileRow, ProgressLine, ResultCard, StatusPill, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconCheck as Check,
    IconCopy as Copy,
    IconDownload as Download,
    IconEye as Eye,
    IconPlus as Plus,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";
  import { PdfForAiState } from "./helper.svelte";

  const PREVIEW_LIMIT = 20000;

  const store = new PdfForAiState();
  let addInput = $state<HTMLInputElement | null>(null);
  let previewId = $state<string | null>(null);
  let copied = $state(false);

  const pendingCount = $derived(store.files.filter((f) => f.status === "pending").length);
  const doneCount = $derived(store.doneFiles.length);
  const showResult = $derived(!store.isProcessing && doneCount > 0);
  const preview = $derived(store.doneFiles.find((f) => f.id === previewId) ?? store.doneFiles.at(-1));
  const plural = (n: number) => `${n} ${n === 1 ? "file" : "files"}`;

  async function copyJson() {
    if (!preview?.json) return;
    try {
      await navigator.clipboard.writeText(preview.json);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      toast.error("Could not copy the file.");
    }
  }
</script>

{#if store.files.length === 0}
  <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop PDFs to get them ready for AI</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Turn each PDF into a tidy data file that AI apps and chatbots can read page by page.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard
        title={`Prepared ${plural(doneCount)} for AI`}
        description={doneCount === 1 ? "The data file is downloaded." : "The data files are downloaded as one ZIP."}
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

    <p class="text-body text-muted-foreground">
      Each PDF becomes a JSON file with the text of every page, its page number and headings, ready for tools like
      LlamaIndex.
    </p>

    <ul class="flex flex-col gap-2">
      {#each store.files as file (file.id)}
        <li>
          <FileRow
            name={file.file.name}
            onRemove={file.status === "pending" && !store.isProcessing ? () => store.removeFile(file.id) : undefined}
          >
            <span>{formatBytes(file.originalSize)}</span>
            {#if file.status === "done" && file.sections !== undefined}
              <span>· {file.sections} {file.sections === 1 ? "section" : "sections"}</span>
            {/if}

            {#snippet trailing()}
              {#if file.status === "processing"}
                <StatusPill status="processing" label="Preparing" />
              {:else if file.status === "done"}
                <StatusPill status="done" />
                {#if doneCount > 1}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    class="text-muted-foreground hover:text-foreground"
                    aria-label={`Show data for ${file.file.name}`}
                    aria-pressed={preview?.id === file.id}
                    onclick={() => (previewId = file.id)}
                  >
                    <Eye class="size-4" />
                  </Button>
                {/if}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="text-muted-foreground hover:text-foreground"
                  aria-label={`Download data for ${file.file.name}`}
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

    {#if preview?.json !== undefined}
      <section class="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4" aria-label="Data preview">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 flex-col gap-0.5">
            <h2 class="text-body font-medium text-foreground">Preview</h2>
            <p class="truncate text-caption text-muted-foreground" title={preview.file.name}>{preview.file.name}</p>
          </div>
          <Button variant="outline" size="sm" onclick={copyJson}>
            {#if copied}<Check />{:else}<Copy />{/if}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre
          class="scrollbar-subtle max-h-96 overflow-auto whitespace-pre-wrap wrap-break-word rounded-xl bg-muted p-3 font-mono text-caption text-foreground">{preview.json.slice(0, PREVIEW_LIMIT)}</pre>
        {#if preview.json.length > PREVIEW_LIMIT}
          <p class="text-caption text-muted-foreground">Showing the start of the file. Copy or download it to see everything.</p>
        {/if}
      </section>
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

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if pendingCount > 0}
        <span class="block truncate">{plural(pendingCount)} ready</span>
      {:else}
        <span class="block truncate">All files prepared</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || pendingCount === 0}>
      {store.isProcessing ? "Preparing…" : pendingCount > 0 ? `Prepare ${plural(pendingCount)}` : "Prepare"}
    </Button>
  </ToolFooter>
{/if}
