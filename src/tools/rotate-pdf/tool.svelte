<script lang="ts">
  import { ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import {
    ArrowRight,
    LoaderCircle,
    RefreshCcw,
    RotateCcw,
    RotateCw,
  } from "@lucide/svelte";
  import { RotatePdfState } from "./helper.svelte";
  import PageThumbnail from "./PageThumbnail.svelte";

  const store = new RotatePdfState();
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
        <Button
          variant="outline"
          size="sm"
          onclick={() => store.rotateAll(-90)}
          class="rounded-sm"
          title="Rotate all left"
        >
          <RotateCcw class="size-3.5" />
          <span class="hidden sm:inline">Left all</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onclick={() => store.rotateAll(90)}
          class="rounded-sm"
          title="Rotate all right"
        >
          <RotateCw class="size-3.5" />
          <span class="hidden sm:inline">Right all</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onclick={() => store.resetRotations()}
          class="rounded-sm text-muted-foreground hover:text-foreground"
          title="Reset rotations"
        >
          <RefreshCcw class="size-3.5" />
        </Button>
      {/snippet}
    </ToolBar>

    <ToolPanel title="Pages" counter={store.state.pageCount}>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {#each store.state.pages as _, i (i)}
          <PageThumbnail {store} index={i} />
        {/each}
      </div>
    </ToolPanel>

    <ToolFooter
      hint={store.isProcessing ? store.progressLabel : "Apply rotations"}
    >
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.save()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progressLabel}
        {:else}
          Apply & download
          <ArrowRight class="size-4" />
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
