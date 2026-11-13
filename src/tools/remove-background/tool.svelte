<script lang="ts">
  import { FileRow, FitFrame, OptionGroup, ProgressLine, ResultCard, SegmentedControl, StatusPill, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { ImageCompare } from "$components/ui/image-compare";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { IconDownload as Download, IconPhoto as Photo, IconPlus as Plus, IconRefresh as Refresh } from "$lib/icons";
  import { formatBytes } from "$utils/helper";
  import { onDestroy } from "svelte";
  import { RemoveBackgroundState, type Backdrop } from "./helper.svelte";

  const store = new RemoveBackgroundState();
  onDestroy(() => store.reset());

  const ACCEPT = "image/*,.heic,.heif,.avif";
  let addInput = $state<HTMLInputElement | null>(null);

  const backdrops: { value: Backdrop; label: string }[] = [
    { value: "transparent", label: "Transparent" },
    { value: "white", label: "White" },
    { value: "color", label: "Colour" },
  ];

  const pending = $derived(store.items.filter((i) => i.status !== "done").length);
  const showResult = $derived(!store.isProcessing && store.done.length > 0 && pending === 0);
  const shown = $derived(store.done[0]);
  const backdropStyle = $derived(
    store.backdrop === "transparent"
      ? "background-image: repeating-conic-gradient(var(--muted) 0% 25%, transparent 0% 50%); background-size: 16px 16px;"
      : `background-color: ${store.backdrop === "white" ? "#ffffff" : store.color};`
  );
</script>

{#if store.items.length === 0}
  <UploadArea accept={ACCEPT} onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-2xl font-medium text-foreground">Choose photos to remove the background from</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-sm text-muted-foreground">
        The cut-out runs on your device, so photos are never uploaded. The first photo downloads a model of about 40 MB, then it is cached.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard title="Background removed" description={`${store.done.length} ${store.done.length === 1 ? "photo is" : "photos are"} ready to download.`}>
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
      </ResultCard>
    {/if}

    {#if showResult && shown}
      <FitFrame width={shown.width} height={shown.height}>
        {#snippet children(ratio)}
          <div class="overflow-hidden rounded-xl border border-border" style={backdropStyle}>
            <ImageCompare aspectRatio={ratio}>
              {#snippet before()}
                <img src={shown.previewUrl} alt="Original" />
              {/snippet}
              {#snippet after()}
                <img src={store.resultUrls[shown.id]} alt="Background removed" />
              {/snippet}
            </ImageCompare>
          </div>
        {/snippet}
      </FitFrame>
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
            <span>{item.width} x {item.height}</span>
            {#if item.status === "error"}
              <span class="whitespace-normal text-destructive-strong">{item.error}</span>
            {/if}
            {#snippet trailing()}
              {#if item.status === "done"}
                <Button variant="ghost" size="icon-sm" class="max-sm:size-11" aria-label={`Download ${item.file.name} without background`} onclick={() => store.download(item)}>
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
        if (picked.length > 0) void store.addFiles(picked);
        e.currentTarget.value = "";
      }}
    />
  </div>

  <WorkspaceInspector title="Options">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Background" description="Applies when you download. Transparent keeps a see-through PNG.">
        <SegmentedControl name="Background" size="sm" options={backdrops} value={store.backdrop} onchange={(v) => (store.backdrop = v as Backdrop)} />
      </OptionGroup>
      {#if store.backdrop === "color"}
        <OptionGroup label="Colour">
          <input type="color" aria-label="Background colour" class="h-11 w-full cursor-pointer rounded-lg border border-border bg-transparent p-1" bind:value={store.color} />
        </OptionGroup>
      {/if}
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.stage || store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {/if}
    {/snippet}
    {#if showResult}
      <Button onclick={() => store.downloadAll()}>
        <Download />
        {store.done.length > 1 ? "Download ZIP" : "Download PNG"}
      </Button>
    {:else}
      <Button disabled={pending === 0 || store.isProcessing} onclick={() => store.process()}>
        {store.isProcessing ? "Working…" : `Remove background from ${pending} ${pending === 1 ? "photo" : "photos"}`}
      </Button>
    {/if}
  </ToolFooter>
{/if}
