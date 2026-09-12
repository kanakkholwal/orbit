<script lang="ts">
  import {
    ChoiceList,
    FileRow,
    OptionGroup,
    ProgressLine,
    ResultCard,
    SegmentedControl,
    ToolFooter,
  } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconChevronLeft as ChevronLeft,
    IconChevronRight as ChevronRight,
    IconDownload as Download,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { ColorFiltersState, type Resolution } from "./helper.svelte";
  import { filterCanvas, type FilterKind } from "./raster";

  const store = new ColorFiltersState();
  const uid = $props.id();
  const PREVIEW_WIDTH = 360;

  const filters: { value: FilterKind; label: string; hint: string }[] = [
    { value: "grayscale", label: "Grayscale", hint: "Shades of grey, like a black and white photo" },
    { value: "blackwhite", label: "Black and white", hint: "Only pure black and white. Crisp for text" },
    { value: "invert", label: "Invert", hint: "Light text on a dark page for reading at night" },
    { value: "sepia", label: "Sepia", hint: "Warm brown tones, like an old print" },
    { value: "scanner", label: "Scanner effect", hint: "Looks like a paper copy run through a scanner" },
    { value: "adjust", label: "Adjust", hint: "Set brightness, contrast and colour yourself" },
  ];

  const resolutions: { value: Resolution; label: string }[] = [
    { value: "150", label: "150 DPI" },
    { value: "200", label: "200 DPI" },
    { value: "300", label: "300 DPI" },
  ];

  let source = $state.raw<HTMLCanvasElement | null>(null);
  let beforeCanvas = $state<HTMLCanvasElement | null>(null);
  let afterCanvas = $state<HTMLCanvasElement | null>(null);

  const s = $derived(store.settings);
  const busy = $derived(store.isProcessing);
  const filterLabel = $derived(filters.find((f) => f.value === s.kind)?.label ?? "");
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
  const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

  function copyInto(target: HTMLCanvasElement, from: HTMLCanvasElement) {
    target.width = from.width;
    target.height = from.height;
    target.getContext("2d")?.drawImage(from, 0, 0);
  }

  $effect(() => {
    const index = store.previewPage - 1;
    if (!store.file) return;
    let live = true;
    store
      .renderPreview(index, PREVIEW_WIDTH)
      .then((canvas) => {
        if (!canvas) return;
        if (!live) {
          canvas.width = canvas.height = 0;
          return;
        }
        const old = source;
        source = canvas;
        if (old) old.width = old.height = 0;
      })
      .catch(console.error);
    return () => {
      live = false;
    };
  });

  $effect(() => {
    if (source && beforeCanvas) copyInto(beforeCanvas, source);
  });

  $effect(() => {
    const from = source;
    const target = afterCanvas;
    const settings = $state.snapshot(store.settings);
    const seed = store.previewPage;
    if (!from || !target) return;
    const frame = requestAnimationFrame(() => {
      copyInto(target, from);
      filterCanvas(target, settings, seed);
    });
    return () => cancelAnimationFrame(frame);
  });

  function stepPage(delta: number) {
    store.previewPage = Math.min(store.pageCount, Math.max(1, store.previewPage + delta));
  }

  function reset() {
    if (source) source.width = source.height = 0;
    source = null;
    store.reset();
  }
</script>

{#snippet slider(
  key: string,
  label: string,
  readout: string,
  min: number,
  max: number,
  value: number,
  disabled: boolean,
  oninput: (v: number) => void
)}
  <div class="flex flex-col gap-1">
    <div class="flex items-baseline justify-between gap-3">
      <label for="{uid}-{key}" class="text-body text-foreground">{label}</label>
      <span class="text-body tabular-nums text-muted-foreground">{readout}</span>
    </div>
    <input
      id="{uid}-{key}"
      type="range"
      {min}
      {max}
      step="1"
      {value}
      {disabled}
      oninput={(e) => oninput(Number(e.currentTarget.value))}
      class="h-10 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
    />
  </div>
{/snippet}

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to change its colours</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Make pages grey, black and white, dark for night reading, or look scanned.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !busy}
      <ResultCard
        title={`${filterLabel} applied`}
        description={`${store.result.name} is downloaded, ${formatBytes(store.result.blob.size)}.`}
      >
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadResult()}>
            <Download />
            Download again
          </Button>
          <Button variant="ghost" onclick={reset}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="pdf-color-filters" />
      </ResultCard>
    {/if}

    <FileRow
      name={store.file.name}
      meta={`${formatBytes(store.file.size)} · ${pageLabel(store.pageCount)}`}
      onRemove={busy ? undefined : reset}
    />

    <section aria-label="Preview" class="flex flex-col gap-3 rounded-2xl border border-border bg-muted p-3 sm:p-4">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-body font-medium text-foreground">Preview</h2>
        <div class="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous page"
            disabled={store.previewPage <= 1}
            onclick={() => stepPage(-1)}
          >
            <ChevronLeft />
          </Button>
          <span class="min-w-20 text-center text-caption tabular-nums text-muted-foreground" aria-live="polite">
            Page {store.previewPage} of {store.pageCount}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next page"
            disabled={store.previewPage >= store.pageCount}
            onclick={() => stepPage(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <figure class="flex flex-col items-center gap-2">
          <canvas
            bind:this={beforeCanvas}
            aria-label="Page before the filter"
            class="h-auto w-full max-w-sm rounded-sm bg-background shadow-sm"
          ></canvas>
          <figcaption class="text-caption text-muted-foreground">Before</figcaption>
        </figure>
        <figure class="flex flex-col items-center gap-2">
          <canvas
            bind:this={afterCanvas}
            aria-label="Page after the filter"
            class="h-auto w-full max-w-sm rounded-sm bg-background shadow-sm"
          ></canvas>
          <figcaption class="text-caption text-muted-foreground">After</figcaption>
        </figure>
      </div>
    </section>

    <p class="text-body text-muted-foreground">
      Pages are saved as pictures, so their text can no longer be selected or searched. Run
      <a href="/tools/ocr-pdf" class="font-medium text-primary underline-offset-4 hover:underline">OCR PDF</a>
      afterwards to make it searchable again.
    </p>
  </div>

  <WorkspaceInspector title="Colour filter">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Filter">
        <ChoiceList name="{uid}-filter" choices={filters} bind:value={store.settings.kind} />
      </OptionGroup>

      <OptionGroup
        label="Black and white level"
        description={s.kind === "blackwhite" ? "Higher turns more grey into black." : "Only for Black and white."}
      >
        {@render slider(
          "threshold",
          "Level",
          `${Math.round((s.threshold / 255) * 100)}%`,
          1,
          254,
          s.threshold,
          s.kind !== "blackwhite",
          (v) => (store.settings.threshold = v)
        )}
      </OptionGroup>

      <OptionGroup label="Adjustments" description={s.kind === "adjust" ? undefined : "Only for Adjust."}>
        {@render slider(
          "brightness",
          "Brightness",
          signed(s.brightness),
          -100,
          100,
          s.brightness,
          s.kind !== "adjust",
          (v) => (store.settings.brightness = v)
        )}
        {@render slider(
          "contrast",
          "Contrast",
          signed(s.contrast),
          -100,
          100,
          s.contrast,
          s.kind !== "adjust",
          (v) => (store.settings.contrast = v)
        )}
        {@render slider(
          "saturation",
          "Colour",
          signed(s.saturation),
          -100,
          100,
          s.saturation,
          s.kind !== "adjust",
          (v) => (store.settings.saturation = v)
        )}
      </OptionGroup>

      <OptionGroup label="Sharpness" description="Higher looks crisper when zoomed in but makes a bigger file.">
        <SegmentedControl name="{uid}-dpi" options={resolutions} bind:value={store.dpi} />
      </OptionGroup>

      <OptionGroup label="File size" description="Lower quality makes a smaller file.">
        <div class="flex flex-col gap-1">
          <div class="flex items-baseline justify-between gap-3">
            <label for="{uid}-quality" class="text-body text-foreground">Image quality</label>
            <span class="text-body tabular-nums text-muted-foreground">{Math.round(store.quality * 100)}%</span>
          </div>
          <input
            id="{uid}-quality"
            type="range"
            min="0.4"
            max="0.95"
            step="0.05"
            bind:value={store.quality}
            class="h-10 w-full cursor-pointer accent-primary"
          />
        </div>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if busy}
        <ProgressLine
          label={store.progress.text}
          current={store.progress.current}
          total={store.progress.total}
          class="max-w-md"
        />
      {:else}
        <span class="block truncate">{filterLabel} · {pageLabel(store.pageCount)} · {store.dpi} DPI</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={busy}>
      {busy ? "Applying…" : `Apply to ${pageLabel(store.pageCount)}`}
    </Button>
  </ToolFooter>
{/if}
