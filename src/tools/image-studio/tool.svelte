<script lang="ts">
  import { FileRow, ProgressLine, ResultCard, ResultDelta, StatusPill, ToolBar, ToolFooter, deltaTone } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { ImageCompare } from "$components/ui/image-compare";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { IconArrowRight as ArrowRight, IconDownload as Download, IconPlus as Plus, IconRefresh as Refresh } from "$lib/icons";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import { deviceProfile } from "$lib/device-profile.svelte";
  import { onDestroy, onMount, untrack } from "svelte";
  import Cropper from "./Cropper.svelte";
  import { getStudioDef } from "./defs";
  import { ImageStudioState } from "./helper.svelte";
  import StudioOptions from "./StudioOptions.svelte";

  let { slug = "image-resize" }: { slug?: string } = $props();

  const def = getStudioDef(untrack(() => slug)) ?? getStudioDef("image-resize")!;
  const store = new ImageStudioState();
  store.configure(def.slug);
  onDestroy(() => store.reset());

  onMount(() => void deviceProfile.init());

  const ACCEPT = "image/*,.heic,.heif,.avif";
  let addInput = $state<HTMLInputElement | null>(null);

  const verbs = { resize: "Resize", compress: "Compress", crop: "Crop", convert: "Convert", form: "Prepare" } as const;
  const verb = verbs[def.mode];
  const pending = $derived(store.items.filter((i) => i.status !== "done").length);
  const showResult = $derived(!store.isProcessing && store.done.length > 0 && pending === 0);
  const runLabel = $derived(
    store.isProcessing ? "Working…" : pending > 0 ? `${verb} ${pending} ${pending === 1 ? "image" : "images"}` : verb
  );
  const active = $derived(store.active);
  // Only size-reducing jobs are judged green or red; resizes and conversions can legitimately grow a file.
  const judged = $derived(store.mode === "compress" || store.opts.useLimit);
  const limitBytes = $derived(store.opts.useLimit ? store.opts.maxKB * 1024 : undefined);
  const compared = $derived(!store.usesCrop ? store.done[0] : undefined);
</script>

{#if store.items.length === 0}
  <UploadArea accept={ACCEPT} maxSize={deviceProfile.capFor("image")} onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-2xl font-medium text-foreground">Choose photos to {verb.toLowerCase()}</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-sm text-muted-foreground">
        JPG, PNG, WebP, AVIF and iPhone HEIC. Photos stay on this device, nothing is uploaded.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard
        tone={judged && store.totalSaved <= 0 ? "bad" : "good"}
        title={store.totalSaved > 0 ? `${formatBytes(store.totalSaved)} smaller` : judged ? "No size saved" : "Done"}
        description={judged && store.totalSaved <= 0
          ? "The result is not smaller. Lower the quality or the size limit and try again."
          : `${store.done.length} ${store.done.length === 1 ? "image is" : "images are"} ready to download.`}
      >
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
      </ResultCard>
    {/if}

    {#if showResult && compared?.resultUrl}
      <ImageCompare aspectRatio={`${compared.width} / ${compared.height}`} class="max-h-[60vh]">
        {#snippet before()}
          <img src={compared.previewUrl} alt="Original" />
        {/snippet}
        {#snippet after()}
          <img src={compared.resultUrl} alt="Result" />
        {/snippet}
      </ImageCompare>
    {/if}

    {#if store.usesCrop && active}
      <Cropper
        src={active.previewUrl}
        width={active.width}
        height={active.height}
        crop={active.crop}
        ratio={store.cropRatio}
        onchange={(c) => {
          active.crop = c;
          store.invalidate(active);
        }}
      />
    {/if}

    <ToolBar
      label="Images"
      count={store.items.length}
      onReset={store.isProcessing ? undefined : () => store.reset()}
      resetLabel="Clear all"
    >
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
          <FileRow
            name={item.file.name}
            thumb={item.previewUrl}
            active={store.usesCrop && active?.id === item.id}
            tone={item.status === "error" ? "bad" : item.result && judged ? deltaTone(item.file.size, item.result.blob.size, limitBytes) : undefined}
            onSelect={store.usesCrop ? () => (store.activeId = item.id) : undefined}
            onRemove={store.isProcessing ? undefined : () => store.removeItem(item.id)}
          >
            {#if item.status === "done" && item.result}
              <span>{item.width} x {item.height}</span>
              {#if item.result.width !== item.width || item.result.height !== item.height}
                <ArrowRight class="size-3" aria-label="became" />
                <span class="text-foreground">{item.result.width} x {item.result.height}</span>
              {/if}
              <span aria-hidden="true">·</span>
              <span>{formatBytes(item.file.size)}</span>
              <ArrowRight class="size-3" aria-label="became" />
              <span class={cn("font-medium", judged ? (deltaTone(item.file.size, item.result.blob.size, limitBytes) === "bad" ? "text-destructive-strong" : "text-success-strong") : "text-foreground")}>
                {formatBytes(item.result.blob.size)}
              </span>
              {#if judged}
                <ResultDelta before={item.file.size} after={item.result.blob.size} limit={limitBytes} />
              {/if}
            {:else if item.status === "error"}
              <span class="whitespace-normal text-destructive-strong">{item.error}</span>
            {:else}
              <span>{item.width} x {item.height} · {formatBytes(item.file.size)}</span>
            {/if}

            {#snippet trailing()}
              {#if item.status === "processing"}
                <StatusPill status="processing" label="Working" />
              {:else if item.status === "done"}
                <Button variant="ghost" size="icon-sm" class="max-sm:size-11" aria-label={`Download ${item.result?.name}`} onclick={() => store.download(item)}>
                  <Download class="size-4" />
                </Button>
              {:else if item.status === "error"}
                <StatusPill status="error" label="Failed" />
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
    <StudioOptions {store} />
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if store.outputPixels && store.mode !== "convert"}
        <span class="block truncate tabular-nums">
          Output {store.outputPixels.width} x {store.outputPixels.height} px{store.opts.useLimit ? `, under ${store.opts.maxKB} KB` : ""}
        </span>
      {:else if store.opts.useLimit}
        <span class="block truncate">Under {store.opts.maxKB} KB</span>
      {/if}
    {/snippet}
    {#if showResult}
      <Button onclick={() => store.downloadAll()}>
        <Download />
        {store.done.length > 1 ? "Download ZIP" : "Download"}
      </Button>
    {:else}
      <Button disabled={store.isProcessing || pending === 0} onclick={() => store.process()}>{runLabel}</Button>
    {/if}
  </ToolFooter>
{/if}
