<script lang="ts">
  import {
    FileRow,
    OptionGroup,
    OptionToggle,
    PasswordPrompt,
    ProgressLine,
    ResultCard,
    SegmentedControl,
    ToolFooter,
  } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { IconDownload as Download, IconLoader2 as Loader, IconRefresh as Refresh } from "$lib/icons";
  import { formatBytes } from "$utils/helper";
  import { PdfToPptxState, type SlideQuality } from "./helper.svelte";

  const store = new PdfToPptxState();
  const uid = $props.id();

  const qualities: { value: SlideQuality; label: string }[] = [
    { value: "small", label: "Small" },
    { value: "balanced", label: "Balanced" },
    { value: "sharp", label: "Sharp" },
  ];

  const busy = $derived(store.isProcessing);
  const slides = (n: number) => `${n} ${n === 1 ? "slide" : "slides"}`;
</script>

{#if store.locked.file}
  <PasswordPrompt
    fileName={store.locked.file.name}
    error={store.locked.error}
    busy={store.locked.busy}
    onsubmit={(password) => store.unlock(password)}
    oncancel={() => store.reset()}
  />
{:else if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files[0])} />
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !busy}
      <ResultCard title={`Saved ${slides(store.result.count)}`} description={`Your deck is ${store.result.name}.`}>
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
      name={store.file.name}
      meta={`${formatBytes(store.file.size)} · ${store.pageCount} ${store.pageCount === 1 ? "page" : "pages"}`}
      onRemove={busy ? undefined : () => store.reset()}
    />

    <p class="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
      Each page becomes one slide with the page as a picture, so the layout matches exactly. Text on the slide is not
      editable. The page text is added to the speaker notes so you can search and copy it.
    </p>
  </div>

  <WorkspaceInspector title="Slides">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Picture quality" description="Higher quality makes a larger file and takes longer.">
        <SegmentedControl name="{uid}-quality" options={qualities} bind:value={store.quality} />
      </OptionGroup>
      <OptionToggle label="Add page text to notes" description="Searchable text for each slide." bind:checked={store.notes} />
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if busy && store.step.total > 0}
        <ProgressLine label="Building slides" current={store.step.current} total={store.step.total} class="max-w-md" />
      {:else if busy}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Getting ready…
        </span>
      {:else}
        <span class="block truncate">{slides(store.pageCount)} · PowerPoint</span>
      {/if}
    {/snippet}

    <Button onclick={() => store.convert()} disabled={busy}>{busy ? "Converting…" : "Convert to PowerPoint"}</Button>
  </ToolFooter>
{/if}
