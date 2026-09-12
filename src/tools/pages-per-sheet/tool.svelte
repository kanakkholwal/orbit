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
  import { IconDownload as Download, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { PagesPerSheetState } from "./helper.svelte";
  import { MM, type Orientation, type Order, type PerSheet, placeInCell, type SheetSize } from "./layout";

  const store = new PagesPerSheetState();
  const uid = $props.id();

  const counts: { value: PerSheet; cols: number; rows: number }[] = [
    { value: 2, cols: 1, rows: 2 },
    { value: 4, cols: 2, rows: 2 },
    { value: 6, cols: 2, rows: 3 },
    { value: 8, cols: 2, rows: 4 },
    { value: 9, cols: 3, rows: 3 },
  ];
  const orientations: { value: Orientation; label: string }[] = [
    { value: "auto", label: "Auto" },
    { value: "portrait", label: "Portrait" },
    { value: "landscape", label: "Landscape" },
  ];
  const orders: { value: Order; label: string }[] = [
    { value: "across", label: "Across" },
    { value: "down", label: "Down" },
  ];

  const plural = (n: number, word: string) => `${n} ${n === 1 ? word : `${word}s`}`;
  const mm = (pt: number) => Math.round(pt / MM);

  const layout = $derived(store.layout);
  const landscape = $derived(layout.width > layout.height);
  const sizeName = $derived(store.settings.size === "original" ? "original size" : store.settings.size);
  const sizes = $derived<{ value: SheetSize; label: string; hint: string }[]>([
    {
      value: "original",
      label: "Same as the original",
      hint: `${mm(store.firstPage.width)} × ${mm(store.firstPage.height)} mm, from the first page`,
    },
    { value: "A4", label: "A4", hint: "210 × 297 mm" },
    { value: "Letter", label: "Letter", hint: "8.5 × 11 in" },
  ]);
  const tooTight = $derived(layout.cells.some((c) => c.width < 36 || c.height < 36));
  const previewPages = $derived(
    layout.cells.map((cell) => placeInCell(store.firstPage.width, store.firstPage.height, cell))
  );
</script>

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to fit more pages on each sheet</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Put 2, 4, 6, 8 or 9 pages side by side on every sheet to print handouts and save paper.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard
        title={`${plural(store.result.pages, "page")} on ${plural(store.result.sheets, "sheet")}`}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="pages-per-sheet" />
      </ResultCard>
    {/if}

    <FileRow
      name={store.file.name}
      meta={`${formatBytes(store.file.size)} · ${plural(store.pageCount, "page")}`}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    <section aria-label="Preview of the first sheet" class="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-6 sm:py-10">
      <div class="h-72 w-full sm:h-96">
        <svg
          viewBox="{-layout.width * 0.03} {-layout.height * 0.03} {layout.width * 1.06} {layout.height * 1.06}"
          class="size-full"
          aria-hidden="true"
        >
          <rect x="0" y="0" width={layout.width} height={layout.height} class="fill-background stroke-border-strong" vector-effect="non-scaling-stroke" />
          {#each previewPages as box, i (i)}
            {@const filled = i < store.pageCount}
            <rect
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
              class={cn(
                filled ? "fill-primary/10" : "fill-none stroke-border-strong",
                filled && store.settings.border && "stroke-muted-foreground"
              )}
              stroke-dasharray={filled ? undefined : "4 3"}
              vector-effect="non-scaling-stroke"
            />
            {#if filled}
              <text
                x={box.x + box.width / 2}
                y={box.y + box.height / 2}
                text-anchor="middle"
                dominant-baseline="central"
                font-size={Math.min(box.width, box.height) * 0.28}
                class="fill-primary font-medium tabular-nums"
              >
                {i + 1}
              </text>
            {/if}
          {/each}
        </svg>
      </div>
      <p class="text-center text-caption text-muted-foreground">
        {store.settings.perSheet} pages on each {sizeName} {landscape ? "landscape" : "portrait"} sheet · {plural(store.pageCount, "page")} become {plural(store.sheetCount, "sheet")}
      </p>
    </section>
  </div>

  <WorkspaceInspector title="Layout">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Pages per sheet">
        <div class="grid grid-cols-5 gap-1.5">
          {#each counts as count (count.value)}
            {@const active = store.settings.perSheet === count.value}
            <label
              class={cn(
                "flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-1 py-2 transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-ring",
                active ? "border-primary bg-primary/5" : "border-border hover:border-border-strong"
              )}
            >
              <input type="radio" name="{uid}-count" value={count.value} bind:group={store.settings.perSheet} class="sr-only" />
              <span
                aria-hidden="true"
                class="grid h-7 w-5 gap-px"
                style:grid-template-columns={`repeat(${count.cols}, minmax(0, 1fr))`}
                style:grid-template-rows={`repeat(${count.rows}, minmax(0, 1fr))`}
              >
                {#each Array.from({ length: count.cols * count.rows }, (_, k) => k) as k (k)}
                  <span class={cn("rounded-[1px]", active ? "bg-primary" : "bg-placeholder")}></span>
                {/each}
              </span>
              <span class="text-body font-medium tabular-nums text-foreground">{count.value}</span>
            </label>
          {/each}
        </div>
      </OptionGroup>

      <OptionGroup label="Sheet size">
        <ChoiceList name="{uid}-size" choices={sizes} bind:value={store.settings.size} />
      </OptionGroup>

      <OptionGroup
        label="Orientation"
        description={store.settings.orientation === "auto" ? "Turns the sheet whichever way makes the pages largest." : undefined}
      >
        <SegmentedControl name="{uid}-orientation" options={orientations} bind:value={store.settings.orientation} />
      </OptionGroup>

      <OptionGroup
        label="Page order"
        description={store.settings.order === "across"
          ? "Left to right, then the next row down."
          : "Top to bottom, then the next column across."}
      >
        <SegmentedControl name="{uid}-order" options={orders} bind:value={store.settings.order} />
      </OptionGroup>

      <OptionGroup label="Spacing" description="Pages keep their shape and are centred in their space.">
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <div class="flex items-baseline justify-between text-caption">
              <label for="{uid}-margin" class="text-muted-foreground">Margin around the sheet</label>
              <span class="tabular-nums text-foreground">{store.settings.marginMm} mm</span>
            </div>
            <input id="{uid}-margin" type="range" min="0" max="25" step="1" bind:value={store.settings.marginMm} class="h-10 w-full cursor-pointer accent-primary" />
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-baseline justify-between text-caption">
              <label for="{uid}-gap" class="text-muted-foreground">Gap between pages</label>
              <span class="tabular-nums text-foreground">{store.settings.gapMm} mm</span>
            </div>
            <input id="{uid}-gap" type="range" min="0" max="20" step="1" bind:value={store.settings.gapMm} class="h-10 w-full cursor-pointer accent-primary" />
          </div>
        </div>
      </OptionGroup>

      <OptionGroup label="Extras">
        <div class="-my-2.5 flex flex-col">
          <OptionToggle label="Border around each page" description="A thin grey outline, handy for cutting" bind:checked={store.settings.border} />
        </div>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if tooTight}
        <span class="block truncate text-destructive">Lower the margin or gap to leave room for the pages.</span>
      {:else}
        <span class="block truncate tabular-nums">
          {plural(store.pageCount, "page")} become {plural(store.sheetCount, "sheet")} · {store.settings.perSheet} per sheet
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || tooTight}>
      {store.isProcessing ? "Creating…" : `Create ${plural(store.sheetCount, "sheet")}`}
    </Button>
  </ToolFooter>
{/if}
