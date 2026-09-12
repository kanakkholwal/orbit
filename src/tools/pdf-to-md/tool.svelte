<script lang="ts">
  import { FileRow, ProgressLine, StatusPill, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconCopy as Copy, IconDownload as Download, IconLoader2 as Loader } from "@tabler/icons-svelte";
  import { PdfToMdState } from "./helper.svelte";

  const store = new PdfToMdState();
  const uid = $props.id();

  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
  const charCount = $derived(store.markdown.length);
</script>

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(f) => store.selectFile(f[0])}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to turn into Markdown</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Get the text as editable Markdown with headings, lists and paragraphs. Works with PDFs that have selectable text.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.converted}
      <ToolBar
        label="Markdown"
        meta={`${pageLabel(store.pageCount)} · ${charCount.toLocaleString()} characters`}
        onReset={store.isProcessing ? undefined : () => store.reset()}
        resetLabel="Start over"
      >
        {#snippet actions()}
          <Button variant="outline" size="sm" onclick={() => store.copy()}>
            <Copy />
            Copy
          </Button>
          <Button variant="outline" size="sm" onclick={() => store.download()}>
            <Download />
            Download
          </Button>
        {/snippet}
      </ToolBar>

      <label for="{uid}-md" class="sr-only">Markdown</label>
      <textarea
        id="{uid}-md"
        bind:value={store.markdown}
        spellcheck="false"
        class="scrollbar-subtle min-h-[max(24rem,calc(100svh-18rem))] w-full resize-y rounded-xl border border-border bg-background p-4 font-mono text-body leading-relaxed text-foreground outline-none transition-colors focus:border-ring"
      ></textarea>
    {:else}
      <ToolBar label="File" onReset={store.isProcessing ? undefined : () => store.reset()} resetLabel="Clear" />

      <FileRow name={store.file.name} onRemove={store.isProcessing ? undefined : () => store.reset()}>
        <span>{formatBytes(store.file.size)}</span>
        {#snippet trailing()}
          {#if store.isProcessing}
            <StatusPill status="processing" label="Converting" />
          {/if}
        {/snippet}
      </FileRow>

      {#if store.isProcessing}
        <div class="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted text-muted-foreground">
          <Loader class="size-5 animate-spin text-primary" />
          <p class="text-body">Reading pages</p>
        </div>
      {:else}
        <p class="text-body text-muted-foreground">
          Headings, lists and paragraphs are detected from the layout. You can edit the result before you save it.
          Scanned PDFs need their text made searchable first.
        </p>
      {/if}
    {/if}
  </div>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine
          label="Reading pages"
          current={store.progress.current}
          total={store.progress.total}
          class="max-w-md"
        />
      {:else if store.converted}
        <span class="block truncate">Check the Markdown before you use it.</span>
      {:else}
        <span class="block truncate">Ready to convert {store.file?.name}</span>
      {/if}
    {/snippet}

    {#if store.converted}
      <Button variant="primary" onclick={() => store.download()} disabled={!store.hasResult}>Download Markdown</Button>
    {:else}
      <Button variant="primary" onclick={() => store.convert()} disabled={store.isProcessing}>
        {store.isProcessing ? "Converting…" : "Convert to Markdown"}
      </Button>
    {/if}
  </ToolFooter>
{/if}
