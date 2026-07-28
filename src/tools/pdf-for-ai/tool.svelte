<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconBrain as BrainCircuit, IconLoader2 as LoaderCircle, IconPlus as Plus, IconBolt as Zap } from "@tabler/icons-svelte";
  import { PdfForAiState } from "./helper.svelte";

  const store = new PdfForAiState();
  let uploadArea: ReturnType<typeof UploadArea>;
</script>

<UploadArea
  bind:this={uploadArea}
  accept=".pdf"
  multiple={true}
  onFilesSelected={(files) => store.addFiles(files)}
  class={store.files.length > 0 ? "hidden" : ""}
/>

{#if store.files.length > 0}
  <div class="flex flex-col gap-8">
    <ToolBar
      label="Documents"
      count={store.files.length}
      onReset={() => store.reset()}
      resetLabel="Clear all"
    >
      {#snippet actions()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => uploadArea.click()}
          class="rounded-sm"
        >
          <Plus class="size-3.5" />
          <span class="hidden sm:inline">Add</span>
        </Button>
      {/snippet}
    </ToolBar>

    <ToolPanel title="Files" counter={store.files.length}>
      <ul class="flex flex-col gap-2">
        {#each store.files as file (file.id)}
          <li>
            <FileRow
              name={file.file.name}
              onRemove={() => store.removeFile(file.id)}
            >
              <span class="font-mono tabular-nums">
                {formatBytes(file.originalSize)}
              </span>
            </FileRow>
          </li>
        {/each}
      </ul>
    </ToolPanel>

    <ToolPanel title="Output format">
      <div
        class="flex items-start gap-3 rounded-sm border border-border/60 bg-muted/20 px-4 py-3"
      >
        <span
          class="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary"
        >
          <BrainCircuit class="size-3.5" />
        </span>
        <p class="text-xs leading-relaxed text-muted-foreground">
          Each PDF becomes an array of LlamaIndex-compatible JSON Document
          objects, ready for embedding into a RAG pipeline.
        </p>
      </div>

      <ul
        class="mt-4 flex flex-col divide-y divide-border/60 overflow-hidden rounded-sm border border-border/60 bg-muted/10"
      >
        {#each [
          ["text", "Extracted text content per page."],
          ["metadata", "Page number, detected headings, and document info."],
          ["extra_info", "Additional layout context for strict RAG systems."],
        ] as [key, body]}
          <li class="flex items-start gap-3 px-4 py-2.5 text-xs">
            <code
              class="rounded-xs bg-card px-1.5 py-0.5 font-mono text-[10px] text-foreground"
            >
              {key}
            </code>
            <span class="text-muted-foreground">{body}</span>
          </li>
        {/each}
      </ul>
    </ToolPanel>

    <ToolFooter
      hint={store.isProcessing
        ? store.progress.text
        : `Extract ${store.files.length} document${store.files.length === 1 ? "" : "s"} for RAG`}
    >
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.process()}
        disabled={store.isProcessing || store.files.length === 0}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progress.text}
        {:else}
          <Zap class="size-4" />
          Extract for AI
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
