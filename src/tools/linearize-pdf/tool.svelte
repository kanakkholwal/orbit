<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconPlayerTrackNext as FastForward, IconLoader2 as LoaderCircle, IconPlus as Plus, IconBolt as Zap } from "@tabler/icons-svelte";
  import { LinearizePdfState } from "./helper.svelte";

  const store = new LinearizePdfState();
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
          disabled={store.isProcessing}
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
              onRemove={!store.isProcessing
                ? () => store.removeFile(file.id)
                : undefined}
            >
              <span class="font-mono tabular-nums">
                {formatBytes(file.originalSize)}
              </span>
            </FileRow>
          </li>
        {/each}
      </ul>
    </ToolPanel>

    <ToolPanel title="What is linearization?">
      <div
        class="flex items-start gap-3 rounded-sm border border-border/60 bg-muted/20 px-4 py-3"
      >
        <span
          class="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary"
        >
          <FastForward class="size-3.5" />
        </span>
        <ul
          class="flex flex-col gap-1 text-xs leading-relaxed text-muted-foreground"
        >
          <li>Optimizes the internal PDF structure for the web.</li>
          <li>
            Enables progressive loading — the first page renders immediately
            while the rest streams.
          </li>
          <li>Drastically improves UX for large PDFs hosted online.</li>
          <li>Also known as "Fast Web View".</li>
        </ul>
      </div>
    </ToolPanel>

    <ToolFooter
      hint={store.isProcessing
        ? store.progress.text
        : `Linearize ${store.files.length} document${store.files.length === 1 ? "" : "s"}`}
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
          Linearize
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
