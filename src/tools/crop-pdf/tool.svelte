<script lang="ts">
  import { ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Checkbox } from "$components/ui/checkbox";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import {
    IconArrowRight as ArrowRight,
    IconChevronLeft as ChevronLeft,
    IconChevronRight as ChevronRight,
    IconLoader2 as LoaderCircle,
  } from "@tabler/icons-svelte";
  import CropperCanvas from "./CropperCanvas.svelte";
  import { CropPdfState } from "./helper.svelte";

  const store = new CropPdfState();
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files[0])}
  />
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar
      label={store.state.file.name}
      count={store.state.pageCount}
      onReset={() => store.reset()}
      resetLabel="Clear"
    >
      {#snippet actions()}
        <div class="flex items-center gap-1 rounded-sm border border-border/60 bg-card px-1 py-0.5">
          <button
            type="button"
            disabled={store.state.currentPage <= 1}
            onclick={() => store.setPage(store.state.currentPage - 1)}
            class="inline-flex size-7 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft class="size-3.5" />
          </button>
          <span
            class="w-16 text-center font-mono text-[11px] tabular-nums text-foreground"
          >
            {String(store.state.currentPage).padStart(2, "0")} / {String(store.state.pageCount).padStart(2, "0")}
          </span>
          <button
            type="button"
            disabled={store.state.currentPage >= store.state.pageCount}
            onclick={() => store.setPage(store.state.currentPage + 1)}
            class="inline-flex size-7 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight class="size-3.5" />
          </button>
        </div>
      {/snippet}
    </ToolBar>

    <ToolPanel title="Options">
      <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Label class="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox bind:checked={store.state.applyToAll} />
          <span class="label-eyebrow text-foreground">
            Apply to all pages
          </span>
        </Label>

        <span class="hidden h-3.5 w-px bg-border sm:block"></span>

        <Label
          class="flex cursor-pointer items-center gap-2 text-sm"
          title="Converts pages to images. Fixes stubborn PDFs but removes text selection."
        >
          <Checkbox bind:checked={store.state.isDestructive} />
          <span class="label-eyebrow text-foreground">
            Flatten · destructive
          </span>
        </Label>
      </div>
    </ToolPanel>

    <ToolPanel title="Canvas">
      <div class="rounded-sm border border-border/60 bg-muted/20 p-3 sm:p-4">
        <CropperCanvas {store} />
      </div>
    </ToolPanel>

    <ToolFooter hint={store.isProcessing ? store.progressLabel : "Crop document"}>
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.crop()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progressLabel}
        {:else}
          Crop PDF
          <ArrowRight class="size-4" />
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
