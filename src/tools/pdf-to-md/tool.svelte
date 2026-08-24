<script lang="ts">
  import { ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { IconCopy as Copy, IconDownload as DownloadIcon, IconLoader2 as LoaderCircle } from "@tabler/icons-svelte";
  import { PdfToMdState } from "./helper.svelte";

  const store = new PdfToMdState();
</script>

{#if !store.hasResult && !store.isProcessing}
  <UploadArea
    accept="application/pdf"
    multiple={false}
    onFilesSelected={(f) => store.loadFile(f[0])}
  >
    {#snippet title()}
      <h3 class="text-display-sm text-foreground">PDF to Markdown</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-md text-sm leading-relaxed text-muted-foreground">
        Extract a text-based PDF into clean Markdown — headings, lists and
        paragraphs are inferred. Scanned PDFs need OCR first. Runs on your
        device.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-6">
    <ToolBar
      label="PDF → Markdown"
      count={store.pageCount}
      onReset={() => store.reset()}
      resetLabel="Start over"
    >
      {#snippet actions()}
        <Button
          variant="outline"
          size="sm"
          class="rounded-md"
          onclick={() => store.copy()}
          disabled={!store.hasResult}
        >
          <Copy class="size-3.5" />
          <span class="hidden sm:inline">Copy</span>
        </Button>
      {/snippet}
    </ToolBar>

    <div class="flex flex-col gap-2">
      <span class="label-eyebrow text-muted-foreground">Markdown output</span>
      {#if store.isProcessing}
        <div
          class="flex min-h-105 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20"
        >
          <span
            class="inline-flex items-center gap-2 label-eyebrow text-xs text-muted-foreground"
          >
            <LoaderCircle class="size-4 animate-spin" />
            {store.progressLabel}
          </span>
        </div>
      {:else}
        <textarea
          bind:value={store.markdown}
          spellcheck="false"
          class="min-h-105 w-full resize-y rounded-lg border border-border bg-card p-4 font-mono text-caption leading-relaxed text-foreground shadow-xs outline-none focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/30"
        ></textarea>
      {/if}
    </div>

    <ToolFooter
      hint={store.isProcessing
        ? store.progressLabel
        : `Extracted from ${store.pageCount} page${store.pageCount === 1 ? "" : "s"} · review before use`}
    >
      <Button
        size="lg"
        class="rounded-md bg-primary px-6 text-primary-foreground hover:bg-primary-active"
        onclick={() => store.download()}
        disabled={store.isProcessing || !store.hasResult}
      >
        <DownloadIcon class="size-4" />
        Download .md
      </Button>
    </ToolFooter>
  </div>
{/if}
