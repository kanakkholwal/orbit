<script lang="ts">
  import { FileRow, ProgressLine, ResultCard, StatusPill, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconPlus as Plus, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { RepairPdfState } from "./helper.svelte";

  const store = new RepairPdfState();
  let addInput = $state<HTMLInputElement | null>(null);

  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const pendingCount = $derived(store.pendingFiles.length);
  const repaired = $derived(store.count("repaired"));
  const healthy = $derived(store.count("healthy"));
  const failed = $derived(store.count("failed"));
  const locked = $derived(store.count("locked"));
  const checked = $derived(repaired + healthy + failed + locked);
  const showResult = $derived(!store.isProcessing && checked > 0);

  const resultTitle = $derived(
    repaired > 0
      ? `Repaired ${plural(repaired, "file")}`
      : healthy > 0 && failed + locked === 0
        ? healthy === 1
          ? "This file is not damaged"
          : "These files are not damaged"
        : "Nothing could be repaired"
  );

  const resultDescription = $derived(
    [
      repaired > 0 ? `${repaired === 1 ? "It was" : "They were"} rebuilt and downloaded. Check the pages before you rely on ${repaired === 1 ? "it" : "them"}.` : "",
      healthy > 0 ? `${plural(healthy, "file")} opened without problems.` : "",
      failed > 0 ? `${plural(failed, "file")} could not be recovered.` : "",
      locked > 0 ? `${plural(locked, "file")} ${locked === 1 ? "is" : "are"} locked with a password. Unlock ${locked === 1 ? "it" : "them"} first.` : "",
    ]
      .filter(Boolean)
      .join(" ")
  );

  const rowNote: Record<string, string> = {
    healthy: "Opened without problems",
    repaired: "Rebuilt from what could be read",
    locked: "Locked with a password. Unlock it first.",
    failed: "Too damaged to recover, or not a PDF",
  };
</script>

{#if store.files.length === 0}
  <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop PDFs that will not open</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Rebuild damaged or half-downloaded files from the parts that can still be read. Files never leave this device.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard title={resultTitle} description={resultDescription}>
        {#snippet actions()}
          {#if repaired > 0}
            <Button variant="outline" onclick={() => store.downloadResults(store.repairedFiles)}>
              <Download />
              {repaired === 1 ? "Download again" : "Download all as ZIP"}
            </Button>
          {/if}
          <Button variant="ghost" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        {#if store.resultFiles.length > 0}
          <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="repair-pdf" />
        {/if}
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
            onRemove={file.status !== "processing" && !store.isProcessing ? () => store.removeFile(file.id) : undefined}
          >
            <span>{formatBytes(file.size)}</span>
            {#if file.pages}
              <span>· {plural(file.pages, "page")}</span>
            {/if}
            {#if rowNote[file.status]}
              <span>· {rowNote[file.status]}</span>
            {/if}

            {#snippet trailing()}
              {#if file.status === "processing"}
                <StatusPill status="processing" label="Checking" />
              {:else if file.status === "repaired"}
                <StatusPill status="done" label="Repaired" />
              {:else if file.status === "healthy"}
                <StatusPill status="done" label="Not damaged" />
              {:else if file.status === "locked"}
                <StatusPill status="idle" label="Locked" />
              {:else if file.status === "failed"}
                <StatusPill status="error" label="Not recovered" />
              {/if}
              {#if file.result}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="text-muted-foreground hover:text-foreground"
                  aria-label={`Download ${file.status === "healthy" ? "a rewritten copy of" : "repaired"} ${file.file.name}`}
                  onclick={() => store.downloadOne(file.id)}
                >
                  <Download class="size-4" />
                </Button>
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

    <p class="text-caption text-muted-foreground">
      Repair rebuilds the file's structure. If part of a file was cut off or overwritten, that part cannot be brought back, so a
      page may come back blank.
    </p>
  </div>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if pendingCount > 0}
        <span class="block truncate">{plural(pendingCount, "file")} ready</span>
      {:else}
        <span class="block truncate">All files checked</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || pendingCount === 0}>
      {store.isProcessing ? "Repairing…" : pendingCount > 0 ? `Repair ${plural(pendingCount, "file")}` : "Repair"}
    </Button>
  </ToolFooter>
{/if}
