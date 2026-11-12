<script lang="ts">
  import {
    FileRow,
    OptionGroup,
    ProgressLine,
    ResultCard,
    ResultDelta,
    SegmentedControl,
    StatusPill,
    ToolBar,
    ToolFooter,
    deltaTone,
  } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { NativeSelect, NativeSelectOption } from "$components/ui/native-select";
  import { Progress } from "$components/ui/progress";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import {
    IconArrowRight as ArrowRight,
    IconDownload as Download,
    IconHeadphones as Headphones,
    IconPlayerPlay as Play,
    IconPlus as Plus,
    IconRefresh as Refresh,
  } from "$lib/icons";
  import { MEDIA_FORMATS, type MediaFormatId, type MediaQuality } from "$lib/media/convert";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import { onDestroy, untrack } from "svelte";
  import { getMediaDef } from "./defs";
  import { MediaConvertState } from "./helper.svelte";

  let { slug = "video-converter" }: { slug?: string } = $props();

  const def = getMediaDef(untrack(() => slug)) ?? getMediaDef("video-converter")!;
  const store = new MediaConvertState();
  store.configure(def.slug);
  onDestroy(() => {
    void store.cancel();
    store.reset();
  });

  const ACCEPT = "video/*,audio/*,.mkv,.mov,.flac,.m4a,.ogg";
  let addInput = $state<HTMLInputElement | null>(null);

  const formats = $derived(
    MEDIA_FORMATS.filter((f) => f.kind === (def.kind === "audio" ? "audio" : "video")).map((f) => ({ value: f.id, label: f.label }))
  );
  const qualities: { value: MediaQuality; label: string }[] = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Small" },
  ];
  const heights = [
    { value: "", label: "Original size" },
    { value: "1080", label: "Up to 1080p" },
    { value: "720", label: "Up to 720p" },
    { value: "480", label: "Up to 480p" },
  ];

  const pending = $derived(store.items.filter((i) => i.status !== "done").length);
  const showResult = $derived(!store.isProcessing && store.done.length > 0 && pending === 0);
  const Icon = $derived(def.kind === "audio" ? Headphones : Play);
  const stale = () => store.invalidate();
</script>

{#if store.items.length === 0}
  <UploadArea accept={ACCEPT} onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-2xl font-medium text-foreground">Choose {def.kind === "audio" ? "audio or video" : "videos"} to convert</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-sm text-muted-foreground">
        Conversion runs on your device, so nothing is uploaded. Long or 4K videos take a while and use memory.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard
        tone={store.judged && store.totalSaved <= 0 ? "bad" : "good"}
        title={store.judged ? (store.totalSaved > 0 ? `${formatBytes(store.totalSaved)} smaller` : "No size saved") : "Done"}
        description={`${store.done.length} ${store.done.length === 1 ? "file is" : "files are"} ready to download.`}
      >
        {#snippet actions()}
          <Button onclick={() => store.downloadAll()}>
            <Download />
            {store.done.length > 1 ? "Download ZIP" : "Download"}
          </Button>
          <Button variant="ghost" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
      </ResultCard>
    {/if}

    <ToolBar label="Files" count={store.items.length} onReset={store.isProcessing ? undefined : () => store.reset()} resetLabel="Clear all">
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
            icon={Icon}
            tone={item.result && store.judged ? deltaTone(item.file.size, item.result.blob.size) : undefined}
            onRemove={item.status === "processing" ? undefined : () => store.removeItem(item.id)}
          >
            <span>{formatBytes(item.file.size)}</span>
            {#if item.status === "done" && item.result}
              <ArrowRight class="size-3" aria-label="became" />
              <span
                class={cn(
                  "font-medium",
                  store.judged ? (deltaTone(item.file.size, item.result.blob.size) === "bad" ? "text-destructive-strong" : "text-success-strong") : "text-foreground"
                )}
              >
                {formatBytes(item.result.blob.size)}
              </span>
              {#if store.judged}
                <ResultDelta before={item.file.size} after={item.result.blob.size} />
              {/if}
            {:else if item.status === "processing"}
              <Progress value={Math.round(item.progress * 100)} max={100} size="sm" label={`Converting ${item.file.name}`} class="w-24" />
              <span class="tabular-nums">{Math.round(item.progress * 100)}%</span>
            {/if}

            {#snippet trailing()}
              {#if item.status === "done"}
                <Button variant="ghost" size="icon-sm" aria-label={`Download ${item.result?.name}`} onclick={() => store.download(item)}>
                  <Download class="size-4" />
                </Button>
              {:else if item.status === "error"}
                <StatusPill status="error" label={item.error || "Failed"} />
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

  <WorkspaceInspector title={def.title}>
    <div class="flex flex-col gap-6">
      <OptionGroup label="Convert to">
        <SegmentedControl
          name="Format"
          size="sm"
          options={formats}
          value={store.to}
          onchange={(v) => {
            store.to = v as MediaFormatId;
            stale();
          }}
        />
      </OptionGroup>

      <OptionGroup label="Quality" description="Lower quality makes a smaller file.">
        <SegmentedControl
          name="Quality"
          options={qualities}
          value={store.quality}
          onchange={(v) => {
            store.quality = v as MediaQuality;
            stale();
          }}
        />
      </OptionGroup>

      {#if def.kind === "video"}
        <OptionGroup label="Video size" description="Larger videos shrink to this height. Smaller ones are not scaled up.">
          <NativeSelect
            aria-label="Video size"
            value={store.maxHeight ? String(store.maxHeight) : ""}
            onchange={(e) => {
              store.maxHeight = e.currentTarget.value ? Number(e.currentTarget.value) : undefined;
              stale();
            }}
          >
            {#each heights as h (h.value)}
              <NativeSelectOption value={h.value}>{h.label}</NativeSelectOption>
            {/each}
          </NativeSelect>
        </OptionGroup>
      {/if}
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {/if}
    {/snippet}
    {#if store.isProcessing}
      <Button variant="outline" onclick={() => store.cancel()}>Cancel</Button>
    {:else if showResult}
      <Button onclick={() => store.downloadAll()}>
        <Download />
        {store.done.length > 1 ? "Download ZIP" : "Download"}
      </Button>
    {:else}
      <Button disabled={pending === 0} onclick={() => store.process()}>Convert {pending} {pending === 1 ? "file" : "files"}</Button>
    {/if}
  </ToolFooter>
{/if}
