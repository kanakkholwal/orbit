<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconLoader2 as LoaderCircle, IconMessageOff as MessageSquareOff, IconBolt as Zap } from "@tabler/icons-svelte";
  import { RemoveAnnotationsState } from "./helper.svelte";

  const store = new RemoveAnnotationsState();
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    onFilesSelected={(files) => store.loadFile(files)}
  />
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar
      label={store.state.file.name}
      count={store.state.pageCount}
      onReset={() => store.reset()}
      resetLabel="Clear"
    />

    <ToolPanel title="Source">
      <FileRow
        name={store.state.file.name}
        onRemove={() => store.reset()}
      >
        <span class="font-mono tabular-nums">
          {formatBytes(store.state.originalSize)}
        </span>
        <span class="text-muted-foreground">·</span>
        <span class="font-mono tabular-nums">
          {store.state.pageCount} pages
        </span>
      </FileRow>
    </ToolPanel>

    <ToolPanel title="Action">
      <div
        class="flex items-start gap-3 rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-3"
      >
        <span
          class="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-destructive/15 text-destructive"
        >
          <MessageSquareOff class="size-3.5" />
        </span>
        <div class="flex flex-col gap-1">
          <span
            class="label-eyebrow text-destructive"
          >
            Permanent
          </span>
          <p class="text-xs leading-relaxed text-muted-foreground">
            All comments, highlights, stamps, and interactive form fields will
            be permanently removed from the document.
          </p>
        </div>
      </div>
    </ToolPanel>

    <ToolFooter
      hint={store.isProcessing ? "Processing" : "Strip annotations"}
    >
      <Button
        size="lg"
        variant="destructive"
        class="rounded-sm px-6 shadow-sm"
        onclick={() => store.process()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          Processing
        {:else}
          <Zap class="size-4" />
          Remove all annotations
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
