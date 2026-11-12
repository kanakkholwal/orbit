<script lang="ts">
  import {
    FileRow,
    OptionGroup,
    ProgressLine,
    ResultCard,
    StatusPill,
    ToolBar,
    ToolFooter,
  } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { NativeSelect, NativeSelectOption } from "$components/ui/native-select";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { ACCEPT, TARGET_FORMATS } from "$lib/docs/formats";
  import { PANDOC_WASM_MB } from "$lib/docs/convert";
  import {
    IconArrowRight as ArrowRight,
    IconDownload as Download,
    IconFileText as FileText,
    IconPlus as Plus,
    IconRefresh as Refresh,
  } from "$lib/icons";
  import { formatBytes } from "$utils/helper";
  import { onDestroy, onMount, untrack } from "svelte";
  import { getDocDef } from "./defs";
  import { DocConvertState } from "./helper.svelte";

  let { slug = "document-converter" }: { slug?: string } = $props();

  const def = getDocDef(untrack(() => slug)) ?? getDocDef("document-converter")!;
  const store = new DocConvertState();
  store.configure(def.slug);
  onMount(() => void store.prepare());
  onDestroy(() => store.destroy());

  let addInput = $state<HTMLInputElement | null>(null);

  const pending = $derived(store.items.filter((i) => i.status !== "done").length);
  const showResult = $derived(!store.isProcessing && store.done.length > 0 && pending === 0);
  const downloading = $derived(store.downloadFraction !== undefined);
  const first = $derived(!store.cached);
  const stale = () => store.invalidate();
</script>

{#if store.items.length === 0}
  <UploadArea accept={ACCEPT} onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-2xl font-medium text-foreground">Choose documents to convert</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-sm text-muted-foreground">
        Word, ODT, Markdown, HTML, EPUB, RTF and more. {first
          ? `The first conversion downloads a ${PANDOC_WASM_MB} MB converter once.`
          : "The converter is stored on this device, so it works offline."}
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard title="Done" description={`${store.done.length} ${store.done.length === 1 ? "file is" : "files are"} ready to download.`}>
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
      </ResultCard>
    {/if}

    <ToolBar label="Documents" count={store.items.length} onReset={store.isProcessing ? undefined : () => store.reset()} resetLabel="Clear all">
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
            icon={FileText}
            onRemove={item.status === "processing" ? undefined : () => store.removeItem(item.id)}
          >
            <span>{formatBytes(item.file.size)}</span>
            {#if item.status === "done" && item.result}
              <ArrowRight class="size-3" aria-label="became" />
              <span class="font-medium text-foreground">{item.result.name}</span>
            {/if}

            {#snippet trailing()}
              {#if item.status === "processing"}
                <StatusPill status="processing" label="Converting" />
              {:else if item.status === "done"}
                <Button variant="ghost" size="icon-sm" class="max-sm:size-11" aria-label={`Download ${item.result?.name}`} onclick={() => store.download(item)}>
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

    {#if first && pending > 0 && !store.isProcessing}
      <p class="text-sm text-muted-foreground">
        The first conversion downloads a {PANDOC_WASM_MB} MB converter once. After that it works offline.
      </p>
    {/if}

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
      <OptionGroup label="Save as">
        <NativeSelect
          aria-label="Save as"
          value={store.to}
          onchange={(e) => {
            store.to = e.currentTarget.value;
            stale();
          }}
        >
          {#each TARGET_FORMATS as f (f.id)}
            <NativeSelectOption value={f.id}>{f.label}</NativeSelectOption>
          {/each}
        </NativeSelect>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if downloading}
        <ProgressLine
          label={`Downloading converter (${PANDOC_WASM_MB} MB, one time)`}
          current={Math.round((store.downloadFraction ?? 0) * 100)}
          total={store.downloadFraction == null ? 0 : 100}
          class="max-w-md"
        />
      {:else if store.isProcessing}
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
      <Button disabled={pending === 0} onclick={() => store.process()}>
        {first ? "Download and convert" : `Convert ${pending} ${pending === 1 ? "file" : "files"}`}
      </Button>
    {/if}
  </ToolFooter>
{/if}
