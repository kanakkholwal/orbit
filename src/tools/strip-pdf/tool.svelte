<script lang="ts">
  import { FileRow, StatusPill, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconArrowRight as ArrowRight,
    IconDownload as DownloadIcon,
    IconFileZip as FileArchive,
    IconLoader2 as LoaderCircle,
    IconScissors as Scissors,
  } from "@tabler/icons-svelte";
  import type { StripStatus } from "./helper.svelte";
  import { StripPdfState } from "./helper.svelte";

  const store = new StripPdfState();

  const pill: Record<StripStatus, "idle" | "processing" | "done" | "error"> = {
    idle: "idle",
    processing: "processing",
    done: "done",
    error: "error",
  };
</script>

{#if store.files.length === 0}
  <UploadArea
    accept="application/pdf"
    multiple
    onFilesSelected={(f) => store.addFiles(f)}
  >
    {#snippet title()}
      <h3 class="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
        Strip PDF page labels
      </h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-md text-sm leading-relaxed text-muted-foreground">
        Keep only the last page of each page-label range — plus the final page.
        Files with no page labels are left untouched. Everything stays on this
        device.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar
      label="Strip PDF"
      count={store.files.length}
      onReset={() => store.reset()}
      resetLabel="Clear all"
    >
      {#snippet actions()}
        {#if store.strippedCount > 1}
          <Button
            variant="outline"
            size="sm"
            onclick={() => store.downloadZip()}
            disabled={store.isProcessing}
            class="rounded-sm"
          >
            <FileArchive class="size-3.5" />
            <span class="hidden sm:inline">Download all (ZIP)</span>
          </Button>
        {/if}
      {/snippet}
    </ToolBar>

    <ToolPanel title="Files" counter={store.files.length}>
      <ul class="flex flex-col gap-2">
        {#each store.files as file (file.id)}
          <li>
            <FileRow
              name={file.name}
              onRemove={file.status === "idle" && !store.isProcessing
                ? () => store.removeFile(file.id)
                : undefined}
            >
              <span class="font-mono tabular-nums">
                {formatBytes(file.size)}
              </span>
              {#if file.status === "done" && file.keptPages != null}
                <ArrowRight class="size-3 text-muted-foreground" />
                <span class="font-mono tabular-nums text-success">
                  {file.keptPages} of {file.originalPages} pages
                </span>
              {:else if file.note}
                <span class="text-muted-foreground">· {file.note}</span>
              {/if}

              {#snippet trailing()}
                <StatusPill
                  status={pill[file.status]}
                  label={file.status === "idle" && file.note
                    ? "Skipped"
                    : undefined}
                />
                {#if file.status === "done"}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onclick={() => store.downloadOne(file.id)}
                    class="rounded-sm text-muted-foreground hover:text-primary"
                    aria-label="Download stripped PDF"
                  >
                    <DownloadIcon class="size-3.5" />
                  </Button>
                {/if}
              {/snippet}
            </FileRow>
          </li>
        {/each}
      </ul>
    </ToolPanel>

    <ToolFooter
      hint={store.isProcessing
        ? store.progressLabel
        : store.hasResults
          ? "Download each file, or grab them all as a ZIP"
          : "Strip every file down to its labeled pages"}
    >
      {#if store.strippedCount > 1}
        <Button
          variant="outline"
          size="lg"
          onclick={() => store.downloadZip()}
          disabled={store.isProcessing}
          class="rounded-sm"
        >
          <FileArchive class="size-4" />
          Download ZIP
        </Button>
      {/if}
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.process()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progressLabel}
        {:else}
          <Scissors class="size-4" />
          Strip pages
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
