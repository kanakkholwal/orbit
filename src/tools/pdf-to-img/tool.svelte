<script lang="ts">
  import {
    FileRow,
    OptionGroup,
    PasswordPrompt,
    ProgressLine,
    ResultCard,
    SegmentedControl,
    ToolFooter,
  } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconLoader2 as Loader, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { onMount } from "svelte";
  import { canEncodeWebp, PdfToJpgState, type ImageFormat } from "./helper.svelte";

  const store = new PdfToJpgState();
  const uid = $props.id();

  const formats: { value: ImageFormat; label: string; hint: string }[] = [
    { value: "jpeg", label: "JPG", hint: "Small files that open anywhere. Best for photos and scans." },
    { value: "png", label: "PNG", hint: "Sharp text and lines with no quality loss. Larger files." },
    { value: "webp", label: "WebP", hint: "Smaller than JPG at the same quality. Great for websites." },
  ];

  let webpSupported = $state(true);

  onMount(() => {
    webpSupported = canEncodeWebp();
    if (!webpSupported && store.state.format === "webp") store.state.format = "jpeg";
  });

  const formatOptions = $derived(webpSupported ? formats : formats.filter((f) => f.value !== "webp"));
  const s = $derived(store.state);
  const busy = $derived(s.isProcessing);
  const format = $derived(formats.find((f) => f.value === s.format) ?? formats[0]);
  const lossless = $derived(s.format === "png");
  const qualityWord = $derived(s.quality >= 0.85 ? "High" : s.quality >= 0.6 ? "Balanced" : "Small files");
  const imageLabel = (n: number) => `${n} ${n === 1 ? "image" : "images"}`;
</script>

{#if store.locked.file}
  <PasswordPrompt
    fileName={store.locked.file.name}
    error={store.locked.error}
    busy={store.locked.busy}
    onsubmit={(password) => store.unlock(password)}
    oncancel={() => store.reset()}
  />
{:else if !s.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files[0])}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to turn into images</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Save every page as a picture you can share, post or put in a slide.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !busy}
      <ResultCard
        title={`Saved ${imageLabel(store.result.count)}`}
        description={`All pages are bundled in ${store.result.name}.`}
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
      </ResultCard>
    {/if}

    <FileRow
      name={s.file.name}
      meta={`${formatBytes(s.file.size)} · ${s.pageCount} ${s.pageCount === 1 ? "page" : "pages"}`}
      onRemove={busy ? undefined : () => store.reset()}
    />

    <dl class="grid grid-cols-1 divide-y divide-border rounded-2xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div class="flex flex-col gap-0.5 p-4">
        <dt class="text-caption text-muted-foreground">You get</dt>
        <dd class="text-body-lg font-medium tabular-nums text-foreground">{imageLabel(s.pageCount)}</dd>
      </div>
      <div class="flex flex-col gap-0.5 p-4">
        <dt class="text-caption text-muted-foreground">Format</dt>
        <dd class="text-body-lg font-medium text-foreground">{format.label}</dd>
      </div>
      <div class="flex flex-col gap-0.5 p-4">
        <dt class="text-caption text-muted-foreground">Download</dt>
        <dd class="text-body-lg font-medium text-foreground">One ZIP file</dd>
      </div>
    </dl>
  </div>

  <WorkspaceInspector title="Images">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Format" description={format.hint}>
        <SegmentedControl name="{uid}-format" options={formatOptions} bind:value={store.state.format} />
        {#if !webpSupported}
          <p class="text-caption text-muted-foreground">This browser can't save WebP images.</p>
        {/if}
      </OptionGroup>

      <div role="group" aria-labelledby="{uid}-quality-label" class="flex flex-col gap-1">
        <div class="flex items-baseline justify-between gap-3">
          <label id="{uid}-quality-label" for="{uid}-quality" class="text-body font-medium text-foreground">Quality</label>
          <span class="text-body tabular-nums text-muted-foreground">
            {lossless ? "Full" : `${qualityWord} · ${Math.round(s.quality * 100)}%`}
          </span>
        </div>
        <input
          id="{uid}-quality"
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          bind:value={store.state.quality}
          disabled={lossless}
          class="h-10 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p class="text-caption text-muted-foreground">
          {lossless ? "PNG always keeps full quality." : "Lower quality makes smaller files."}
        </p>
      </div>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if busy && store.step.total > 0}
        <ProgressLine label="Converting pages" current={store.step.current} total={store.step.total} class="max-w-md" />
      {:else if busy}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Getting ready…
        </span>
      {:else}
        <span class="block truncate">{imageLabel(s.pageCount)} · {format.label}</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.convert()} disabled={busy}>
      {busy ? "Converting…" : `Convert to ${format.label}`}
    </Button>
  </ToolFooter>
{/if}
