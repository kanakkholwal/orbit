<script lang="ts">
  import { FileRow, OptionGroup, ResultCard, SegmentedControl, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import {
    IconDownload as Download,
    IconLoader2 as Loader,
    IconPhoto as Photo,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { AddWatermarkState, type WatermarkType } from "./helper.svelte";

  const store = new AddWatermarkState();
  const uid = $props.id();

  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const field =
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring";

  const types: { value: WatermarkType; label: string }[] = [
    { value: "text", label: "Text" },
    { value: "image", label: "Image" },
  ];
  const swatches = [
    { value: "#ff0000", label: "Red" },
    { value: "#6b6b6b", label: "Grey" },
    { value: "#000000", label: "Black" },
    { value: "#0060c9", label: "Blue" },
  ];
  const lines = [100, 92, 96, 70, 0, 100, 88, 94, 60, 0, 100, 90, 82];

  let imageInput = $state<HTMLInputElement | null>(null);
  let textWidth = $state(0);
  let natural = $state({ w: 0, h: 0 });

  const s = $derived(store.state);
  const isText = $derived(s.watermarkType === "text");
  const imageUrl = $derived(s.imageFile ? URL.createObjectURL(s.imageFile) : null);
  $effect(() => {
    const url = imageUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  });

  const blocker = $derived(
    isText && !s.text.trim()
      ? "Type the watermark text to continue."
      : !isText && !s.imageFile
        ? "Choose an image to continue."
        : null
  );
  const imageW = $derived(((natural.w * s.imageScale) / PAGE_W) * 100);
  const imageH = $derived(((natural.h * s.imageScale) / PAGE_H) * 100);
</script>

{#if !s.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files[0])}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to watermark</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Stamp text or a logo across every page, like "Confidential" or "Draft".
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard title="Watermark added" description={`${store.result.name} is downloaded.`}>
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="add-watermark-pdf" />
      </ResultCard>
    {/if}

    <FileRow
      name={s.file.name}
      meta={formatBytes(s.file.size)}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    <section aria-label="Preview" class="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-6 sm:py-10">
      <div
        class="@container relative w-full max-w-sm overflow-hidden rounded-sm shadow-sm"
        style:aspect-ratio="{PAGE_W} / {PAGE_H}"
        style:background-color="#ffffff"
        aria-hidden="true"
      >
        <div class="absolute inset-[9%] flex flex-col gap-[2.4cqw]">
          {#each lines as width, i (i)}
            <span class="h-[1.6cqw] rounded-full" style:width="{width}%" style:background-color="#e5e5e5"></span>
          {/each}
        </div>

        {#if isText && s.text}
          <span
            bind:offsetWidth={textWidth}
            class="pointer-events-none absolute whitespace-nowrap font-bold leading-none"
            style:font-family="Helvetica, Arial, sans-serif"
            style:font-size="{(s.fontSize / PAGE_W) * 100}cqw"
            style:color={s.color}
            style:opacity={s.opacity}
            style:left="calc(50% - {textWidth / 2}px)"
            style:bottom="calc({50 - ((0.4625 * s.fontSize) / PAGE_H) * 100}% - 0.21em)"
            style:transform-origin="0 calc(100% - 0.21em)"
            style:transform="rotate({-s.rotation}deg)"
          >
            {s.text}
          </span>
        {:else if !isText && imageUrl}
          <img
            src={imageUrl}
            alt=""
            onload={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              natural = { w: img.naturalWidth, h: img.naturalHeight };
            }}
            class="pointer-events-none absolute max-w-none"
            style:width="{imageW}%"
            style:left="{50 - imageW / 2}%"
            style:bottom="{50 - imageH / 2}%"
            style:opacity={s.opacity}
            style:transform-origin="0 100%"
            style:transform="rotate({-s.rotation}deg)"
          />
        {/if}
      </div>
      <p class="text-center text-caption text-muted-foreground">
        Preview on a standard page. The same watermark goes on every page.
      </p>
    </section>

    <input
      bind:this={imageInput}
      type="file"
      accept="image/png,image/jpeg"
      class="hidden"
      onchange={(e) => {
        const picked = e.currentTarget.files?.[0];
        if (picked) store.state.imageFile = picked;
        e.currentTarget.value = "";
      }}
    />
  </div>

  <WorkspaceInspector title="Watermark">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Type">
        <SegmentedControl name="{uid}-type" options={types} bind:value={store.state.watermarkType} />
      </OptionGroup>

      {#if isText}
        <OptionGroup label="Text">
          <label for="{uid}-text" class="sr-only">Watermark text</label>
          <input id="{uid}-text" type="text" bind:value={store.state.text} placeholder="CONFIDENTIAL" class={field} />
        </OptionGroup>

        <OptionGroup label="Colour">
          <div class="flex flex-wrap items-center gap-2">
            {#each swatches as swatch (swatch.value)}
              <button
                type="button"
                aria-label={swatch.label}
                aria-pressed={s.color.toLowerCase() === swatch.value}
                onclick={() => (store.state.color = swatch.value)}
                class={cn(
                  "size-10 rounded-full border border-border outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  s.color.toLowerCase() === swatch.value && "ring-2 ring-primary ring-offset-2 ring-offset-background"
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

        {@render slider("size", "Size", 10, 200, 2, `${s.fontSize} pt`)}
      {:else}
        <OptionGroup label="Image" description="PNG or JPG. A transparent PNG looks best.">
          {#if s.imageFile}
            <FileRow name={s.imageFile.name} meta={formatBytes(s.imageFile.size)} icon={Photo} />
          {/if}
          <Button variant="outline" onclick={() => imageInput?.click()}>
            <Photo />
            {s.imageFile ? "Choose another image" : "Choose an image"}
          </Button>
        </OptionGroup>

        {@render slider("scale", "Size", 0.1, 2, 0.1, `${Math.round(s.imageScale * 100)}%`)}
      {/if}

      {@render slider("opacity", "Opacity", 0, 1, 0.05, `${Math.round(s.opacity * 100)}%`)}
      {@render slider("rotation", "Angle", -180, 180, 5, `${s.rotation}°`)}
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Adding watermark…
        </span>
      {:else if blocker}
        <span class="block truncate text-destructive">{blocker}</span>
      {:else}
        <span class="block truncate">
          {isText ? `"${s.text}"` : "Image"} on every page · {Math.round(s.opacity * 100)}% opacity
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || blocker !== null}>
      {store.isProcessing ? "Adding…" : "Add watermark"}
    </Button>
  </ToolFooter>
{/if}

{#snippet slider(key: "size" | "scale" | "opacity" | "rotation", label: string, min: number, max: number, step: number, readout: string)}
  <div class="flex flex-col gap-1">
    <div class="flex items-baseline justify-between gap-3">
      <label for="{uid}-{key}" class="text-body font-medium text-foreground">{label}</label>
      <span class="text-body tabular-nums text-muted-foreground">{readout}</span>
    </div>
    {#if key === "size"}
      <input id="{uid}-{key}" type="range" {min} {max} {step} bind:value={store.state.fontSize} class="h-10 w-full cursor-pointer accent-primary" />
    {:else if key === "scale"}
      <input id="{uid}-{key}" type="range" {min} {max} {step} bind:value={store.state.imageScale} class="h-10 w-full cursor-pointer accent-primary" />
    {:else if key === "opacity"}
      <input id="{uid}-{key}" type="range" {min} {max} {step} bind:value={store.state.opacity} class="h-10 w-full cursor-pointer accent-primary" />
    {:else}
      <input id="{uid}-{key}" type="range" {min} {max} {step} bind:value={store.state.rotation} class="h-10 w-full cursor-pointer accent-primary" />
    {/if}
  </div>
{/snippet}
