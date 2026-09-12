<script lang="ts">
  import {
    ChoiceList,
    FileRow,
    OptionGroup,
    OptionToggle,
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
    IconArrowRight as ArrowRight,
    IconDownload as Download,
    IconPlus as Plus,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { CompressState, type Algorithm, type CompressionLevel } from "./helper.svelte";

  const store = new CompressState();
  let addInput = $state<HTMLInputElement | null>(null);

  const methods: { value: Algorithm; label: string }[] = [
    { value: "condense", label: "Optimize" },
    { value: "photon", label: "Flatten" },
  ];

  const levels: { value: CompressionLevel; label: string; hint: string }[] = [
    { value: "light", label: "Light", hint: "Smallest change, best quality" },
    { value: "balanced", label: "Balanced", hint: "Good size and quality for most files" },
    { value: "aggressive", label: "Strong", hint: "Much smaller, images soften" },
    { value: "extreme", label: "Maximum", hint: "Smallest file, visible quality loss" },
  ];

  const pendingCount = $derived(store.files.filter((f) => f.status === "pending").length);
  const flatten = $derived(store.settings.algorithm === "photon");
  const runLabel = $derived(
    store.isProcessing
      ? "Compressing…"
      : pendingCount > 0
        ? `Compress ${pendingCount} ${pendingCount === 1 ? "file" : "files"}`
        : "Compress"
  );
  const showResult = $derived(!store.isProcessing && store.doneFiles.length > 0);
  const savedPercent = $derived(
    store.doneFiles.length > 0
      ? Math.round(
          (store.savedBytes / store.doneFiles.reduce((sum, f) => sum + f.originalSize, 0)) * 100
        )
      : 0
  );
</script>

{#if store.files.length === 0}
  <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop PDFs to compress</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Make files small enough to email or upload. Add as many as you like; they never leave this device.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard
        title={store.savedBytes > 0 ? `Saved ${formatBytes(store.savedBytes)}` : "Compression finished"}
        description={store.savedBytes > 0
          ? `${store.doneFiles.length} ${store.doneFiles.length === 1 ? "file is" : "files are"} ${savedPercent}% smaller and downloaded.`
          : "These files were already well optimized, so the size barely changed."}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="compress-pdf" />
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
            {#if file.status === "done" && file.compressedSize}
              <ArrowRight class="size-3" aria-label="compressed to" />
              <span class="font-medium text-foreground">{formatBytes(file.compressedSize)}</span>
              <span class="text-success">
                {Math.max(0, Math.round((1 - file.compressedSize / file.originalSize) * 100))}% smaller
              </span>
            {/if}

            {#snippet trailing()}
              {#if file.status === "processing"}
                <StatusPill status="processing" label="Compressing" />
              {:else if file.status === "done"}
                <StatusPill status="done" />
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

  <WorkspaceInspector title="Compression">
    <div class="flex flex-col gap-6">
      <OptionGroup
        label="Method"
        description={store.settings.algorithm === "condense"
          ? "Shrinks images and removes hidden data. Text stays selectable."
          : "Turns each page into an image. Best for scans; text becomes unselectable."}
      >
        <SegmentedControl name="compress-method" options={methods} bind:value={store.settings.algorithm} />
      </OptionGroup>

      <OptionGroup label="Strength">
        <ChoiceList name="compress-level" choices={levels} bind:value={store.settings.level} />
      </OptionGroup>

      <OptionGroup label="Extras" description={flatten ? "Only apply to Optimize." : undefined}>
        <div class="-my-2.5 flex flex-col divide-y divide-border">
          <OptionToggle
            label="Remove metadata"
            description="Author, title and editing history"
            bind:checked={store.settings.removeMetadata}
            disabled={flatten}
          />
          <OptionToggle
            label="Trim fonts"
            description="Keep only the characters the document uses"
            bind:checked={store.settings.subsetFonts}
            disabled={flatten}
          />
          <OptionToggle
            label="Black and white"
            description="Drop colour for an even smaller file"
            bind:checked={store.settings.convertToGrayscale}
            disabled={flatten}
          />
        </div>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if pendingCount > 0}
        <span class="block truncate">
          {pendingCount} {pendingCount === 1 ? "file" : "files"} ready · {levels.find((l) => l.value === store.settings.level)?.label}
        </span>
      {:else}
        <span class="block truncate">All files compressed</span>
      {/if}
    {/snippet}

    <Button
      variant="primary"
      onclick={() => store.process()}
      disabled={store.isProcessing || pendingCount === 0}
    >
      {runLabel}
    </Button>
  </ToolFooter>
{/if}
