<script lang="ts">
  import { OptionGroup, OptionToggle, ProgressLine, ResultCard, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import {
    IconChevronLeft as ChevronLeft,
    IconChevronRight as ChevronRight,
    IconDownload as Download,
    IconMaximize as Maximize,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import CropperCanvas from "./CropperCanvas.svelte";
  import { CropPdfState, type CropData } from "./helper.svelte";

  const store = new CropPdfState();
  const uid = $props.id();

  type Edge = "top" | "bottom" | "left" | "right";
  const edges: { key: Edge; label: string }[] = [
    { key: "top", label: "Top" },
    { key: "bottom", label: "Bottom" },
    { key: "left", label: "Left" },
    { key: "right", label: "Right" },
  ];

  const MIN_SIZE = 0.05;

  const current = $derived(store.state.currentPage);
  const crop = $derived<CropData>(store.state.pageCrops[current] ?? { x: 0, y: 0, width: 1, height: 1 });
  const margins = $derived<Record<Edge, number>>({
    top: crop.y,
    bottom: 1 - crop.y - crop.height,
    left: crop.x,
    right: 1 - crop.x - crop.width,
  });
  const hasCrop = $derived(Boolean(store.state.pageCrops[current]));
  const croppedCount = $derived(store.croppedPageCount);
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
  const toPercent = (ratio: number) => Math.max(0, Math.round(ratio * 1000) / 10);

  function setMargin(edge: Edge, percent: number) {
    if (!Number.isFinite(percent)) return;
    const m = { ...margins, [edge]: Math.min(Math.max(percent / 100, 0), 1) };
    const opposite: Record<Edge, Edge> = { top: "bottom", bottom: "top", left: "right", right: "left" };
    const other = m[opposite[edge]];
    m[edge] = Math.min(m[edge], 1 - other - MIN_SIZE);
    store.saveCrop(current, {
      x: m.left,
      y: m.top,
      width: 1 - m.left - m.right,
      height: 1 - m.top - m.bottom,
    });
  }

  const runLabel = $derived.by(() => {
    if (store.isProcessing) return "Cropping…";
    if (croppedCount === 0) return "Crop PDF";
    return `Crop ${pageLabel(croppedCount)}`;
  });
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf,application/pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files[0])}
  >
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to crop</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Trim white margins or cut pages down to just the part you need.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard
        title={`Cropped ${pageLabel(store.result.pages)}`}
        description={`${store.result.name} is downloaded.`}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="crop-pdf" />
      </ResultCard>
    {/if}

    <ToolBar
      label={store.state.file.name}
      meta={pageLabel(store.state.pageCount)}
      onReset={store.isProcessing ? undefined : () => store.reset()}
      resetLabel="Clear"
    >
      {#snippet actions()}
        <div class="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={current <= 1}
            onclick={() => store.setPage(current - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          <span class="min-w-24 px-1 text-center text-body tabular-nums text-foreground" aria-live="polite">
            Page {current} of {store.state.pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={current >= store.state.pageCount}
            onclick={() => store.setPage(current + 1)}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      {/snippet}
    </ToolBar>

    <p class="text-body text-muted-foreground">
      Drag the edges of the box to choose what to keep. Everything outside it is cut away.
    </p>

    <CropperCanvas {store} class="h-[max(22rem,calc(100dvh-20rem))]" />
  </div>

  <WorkspaceInspector title="Crop">
    <div class="flex flex-col gap-6">
      <OptionGroup label={`Margins on page ${current}`} description="How much to trim from each edge, as a percent of the page.">
        <div class="grid grid-cols-2 gap-3">
          {#each edges as edge (edge.key)}
            <div class="flex flex-col gap-1.5">
              <label for={`${uid}-${edge.key}`} class="text-caption text-muted-foreground">{edge.label}</label>
              <div class="relative">
                <input
                  id={`${uid}-${edge.key}`}
                  type="number"
                  inputmode="decimal"
                  min="0"
                  max="95"
                  step="1"
                  value={toPercent(margins[edge.key])}
                  onchange={(e) => setMargin(edge.key, e.currentTarget.valueAsNumber)}
                  class="h-10 w-full rounded-lg border border-border bg-background pl-3 pr-8 text-body tabular-nums text-foreground outline-none transition-colors focus:border-ring"
                />
                <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-body text-muted-foreground">%</span>
              </div>
            </div>
          {/each}
        </div>
        <Button variant="outline" class="w-full" disabled={!hasCrop} onclick={() => store.clearCrop(current)}>
          <Maximize />
          Keep the whole page
        </Button>
      </OptionGroup>

      <OptionGroup label="Pages">
        <div class="-my-2.5 flex flex-col divide-y divide-border">
          <OptionToggle
            label="Same crop on every page"
            description={`Uses the crop from page ${current} for all ${pageLabel(store.state.pageCount)}`}
            bind:checked={store.state.applyToAll}
          />
        </div>
      </OptionGroup>

      <OptionGroup label="Output">
        <div class="-my-2.5 flex flex-col divide-y divide-border">
          <OptionToggle
            label="Remove hidden content"
            description="Turns cropped pages into images so trimmed parts are gone for good. Text can't be selected afterwards."
            bind:checked={store.state.isDestructive}
          />
        </div>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine
          label={store.progress.text || "Cropping"}
          current={store.progress.current}
          total={store.progress.total}
          class="max-w-md"
        />
      {:else if store.state.applyToAll && !hasCrop}
        <span class="block truncate">Set the crop on page {current} first. It will be used for every page.</span>
      {:else if croppedCount === 0}
        <span class="block truncate">Drag the box or set margins to choose what to keep.</span>
      {:else}
        <span class="block truncate tabular-nums">
          {pageLabel(croppedCount)} will be cropped{store.state.isDestructive ? " and flattened" : ""}
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.crop()} disabled={store.isProcessing || croppedCount === 0}>
      {runLabel}
    </Button>
  </ToolFooter>
{/if}
