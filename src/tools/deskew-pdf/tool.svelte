<script lang="ts">
  import {
    ChoiceList,
    FileRow,
    OptionGroup,
    ProgressLine,
    ResultCard,
    SegmentedControl,
    StatusPill,
    ToolBar,
    ToolFooter,
  } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconCircleCheck as CircleCheck,
    IconDownload as Download,
    IconListDetails as ListDetails,
    IconPlus as Plus,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { DeskewPdfState } from "./helper.svelte";

  const store = new DeskewPdfState();
  let addInput = $state<HTMLInputElement | null>(null);
  let detailId = $state<string | null>(null);

  const sensitivities = [
    { value: "0.1", label: "Very high", hint: "Fixes even the slightest tilt, from 0.1°" },
    { value: "0.5", label: "High", hint: "Fixes tilt of 0.5° or more. Best for most scans" },
    { value: "1.0", label: "Normal", hint: "Fixes tilt of 1° or more" },
    { value: "2.0", label: "Low", hint: "Only fixes clearly crooked pages, 2° or more" },
  ];

  const details = [
    { value: "100", label: "Fast" },
    { value: "150", label: "Standard" },
    { value: "200", label: "Fine" },
    { value: "300", label: "Finest" },
  ];

  const pendingCount = $derived(store.files.filter((f) => f.status === "pending").length);
  const doneCount = $derived(store.doneFiles.length);
  const showResult = $derived(!store.isProcessing && doneCount > 0);
  const straightened = $derived(store.doneFiles.reduce((sum, f) => sum + (f.result?.correctedPages ?? 0), 0));
  const detail = $derived(store.doneFiles.find((f) => f.id === detailId) ?? store.doneFiles.at(-1));
  const plural = (n: number, word = "file") => `${n} ${word}${n === 1 ? "" : "s"}`;
</script>

{#if store.files.length === 0}
  <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop scanned PDFs to straighten</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Find pages that were scanned at a slant and turn them back so the lines run straight.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard
        title={straightened > 0 ? `Straightened ${plural(straightened, "page")}` : "Every page was already straight"}
        description={doneCount === 1
          ? "The file is downloaded."
          : `${doneCount} files are downloaded as one ZIP.`}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="deskew-pdf" />
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
            {#if file.status === "done" && file.result}
              <span>· {file.result.correctedPages} of {plural(file.result.totalPages, "page")} straightened</span>
            {/if}

            {#snippet trailing()}
              {#if file.status === "processing"}
                <StatusPill status="processing" label="Straightening" />
              {:else if file.status === "done"}
                <StatusPill status="done" />
                {#if doneCount > 1}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    class="text-muted-foreground hover:text-foreground"
                    aria-label={`Show page details for ${file.file.name}`}
                    aria-pressed={detail?.id === file.id}
                    onclick={() => (detailId = file.id)}
                  >
                    <ListDetails class="size-4" />
                  </Button>
                {/if}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="text-muted-foreground hover:text-foreground"
                  aria-label={`Download straightened ${file.file.name}`}
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

    {#if detail?.result}
      <section class="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4" aria-label="Page details">
        <div class="flex min-w-0 flex-col gap-0.5">
          <h2 class="text-body font-medium text-foreground">Page by page</h2>
          <p class="truncate text-caption text-muted-foreground" title={detail.file.name}>{detail.file.name}</p>
        </div>
        <ul class="scrollbar-subtle flex max-h-72 flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border">
          {#each detail.result.angles as angle, idx (idx)}
            <li class="flex items-center justify-between gap-3 px-3 py-2 text-body">
              <span class="text-foreground">Page {idx + 1}</span>
              <span class="flex items-center gap-3">
                <span class="text-caption tabular-nums text-muted-foreground">
                  Tilted {angle > 0 ? "+" : ""}{angle.toFixed(2)}°
                </span>
                {#if detail.result.corrected[idx]}
                  <span class="inline-flex items-center gap-1 text-caption font-medium text-success">
                    <CircleCheck class="size-3.5" />
                    Straightened
                  </span>
                {:else}
                  <span class="text-caption text-muted-foreground">Left as is</span>
                {/if}
              </span>
            </li>
          {/each}
        </ul>
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

  <WorkspaceInspector title="Straightening">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Sensitivity" description="Pages tilted less than this are left as they are.">
        <ChoiceList name="deskew-threshold" choices={sensitivities} bind:value={store.threshold} />
      </OptionGroup>

      <OptionGroup label="Scan detail" description="Finer detail measures the tilt more precisely but takes longer.">
        <SegmentedControl name="deskew-dpi" options={details} bind:value={store.dpi} />
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if pendingCount > 0}
        <span class="block truncate">
          {plural(pendingCount)} ready · {sensitivities.find((s) => s.value === store.threshold)?.label} sensitivity
        </span>
      {:else}
        <span class="block truncate">All files straightened</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || pendingCount === 0}>
      {store.isProcessing ? "Straightening…" : pendingCount > 0 ? `Straighten ${plural(pendingCount)}` : "Straighten"}
    </Button>
  </ToolFooter>
{/if}
