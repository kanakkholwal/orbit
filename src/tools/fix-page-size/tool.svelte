<script lang="ts">
  import { ChoiceList, FileRow, OptionGroup, ResultCard, SegmentedControl, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconLoader2 as Loader, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { FixPageSizeState } from "./helper.svelte";

  const store = new FixPageSizeState();
  const uid = $props.id();

  const field =
    "h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-body tabular-nums text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring";

  const sizes = [
    { value: "A4", label: "A4", hint: "210 × 297 mm" },
    { value: "Letter", label: "Letter", hint: "8.5 × 11 in" },
    { value: "Legal", label: "Legal", hint: "8.5 × 14 in" },
    { value: "A3", label: "A3", hint: "297 × 420 mm" },
    { value: "A5", label: "A5", hint: "148 × 210 mm" },
    { value: "Tabloid", label: "Tabloid", hint: "11 × 17 in" },
    { value: "Custom", label: "Custom", hint: "Your own size" },
  ];
  const orientations = [
    { value: "auto", label: "Auto" },
    { value: "portrait", label: "Portrait" },
    { value: "landscape", label: "Landscape" },
  ];
  const units = [
    { value: "in", label: "Inches" },
    { value: "mm", label: "mm" },
  ];
  const scaling: { value: "fit" | "fill"; label: string; hint: string }[] = [
    { value: "fit", label: "Fit the whole page", hint: "Nothing is cut off. Gaps are filled with the colour below." },
    { value: "fill", label: "Fill the page", hint: "No gaps. Edges may be cut off if the shapes differ." },
  ];
  const swatches = [
    { value: "#ffffff", label: "White" },
    { value: "#eeeeee", label: "Light grey" },
    { value: "#000000", label: "Black" },
  ];
  const lines = [60, 0, 100, 92, 96, 70, 0, 100, 88, 94, 60, 0, 100, 90];

  const custom = $derived(store.targetSize === "Custom");
  const blocker = $derived(
    custom && !(Number(store.customWidth) > 0 && Number(store.customHeight) > 0)
      ? "Enter a width and height above zero."
      : null
  );
  const dims = $derived(store.targetDimensions);
  const sizeName = $derived(sizes.find((x) => x.value === store.targetSize)?.label ?? store.targetSize);
  const readable = $derived.by(() => {
    const [w, h] = dims;
    const metric = custom ? store.customUnits === "mm" : sizes.find((x) => x.value === store.targetSize)?.hint.endsWith("mm");
    const fmt = (pt: number) => (metric ? `${Math.round((pt / 72) * 25.4)}` : `${Math.round((pt / 72) * 100) / 100}`);
    return `${fmt(w)} × ${fmt(h)} ${metric ? "mm" : "in"}`;
  });
</script>

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to make every page the same size</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Turn a mix of page sizes into A4, Letter or your own size, ready to print.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard title={`Every page is now ${sizeName}`} description={`${store.result.name} is downloaded.`}>
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="fix-page-size" />
      </ResultCard>
    {/if}

    <FileRow
      name={store.file.file.name}
      meta={formatBytes(store.file.originalSize)}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    <section aria-label="Preview" class="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-6 sm:py-10">
      <div class="grid h-80 w-full place-items-center sm:h-96">
        {#if !blocker}
          <div
            class="@container relative overflow-hidden rounded-sm shadow-sm"
            style:aspect-ratio="{dims[0]} / {dims[1]}"
            style:height={dims[0] > dims[1] ? "auto" : "100%"}
            style:width={dims[0] > dims[1] ? "100%" : "auto"}
            style:max-width="100%"
            style:background-color={store.backgroundColor}
            aria-hidden="true"
          >
            <div
              class={cn(
                "absolute flex flex-col gap-[2.4cqw] p-[8%]",
                store.scalingMode === "fit" ? "inset-x-[10%] inset-y-0" : "-inset-x-[4%] -inset-y-[6%]"
              )}
              style:background-color="#ffffff"
            >
              {#each lines as width, i (i)}
                <span class="h-[1.6cqw] shrink-0 rounded-full" style:width="{width}%" style:background-color="#d4d4d4"></span>
              {/each}
            </div>
          </div>
        {/if}
      </div>
      <p class="text-center text-caption text-muted-foreground">
        {#if blocker}
          Enter a size to see the page shape.
        {:else}
          {sizeName} · {readable}. The white area stands for your page.
        {/if}
      </p>
    </section>
  </div>

  <WorkspaceInspector title="Page size">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Size">
        <div class="grid grid-cols-2 gap-1.5">
          {#each sizes as size (size.value)}
            {@const active = store.targetSize === size.value}
            <label
              class={cn(
                "flex min-h-14 cursor-pointer flex-col justify-center rounded-xl border px-3 py-2 transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-ring",
                active ? "border-primary bg-primary/5" : "border-border hover:border-border-strong",
                size.value === "Custom" && "col-span-2"
              )}
            >
              <input type="radio" name="{uid}-size" value={size.value} bind:group={store.targetSize} class="sr-only" />
              <span class="text-body font-medium text-foreground">{size.label}</span>
              <span class="text-caption tabular-nums text-muted-foreground">{size.hint}</span>
            </label>
          {/each}
        </div>
      </OptionGroup>

      {#if custom}
        <OptionGroup label="Custom size">
          <SegmentedControl name="{uid}-units" options={units} bind:value={store.customUnits} />
          <div class="grid grid-cols-2 gap-2">
            <div class="flex flex-col gap-1">
              <label for="{uid}-width" class="text-caption text-muted-foreground">Width</label>
              <input id="{uid}-width" type="number" step="0.01" min="0.1" bind:value={store.customWidth} class={field} />
            </div>
            <div class="flex flex-col gap-1">
              <label for="{uid}-height" class="text-caption text-muted-foreground">Height</label>
              <input id="{uid}-height" type="number" step="0.01" min="0.1" bind:value={store.customHeight} class={field} />
            </div>
          </div>
        </OptionGroup>
      {/if}

      <OptionGroup
        label="Orientation"
        description={store.orientation === "auto" ? "Uses the size as listed, upright for standard sizes." : undefined}
      >
        <SegmentedControl name="{uid}-orientation" options={orientations} bind:value={store.orientation} />
      </OptionGroup>

      <OptionGroup label="When shapes differ">
        <ChoiceList name="{uid}-scaling" choices={scaling} bind:value={store.scalingMode} />
      </OptionGroup>

      <OptionGroup
        label="Gap colour"
        description={store.scalingMode === "fill" ? "Only shows when fitting the whole page." : undefined}
      >
        <div class="flex flex-wrap items-center gap-2">
          {#each swatches as swatch (swatch.value)}
            {@const active = store.backgroundColor.toLowerCase() === swatch.value}
            <button
              type="button"
              aria-label={swatch.label}
              aria-pressed={active}
              onclick={() => (store.backgroundColor = swatch.value)}
              class={cn(
                "size-10 rounded-full border border-border-strong outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
              style:background-color={swatch.value}
            ></button>
          {/each}
          <label
            class="relative ml-1 flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border px-2 text-body text-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring"
          >
            <span class="size-5 rounded-full border border-border-strong" style:background-color={store.backgroundColor}></span>
            <span class="uppercase tabular-nums">{store.backgroundColor}</span>
            <span class="sr-only">Pick a custom gap colour</span>
            <input type="color" bind:value={store.backgroundColor} class="absolute inset-0 size-full cursor-pointer opacity-0" />
          </label>
        </div>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Resizing pages…
        </span>
      {:else if blocker}
        <span class="block truncate text-destructive">{blocker}</span>
      {:else}
        <span class="block truncate">
          Every page becomes {sizeName} · {store.scalingMode === "fit" ? "whole page kept" : "page filled"}
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || blocker !== null}>
      {store.isProcessing ? "Resizing…" : `Resize to ${sizeName}`}
    </Button>
  </ToolFooter>
{/if}
