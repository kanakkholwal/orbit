<script lang="ts">
  import Button from "$components/ui/button/button.svelte";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import {
    ArrowRight,
    Loader2,
    RefreshCcw,
    Rotate3D,
    RotateCcw,
    RotateCw,
    Trash2,
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
  <div
    class="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-border px-4 py-3"
  >
    <div class="flex items-center gap-3 overflow-hidden max-w-50 sm:max-w-xs">
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600"
      >
        <Rotate3D size={18} />
      </div>
      <div class="min-w-0">
        <h3 class="truncate text-sm font-medium">{store.state.file.name}</h3>
        <p class="text-[10px] text-muted-foreground">
          {store.state.pageCount} Pages
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <Button variant="outline" size="sm" onclick={() => store.rotateAll(-90)}>
        <RotateCcw size={14} /> <span class="hidden sm:inline">Left All</span>
      </Button>
      <Button variant="outline" size="sm" onclick={() => store.rotateAll(90)}>
        <RotateCw size={14} /> <span class="hidden sm:inline">Right All</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onclick={() => store.resetRotations()}
        title="Reset"
      >
        <RefreshCcw size={14} />
      </Button>
    </div>

    <Button
      onclick={() => store.reset()}
      variant="destructive_soft"
      size="sm"
      title="Remove File"
    >
      <Trash2 size={18} />
    </Button>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
    <div class="mx-auto max-w-5xl">
      <div
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        {#each store.state.pages as _, i (i)}
          <PageThumbnail {store} index={i} />
        {/each}
      </div>
    </div>
  </div>

  <div class="border-t border-border p-4 text-center">
    <Button
      size="lg"
      variant="dark"
      class="px-8 h-11 min-w-50"
      onclick={() => store.save()}
      disabled={store.state.isProcessing}
    >
      {#if store.state.isProcessing}
        <Loader2 class="animate-spin" /> {store.state.progress}
      {:else}
        Apply & Download <ArrowRight size={18} />
      {/if}
    </Button>
  </div>
{/if}
