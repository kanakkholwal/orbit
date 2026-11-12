<script lang="ts">
  import { FileRow, OptionGroup, OptionToggle, ProgressLine, ResultCard, SegmentedControl, StatusPill, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Slider } from "$components/ui/slider";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { IconDownload as Download, IconPhoto as Photo, IconPlus as Plus, IconRefresh as Refresh } from "$lib/icons";
  import { formatBytes } from "$utils/helper";
  import { onDestroy, untrack } from "svelte";
  import { getFixDef } from "./defs";
  import { ImageFixState } from "./helper.svelte";

  let { slug = "rotate-image" }: { slug?: string } = $props();

  const def = getFixDef(untrack(() => slug)) ?? getFixDef("rotate-image")!;
  const store = new ImageFixState();
  store.configure(def.slug);
  onDestroy(() => store.reset());

  const ACCEPT = "image/*,.heic,.heif,.avif";
  let addInput = $state<HTMLInputElement | null>(null);
  const stale = () => store.invalidate();

  const angles = [
    { value: "90", label: "90° right" },
    { value: "180", label: "180°" },
    { value: "270", label: "90° left" },
  ];
  const axes = [
    { value: "x", label: "Left to right" },
    { value: "y", label: "Upside down" },
  ];
  const verbs = { rotate: "Rotate", flip: "Flip", strip: "Clean", watermark: "Watermark" } as const;
  const verb = verbs[def.op];

  const pending = $derived(store.items.filter((i) => i.status !== "done").length);
  const showResult = $derived(!store.isProcessing && store.done.length > 0 && pending === 0);
</script>

{#if store.items.length === 0}
  <UploadArea accept={ACCEPT} onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-2xl font-medium text-foreground">Choose photos to {def.op === "strip" ? "clean" : verb.toLowerCase()}</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-sm text-muted-foreground">JPG, PNG, WebP, AVIF and iPhone HEIC. Photos stay on this device, nothing is uploaded.</p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard
        title="Done"
        description={def.op === "strip"
          ? `${store.done.length} ${store.done.length === 1 ? "photo" : "photos"} saved without location, camera or date data.`
          : `${store.done.length} ${store.done.length === 1 ? "photo is" : "photos are"} ready to download.`}
      >
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
      </ResultCard>
    {/if}

    <ToolBar label="Photos" count={store.items.length} onReset={store.isProcessing ? undefined : () => store.reset()} resetLabel="Clear all">
      {#snippet actions()}
        <Button variant="outline" size="sm" disabled={store.isProcessing} onclick={() => addInput?.click()}>
          <Plus />
          Add
        </Button>
      {/snippet}
    </ToolBar>

    <ul class="flex flex-col gap-2">
      {#each store.items as item (item.id)}
        <li>
          <FileRow name={item.file.name} icon={Photo} tone={item.status === "error" ? "bad" : undefined} onRemove={item.status === "processing" ? undefined : () => store.removeItem(item.id)}>
            <span>{formatBytes(item.file.size)}</span>
            {#if item.status === "done" && item.result}
              <span class="font-medium text-foreground">{formatBytes(item.result.blob.size)}</span>
            {:else if item.status === "error"}
              <span class="whitespace-normal text-destructive-strong">{item.error}</span>
            {/if}
            {#snippet trailing()}
              {#if item.status === "done"}
                <Button variant="ghost" size="icon-sm" class="max-sm:size-11" aria-label={`Download ${item.result?.name}`} onclick={() => store.download(item)}>
                  <Download class="size-4" />
                </Button>
              {:else if item.status === "error"}
                <StatusPill status="error" label="Failed" />
              {:else if item.status === "processing"}
                <StatusPill status="processing" label="Working" />
              {/if}
            {/snippet}
          </FileRow>
        </li>
      {/each}
    </ul>

    <input
      bind:this={addInput}
      type="file"
      accept={ACCEPT}
      multiple
      class="hidden"
      onchange={(e) => {
        const picked = Array.from(e.currentTarget.files ?? []);
        if (picked.length > 0) store.addFiles(picked);
        e.currentTarget.value = "";
      }}
    />
  </div>

  <WorkspaceInspector title="Options">
    <div class="flex flex-col gap-6">
      {#if store.op === "rotate"}
        <OptionGroup label="Turn">
          <SegmentedControl
            name="Rotation"
            size="sm"
            options={angles}
            value={String(store.angle)}
            onchange={(v) => {
              store.angle = Number(v) as 90 | 180 | 270;
              stale();
            }}
          />
        </OptionGroup>
      {:else if store.op === "flip"}
        <OptionGroup label="Flip">
          <SegmentedControl
            name="Flip direction"
            size="sm"
            options={axes}
            value={store.mirrorY ? "y" : "x"}
            onchange={(v) => {
              store.mirrorX = v === "x";
              store.mirrorY = v === "y";
              stale();
            }}
          />
        </OptionGroup>
      {:else if store.op === "strip"}
        <p class="text-sm text-muted-foreground">
          The photo is redrawn and saved again, which drops GPS location, camera model, date and any other hidden data. Orientation is kept.
        </p>
      {:else}
        <OptionGroup label="Watermark text">
          <Input aria-label="Watermark text" bind:value={store.text} oninput={stale} />
        </OptionGroup>
        <OptionGroup label="Opacity">
          <Slider min={0.1} max={1} step={0.05} bind:value={store.opacity} onValueCommit={stale} aria-label="Opacity" />
        </OptionGroup>
        <OptionGroup label="Size">
          <Slider min={0.02} max={0.2} step={0.01} bind:value={store.size} onValueCommit={stale} aria-label="Text size" />
        </OptionGroup>
        <OptionToggle label="Repeat across the photo" description="Off puts one mark in the centre." bind:checked={store.tile} onchange={stale} />
      {/if}
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {/if}
    {/snippet}
    {#if showResult}
      <Button onclick={() => store.downloadAll()}>
        <Download />
        {store.done.length > 1 ? "Download ZIP" : "Download"}
      </Button>
    {:else}
      <Button disabled={pending === 0 || store.isProcessing} onclick={() => store.process()}>
        {store.isProcessing ? "Working…" : `${verb} ${pending} ${pending === 1 ? "photo" : "photos"}`}
      </Button>
    {/if}
  </ToolFooter>
{/if}
