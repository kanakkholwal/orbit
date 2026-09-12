<script lang="ts">
  import {
    ChoiceList,
    FileRow,
    OptionGroup,
    OptionToggle,
    ProgressLine,
    ResultCard,
    SegmentedControl,
    ToolFooter,
  } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconLoader2 as Loader, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { cellsInReadingOrder } from "./divide";
  import { DividePagesState, type DivideMode, type PageScope, type ReadingOrder } from "./helper.svelte";

  const store = new DividePagesState();
  const uid = $props.id();

  const modes: { value: DivideMode; label: string; hint: string }[] = [
    { value: "vertical", label: "Left and right", hint: "Scanned book spreads and two-up pages" },
    { value: "horizontal", label: "Top and bottom", hint: "Two halves stacked on one page" },
    { value: "grid", label: "Grid", hint: "Posters and large sheets, like 2 × 2 or 3 × 3" },
  ];
  const orders: { value: ReadingOrder; label: string }[] = [
    { value: "ltr", label: "Left to right" },
    { value: "rtl", label: "Right to left" },
  ];
  const scopes: { value: PageScope; label: string }[] = [
    { value: "all", label: "All pages" },
    { value: "range", label: "Some pages" },
  ];
  const presets = [2, 3, 4];
  const field =
    "h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring disabled:opacity-50";

  let canvas = $state<HTMLCanvasElement | null>(null);
  let rendering = $state(false);

  const targets = $derived(store.targets);
  const previewIndex = $derived(targets[0] ?? 0);
  const cells = $derived(cellsInReadingOrder(store.columns, store.rows, store.readingOrder === "rtl"));
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;

  $effect(() => {
    const target = canvas;
    const index = previewIndex;
    if (!target || !store.preview) return;
    let cancelled = false;
    rendering = true;
    store.renderPreview(target, index).finally(() => {
      if (cancelled) return;
      target.style.width = "100%";
      target.style.height = "auto";
      rendering = false;
    });
    return () => {
      cancelled = true;
    };
  });
</script>

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to divide its pages</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Cut scanned book spreads into single pages, or split a poster into a grid of sheets.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard title={`Divided into ${pageLabel(store.result.pages)}`} description={`${store.result.name} is downloaded.`}>
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="divide-pages" />
      </ResultCard>
    {/if}

    <FileRow
      name={store.file.name}
      meta={`${formatBytes(store.file.size)} · ${pageLabel(store.pageCount)}`}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    <section aria-label="Preview" class="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-6 sm:py-8">
      {#if targets.length === 0}
        <p class="py-12 text-center text-body text-muted-foreground">
          {store.rangeIssue ?? "No pages left to divide. Turn off a skip option or pick other pages."}
        </p>
      {:else}
        <div class="relative w-full max-w-[360px] overflow-hidden rounded-sm bg-white shadow-sm">
          <canvas bind:this={canvas} class="block w-full" aria-hidden="true"></canvas>
          {#if rendering}
            <div class="absolute inset-0 grid place-items-center">
              <Loader class="size-5 animate-spin text-primary" />
            </div>
          {/if}
          <div
            class="absolute inset-0 grid"
            style:grid-template-columns="repeat({store.columns}, minmax(0, 1fr))"
            style:grid-template-rows="repeat({store.rows}, minmax(0, 1fr))"
            aria-hidden="true"
          >
            {#each Array.from({ length: store.parts }, (_, k) => k) as k (k)}
              {@const col = k % store.columns}
              {@const row = Math.floor(k / store.columns)}
              {@const order = cells.findIndex((c) => Math.round(c.u0 * store.columns) === col && Math.round(c.v0 * store.rows) === row)}
              <div
                class={cn(
                  "grid place-items-center border-dashed border-primary",
                  col < store.columns - 1 && "border-r-2",
                  row < store.rows - 1 && "border-b-2"
                )}
              >
                <span class="grid size-7 place-items-center rounded-full bg-primary text-caption font-medium text-primary-foreground shadow-sm">
                  {order + 1}
                </span>
              </div>
            {/each}
          </div>
        </div>
        <p class="text-center text-caption text-muted-foreground">
          Page {previewIndex + 1} of {store.pageCount}. Numbers show the order of the new pages.
        </p>
      {/if}
    </section>
  </div>

  <WorkspaceInspector title="Divide">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Cut into">
        <ChoiceList name="{uid}-mode" choices={modes} bind:value={store.mode} />
      </OptionGroup>

      {#if store.mode === "grid"}
        <OptionGroup label="Grid size" description="Columns across and rows down, up to 8 each.">
          <div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
            <label for="{uid}-cols" class="sr-only">Columns</label>
            <input id="{uid}-cols" type="number" min="1" max="8" bind:value={store.gridColumns} class={field} />
            <span class="text-body text-muted-foreground" aria-hidden="true">×</span>
            <label for="{uid}-rows" class="sr-only">Rows</label>
            <input id="{uid}-rows" type="number" min="1" max="8" bind:value={store.gridRows} class={field} />
          </div>
          <div class="grid grid-cols-3 gap-2">
            {#each presets as n (n)}
              <Button
                variant="outline"
                size="sm"
                aria-pressed={store.columns === n && store.rows === n}
                class={cn(store.columns === n && store.rows === n && "border-primary text-primary")}
                onclick={() => {
                  store.gridColumns = n;
                  store.gridRows = n;
                }}
              >
                {n} × {n}
              </Button>
            {/each}
          </div>
        </OptionGroup>
      {/if}

      <OptionGroup
        label="Reading order"
        description={store.columns === 1
          ? "Only matters when a page is cut into columns."
          : "Choose right to left for Arabic, Hebrew, Japanese and other right-to-left books."}
      >
        <SegmentedControl name="{uid}-order" options={orders} bind:value={store.readingOrder} />
      </OptionGroup>

      <OptionGroup label="Pages" description="Pages you leave out stay whole in the result.">
        <SegmentedControl name="{uid}-scope" options={scopes} bind:value={store.scope} />
        <label for="{uid}-range" class="sr-only">Pages to divide</label>
        <input
          id="{uid}-range"
          type="text"
          inputmode="numeric"
          bind:value={store.range}
          disabled={store.scope === "all"}
          placeholder={`For example 2-${Math.max(2, store.pageCount)}`}
          aria-invalid={store.rangeIssue ? "true" : undefined}
          class={cn(field, store.rangeIssue && store.range.trim() && "border-destructive")}
        />
        <div class="-mb-2.5 flex flex-col divide-y divide-border">
          <OptionToggle label="Keep the first page whole" description="For a front cover" bind:checked={store.skipFirst} />
          <OptionToggle label="Keep the last page whole" description="For a back cover" bind:checked={store.skipLast} />
        </div>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if store.rangeIssue}
        <span class="block truncate text-destructive">{store.rangeIssue}.</span>
      {:else if store.parts < 2}
        <span class="block truncate">Pick a grid with at least two parts.</span>
      {:else}
        <span class="block truncate tabular-nums">
          {pageLabel(targets.length)} into {store.parts} parts · {pageLabel(store.resultPageCount)} in the result
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={!store.canRun}>
      {store.isProcessing ? "Dividing…" : `Divide ${pageLabel(targets.length)}`}
    </Button>
  </ToolFooter>
{/if}
