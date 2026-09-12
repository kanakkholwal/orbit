<script lang="ts">
  import {
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
  import { formatBytes } from "$utils/helper";
  import {
    IconCopyOff as CopyOff,
    IconDownload as Download,
    IconEyeOff as EyeOff,
    IconLayersSubtract as Layers,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import type { ImageKind } from "../pdf-color-filters/raster";
  import { RasterizeState, type Resolution } from "./helper.svelte";

  const store = new RasterizeState();
  const uid = $props.id();

  const resolutions: { value: Resolution; label: string }[] = [
    { value: "150", label: "150 DPI" },
    { value: "200", label: "200 DPI" },
    { value: "300", label: "300 DPI" },
  ];

  const formats: { value: ImageKind; label: string }[] = [
    { value: "jpeg", label: "JPG" },
    { value: "png", label: "PNG" },
  ];

  const effects = [
    { icon: Layers, text: "Form fields, comments and stamps are drawn onto the page for good." },
    { icon: EyeOff, text: "Hidden text, layers and page data underneath are left behind." },
    { icon: CopyOff, text: "Text can no longer be copied, searched or edited." },
  ];

  const busy = $derived(store.isProcessing);
  const lossless = $derived(store.format === "png");
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
</script>

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to rasterize</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Flatten every page into an image so text can't be copied and stubborn print problems go away.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !busy}
      <ResultCard
        title="PDF rasterized"
        description={`${store.result.name} is downloaded. ${formatBytes(store.file.size)} before, ${formatBytes(store.result.blob.size)} now.`}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="rasterize-pdf" />
      </ResultCard>
    {/if}

    <FileRow
      name={store.file.name}
      meta={`${formatBytes(store.file.size)} · ${pageLabel(store.pageCount)}`}
      onRemove={busy ? undefined : () => store.reset()}
    />

    <section aria-labelledby="{uid}-effects" class="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h2 id="{uid}-effects" class="text-body font-medium text-foreground">What happens to each page</h2>
      <ul class="flex flex-col gap-2.5">
        {#each effects as effect (effect.text)}
          <li class="flex items-start gap-3 text-body text-muted-foreground">
            <effect.icon class="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{effect.text}</span>
          </li>
        {/each}
      </ul>
      <p class="border-t border-border pt-3 text-caption text-muted-foreground">
        Need the text searchable again later? Run
        <a href="/tools/ocr-pdf" class="font-medium text-primary underline-offset-4 hover:underline">OCR PDF</a>
        on the result.
      </p>
    </section>
  </div>

  <WorkspaceInspector title="Rasterize">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Sharpness" description="Higher looks crisper and prints better but makes a bigger file.">
        <SegmentedControl name="{uid}-dpi" options={resolutions} bind:value={store.dpi} />
      </OptionGroup>

      <OptionGroup
        label="Image type"
        description={lossless ? "Sharpest text and lines. Larger files." : "Smaller files. Best for photos and scans."}
      >
        <SegmentedControl name="{uid}-format" options={formats} bind:value={store.format} />
      </OptionGroup>

      <OptionGroup label="File size" description={lossless ? "Only for JPG. PNG keeps full quality." : "Lower quality makes a smaller file."}>
        <div class="flex flex-col gap-1">
          <div class="flex items-baseline justify-between gap-3">
            <label for="{uid}-quality" class="text-body text-foreground">Image quality</label>
            <span class="text-body tabular-nums text-muted-foreground">
              {lossless ? "Full" : `${Math.round(store.quality * 100)}%`}
            </span>
          </div>
          <input
            id="{uid}-quality"
            type="range"
            min="0.4"
            max="0.95"
            step="0.05"
            bind:value={store.quality}
            disabled={lossless}
            class="h-10 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </OptionGroup>

      <OptionGroup label="Extras">
        <div class="-my-2.5 flex flex-col divide-y divide-border">
          <OptionToggle label="Grayscale" description="Drop colour, handy for printing" bind:checked={store.grayscale} />
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
        <span class="block truncate">
          {pageLabel(store.pageCount)} · {store.dpi} DPI · {lossless ? "PNG" : "JPG"}{store.grayscale ? " · Grayscale" : ""}
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={busy}>
      {busy ? "Rasterizing…" : `Rasterize ${pageLabel(store.pageCount)}`}
    </Button>
  </ToolFooter>
{/if}
