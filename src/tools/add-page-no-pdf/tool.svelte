<script lang="ts">
  import { FileRow, OptionGroup, ResultCard, SegmentedControl, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconLoader2 as Loader, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { PageNumberState, type NumberFormat, type Position } from "./helper.svelte";

  const store = new PageNumberState();
  const uid = $props.id();

  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const field =
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-body tabular-nums text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring";

  const positions: { value: Position; label: string }[] = [
    { value: "top-left", label: "Top left" },
    { value: "top-center", label: "Top centre" },
    { value: "top-right", label: "Top right" },
    { value: "bottom-left", label: "Bottom left" },
    { value: "bottom-center", label: "Bottom centre" },
    { value: "bottom-right", label: "Bottom right" },
  ];
  const formats: { value: NumberFormat; label: string }[] = [
    { value: "n", label: "1, 2, 3" },
    { value: "n of x", label: "1 of 10" },
  ];
  const swatches = [
    { value: "#000000", label: "Black" },
    { value: "#6b6b6b", label: "Grey" },
    { value: "#0060c9", label: "Blue" },
  ];
  const lines = [100, 92, 96, 70, 0, 100, 88, 94, 60, 0, 100, 90, 82, 76];

  const s = $derived(store.state);
  const start = $derived(Number(s.startFromPage));
  const blocker = $derived(
    !Number.isInteger(start) || start < 1 || start > s.pageCount
      ? `Choose a start page from 1 to ${s.pageCount}.`
      : null
  );
  const sample = $derived.by(() => {
    const n = blocker ? 1 : start;
    return s.format === "n" ? `${n}` : `${n} of ${s.pageCount}`;
  });
  const numbered = $derived(blocker ? 0 : s.pageCount - start + 1);
  const positionLabel = $derived(positions.find((p) => p.value === s.position)?.label ?? "");
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
</script>

{#if !s.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files[0])}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to number its pages</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Add page numbers in the corner or centre of every page, so printed copies stay in order.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard title="Page numbers added" description={`${store.result.name} is downloaded.`}>
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="add-page-no-pdf" />
      </ResultCard>
    {/if}

    <FileRow
      name={s.file.name}
      meta={`${formatBytes(s.file.size)} · ${pageLabel(s.pageCount)}`}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    <section aria-label="Preview" class="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-6 sm:py-10">
      <div
        class="@container relative w-full max-w-sm overflow-hidden rounded-sm shadow-sm"
        style:aspect-ratio="{PAGE_W} / {PAGE_H}"
        style:background-color="#ffffff"
        aria-hidden="true"
      >
        <div class="absolute inset-[12%] flex flex-col gap-[2.4cqw]">
          {#each lines as width, i (i)}
            <span class="h-[1.6cqw] rounded-full" style:width="{width}%" style:background-color="#e5e5e5"></span>
          {/each}
        </div>
        <span
          class={cn(
            "absolute whitespace-nowrap leading-none",
            s.position.endsWith("center") && "-translate-x-1/2"
          )}
          style:font-family="Helvetica, Arial, sans-serif"
          style:font-size="{(s.fontSize / PAGE_W) * 100}cqw"
          style:color={s.color}
          style:left={s.position.endsWith("left") ? `${(s.margin / PAGE_W) * 100}%` : s.position.endsWith("center") ? "50%" : undefined}
          style:right={s.position.endsWith("right") ? `${(s.margin / PAGE_W) * 100}%` : undefined}
          style:top={s.position.startsWith("top") ? `${(s.margin / PAGE_H) * 100}%` : undefined}
          style:bottom={s.position.startsWith("bottom") ? `calc(${(s.margin / PAGE_H) * 100}% - 0.21em)` : undefined}
        >
          {sample}
        </span>
      </div>
      <p class="text-center text-caption text-muted-foreground">
        Preview of page {blocker ? 1 : start} on a standard page.
      </p>
    </section>
  </div>

  <WorkspaceInspector title="Page numbers">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Position" description={positionLabel}>
        <div class="grid aspect-3/4 w-36 grid-cols-3 grid-rows-[auto_1fr_auto] rounded-xl border border-border bg-background p-1">
          {#each positions as position, i (position.value)}
            {@const active = s.position === position.value}
            {#if i === 3}
              <span class="col-span-3" aria-hidden="true"></span>
            {/if}
            <button
              type="button"
              aria-label={position.label}
              aria-pressed={active}
              onclick={() => (store.state.position = position.value)}
              class="group grid h-10 place-items-center rounded-lg outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <span
                class={cn(
                  "h-1.5 rounded-full transition-[background-color,width]",
                  active ? "w-5 bg-primary" : "w-3 bg-border-strong group-hover:bg-muted-foreground"
                )}
              ></span>
            </button>
          {/each}
        </div>
      </OptionGroup>

      <OptionGroup label="Style">
        <SegmentedControl name="{uid}-format" options={formats} bind:value={store.state.format} />
      </OptionGroup>

      <OptionGroup label="Start numbering on page" description="Earlier pages, like a cover, are left without a number.">
        <label for="{uid}-start" class="sr-only">Start numbering on page</label>
        <input
          id="{uid}-start"
          type="number"
          min="1"
          max={s.pageCount}
          bind:value={store.state.startFromPage}
          aria-invalid={blocker !== null}
          class={cn(field, blocker && "border-destructive")}
        />
      </OptionGroup>

      <OptionGroup label="Colour">
        <div class="flex flex-wrap items-center gap-2">
          {#each swatches as swatch (swatch.value)}
            {@const active = s.color.toLowerCase() === swatch.value}
            <button
              type="button"
              aria-label={swatch.label}
              aria-pressed={active}
              onclick={() => (store.state.color = swatch.value)}
              class={cn(
                "size-10 rounded-full border border-border outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
              style:background-color={swatch.value}
            ></button>
          {/each}
          <label
            class="relative ml-1 flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border px-2 text-body text-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring"
          >
            <span class="size-5 rounded-full border border-border" style:background-color={s.color}></span>
            <span class="uppercase tabular-nums">{s.color}</span>
            <span class="sr-only">Pick a custom colour</span>
            <input type="color" bind:value={store.state.color} class="absolute inset-0 size-full cursor-pointer opacity-0" />
          </label>
        </div>
      </OptionGroup>

      <div class="flex flex-col gap-1">
        <div class="flex items-baseline justify-between gap-3">
          <label for="{uid}-size" class="text-body font-medium text-foreground">Size</label>
          <span class="text-body tabular-nums text-muted-foreground">{s.fontSize} pt</span>
        </div>
        <input id="{uid}-size" type="range" min="6" max="72" step="1" bind:value={store.state.fontSize} class="h-10 w-full cursor-pointer accent-primary" />
      </div>

      <div class="flex flex-col gap-1">
        <div class="flex items-baseline justify-between gap-3">
          <label for="{uid}-margin" class="text-body font-medium text-foreground">Distance from edge</label>
          <span class="text-body tabular-nums text-muted-foreground">{s.margin} pt</span>
        </div>
        <input id="{uid}-margin" type="range" min="0" max="100" step="2" bind:value={store.state.margin} class="h-10 w-full cursor-pointer accent-primary" />
      </div>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Adding page numbers…
        </span>
      {:else if blocker}
        <span class="block truncate text-destructive">{blocker}</span>
      {:else}
        <span class="block truncate">{pageLabel(numbered)} numbered · {positionLabel.toLowerCase()}</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || blocker !== null}>
      {store.isProcessing ? "Numbering…" : `Number ${pageLabel(numbered)}`}
    </Button>
  </ToolFooter>
{/if}
