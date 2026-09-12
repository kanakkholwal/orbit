<script lang="ts">
  import { ChoiceList, FileRow, OptionGroup, ResultCard, SegmentedControl, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import {
    IconArrowsExchange as Swap,
    IconDownload as Download,
    IconLoader2 as Loader,
    IconRefresh as Refresh,
    IconStack2 as Stack,
  } from "@tabler/icons-svelte";
  import type { OverlayFit, OverlayPages, OverlayPosition } from "./overlay";
  import { OverlayState } from "./helper.svelte";

  const store = new OverlayState();
  const uid = $props.id();

  const positions: { value: OverlayPosition; label: string }[] = [
    { value: "top", label: "On top" },
    { value: "under", label: "Underneath" },
  ];
  const pageModes: { value: OverlayPages; label: string; hint: string }[] = [
    { value: "first", label: "First page on every page", hint: "One letterhead, stamp or background for the whole file" },
    { value: "repeat", label: "Repeat pages in order", hint: "Overlay pages 1, 2, 1, 2… across your pages" },
    { value: "match", label: "Match page by page", hint: "Page 1 gets overlay page 1, page 2 gets page 2, and so on" },
  ];
  const applyOptions: { value: "all" | "range"; label: string }[] = [
    { value: "all", label: "All pages" },
    { value: "range", label: "Some pages" },
  ];
  const fits: { value: OverlayFit; label: string }[] = [
    { value: "fit", label: "Fit the page" },
    { value: "keep", label: "Original size" },
  ];

  let mainCanvas = $state<HTMLCanvasElement | null>(null);
  let overlayCanvas = $state<HTMLCanvasElement | null>(null);
  let frameWidth = $state(0);
  let mainReady = $state(false);
  let overlayReady = $state(false);

  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
  const preview = $derived(store.preview);
  const showResult = $derived(!store.isProcessing && store.result !== null);
  const canApply = $derived(!!store.main && !!store.overlay && !store.rangeError && store.coveredCount > 0);

  const matchNote = $derived.by(() => {
    if (!store.main || !store.overlay || store.pages !== "match") return undefined;
    const extra = store.targets.length - store.coveredCount;
    return extra > 0 ? `The overlay has ${pageLabel(store.overlay.boxes.length)}, so ${pageLabel(extra)} won't get one.` : undefined;
  });

  $effect(() => {
    const canvas = mainCanvas;
    const pdf = store.main;
    const index = preview?.pageIndex;
    const width = Math.round(frameWidth);
    if (!canvas || !pdf || index === undefined || width <= 0) return;
    mainReady = false;
    let cancelled = false;
    const timer = setTimeout(() => {
      store.renderPage(pdf, index, canvas, width).then(() => {
        if (!cancelled) mainReady = true;
      });
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  });

  $effect(() => {
    const canvas = overlayCanvas;
    const pdf = store.overlay;
    const index = preview?.overlayIndex;
    const widthPercent = preview?.rect?.width ?? 0;
    const width = Math.round((frameWidth * widthPercent) / 100);
    if (!canvas || !pdf || index === null || index === undefined || width <= 0) return;
    overlayReady = false;
    let cancelled = false;
    const timer = setTimeout(() => {
      store.renderPage(pdf, index, canvas, width).then(() => {
        if (!cancelled) overlayReady = true;
      });
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  });
</script>

{#if !store.main}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.setMain(files)}>
    {#snippet icon()}
      <Stack class="size-6" stroke={1.75} />
    {/snippet}
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">
        {store.loading === "main" ? "Opening…" : "Drop the PDF to add an overlay to"}
      </h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Put a letterhead, stamp or template from another PDF on top of or behind its pages.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult && store.result}
      <ResultCard
        title="Overlay added"
        description={`${pageLabel(store.result.pages)} changed. ${store.result.name} is downloaded.`}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="overlay-pdf" />
      </ResultCard>
    {/if}

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-body font-medium text-foreground">Files</h2>
        {#if store.overlay}
          <Button variant="ghost" size="sm" disabled={store.isProcessing} onclick={() => store.swap()}>
            <Swap />
            Swap
          </Button>
        {/if}
      </div>
      <FileRow name={store.main.file.name} onRemove={store.isProcessing ? undefined : () => store.reset()}>
        <span class="font-medium text-foreground">Document</span>
        <span>{formatBytes(store.main.file.size)} · {pageLabel(store.main.boxes.length)}</span>
      </FileRow>
      {#if store.overlay}
        <FileRow name={store.overlay.file.name} onRemove={store.isProcessing ? undefined : () => store.clearOverlay()}>
          <span class="font-medium text-foreground">Overlay</span>
          <span>{formatBytes(store.overlay.file.size)} · {pageLabel(store.overlay.boxes.length)}</span>
        </FileRow>
      {/if}
    </div>

    {#if !store.overlay}
      <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.setOverlay(files)}>
        {#snippet title()}
          <h3 class="text-heading-sm font-medium text-foreground">
            {store.loading === "overlay" ? "Opening…" : "Now add the overlay PDF"}
          </h3>
        {/snippet}
        {#snippet description()}
          <p class="max-w-sm text-pretty text-body text-muted-foreground">
            The letterhead, stamp or template whose pages go on your document.
          </p>
        {/snippet}
      </UploadArea>
    {:else}
      <section class="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5" aria-labelledby="{uid}-preview">
        <div class="flex flex-col gap-0.5">
          <h2 id="{uid}-preview" class="text-body-lg font-medium text-foreground">
            {preview ? `Preview of page ${preview.pageIndex + 1}` : "Preview"}
          </h2>
          <p class="text-body text-muted-foreground">A rough look to check placement. The downloaded file is exact.</p>
        </div>

        {#if !preview}
          <p class="text-body text-muted-foreground">Choose which pages to change to see a preview.</p>
        {:else}
          <div class="mx-auto w-full max-w-sm">
            <div
              class="relative w-full max-w-full overflow-hidden rounded-lg border border-border bg-white shadow-xs"
              style:aspect-ratio="{preview.target.width} / {preview.target.height}"
              bind:clientWidth={frameWidth}
            >
              <canvas
                bind:this={mainCanvas}
                class={cn(
                  "absolute inset-0 h-full w-full transition-opacity duration-200",
                  store.position === "under" ? "z-10 mix-blend-multiply" : "z-0",
                  mainReady ? "opacity-100" : "opacity-0"
                )}
              ></canvas>
              {#if preview.rect}
                <canvas
                  bind:this={overlayCanvas}
                  class={cn("absolute mix-blend-multiply transition-opacity duration-200", store.position === "under" ? "z-0" : "z-10")}
                  style:left="{preview.rect.left}%"
                  style:top="{preview.rect.top}%"
                  style:width="{preview.rect.width}%"
                  style:height="{preview.rect.height}%"
                  style:opacity={overlayReady ? store.opacity / 100 : 0}
                ></canvas>
              {/if}
              {#if !mainReady}
                <div class="absolute inset-0 z-20 grid place-items-center">
                  <Loader class="size-5 animate-spin text-muted-foreground" />
                </div>
              {/if}
            </div>
            {#if preview.overlayIndex === null}
              <p class="mt-2 text-caption text-muted-foreground">This page doesn't get an overlay with the current settings.</p>
            {:else}
              <p class="mt-2 text-caption text-muted-foreground">
                With overlay page {preview.overlayIndex + 1}{store.overlay.boxes.length > 1 ? ` of ${store.overlay.boxes.length}` : ""}
              </p>
            {/if}
          </div>
        {/if}
      </section>
    {/if}
  </div>

  <WorkspaceInspector title="Overlay">
    <div class="flex flex-col gap-6">
      <OptionGroup
        label="Position"
        description={store.position === "top"
          ? "Drawn over your pages, like a stamp."
          : "Placed behind your content, like letterhead paper. Pages with a solid white background will hide it."}
      >
        <SegmentedControl name="{uid}-position" options={positions} bind:value={store.position} />
      </OptionGroup>

      <OptionGroup label="Overlay pages" description={matchNote}>
        <ChoiceList name="{uid}-pages" choices={pageModes} bind:value={store.pages} />
      </OptionGroup>

      <OptionGroup label="Apply to">
        <SegmentedControl name="{uid}-apply" options={applyOptions} bind:value={store.applyTo} />
        {#if store.applyTo === "range"}
          <div class="flex flex-col gap-1.5">
            <label for="{uid}-range" class="sr-only">Pages</label>
            <Input
              id="{uid}-range"
              bind:value={store.range}
              placeholder="1-3, 5"
              inputmode="numeric"
              aria-invalid={!!store.rangeError && store.range.trim() !== ""}
              aria-describedby="{uid}-range-hint"
            />
            <p id="{uid}-range-hint" class={cn("text-caption", store.rangeError && store.range.trim() ? "text-destructive" : "text-muted-foreground")}>
              {store.rangeError ?? `${pageLabel(store.targets.length)} selected`}
            </p>
          </div>
        {/if}
      </OptionGroup>

      <OptionGroup label="Opacity">
        <div class="flex items-center gap-3">
          <label for="{uid}-opacity" class="sr-only">Opacity</label>
          <input id="{uid}-opacity" type="range" min="5" max="100" step="5" bind:value={store.opacity} class="h-10 w-full cursor-pointer accent-primary" />
          <span class="w-11 shrink-0 text-right text-body tabular-nums text-foreground">{store.opacity}%</span>
        </div>
      </OptionGroup>

      <OptionGroup
        label="Size"
        description={store.fit === "fit"
          ? "Scaled to fit inside each page and centred."
          : "Kept at its own size, lined up with the top-left corner."}
      >
        <SegmentedControl name="{uid}-fit" options={fits} bind:value={store.fit} />
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      <span class="block truncate">
        {#if store.isProcessing}
          Adding the overlay…
        {:else if !store.overlay}
          Add the overlay PDF to continue
        {:else if store.rangeError}
          {store.rangeError}
        {:else}
          {pageLabel(store.coveredCount)} · {store.position === "top" ? "on top" : "underneath"} · {store.opacity}% opacity
        {/if}
      </span>
    {/snippet}
    <Button variant="primary" onclick={() => store.apply()} disabled={store.isProcessing || !canApply}>
      {store.isProcessing ? "Applying…" : "Apply overlay"}
    </Button>
  </ToolFooter>
{/if}
