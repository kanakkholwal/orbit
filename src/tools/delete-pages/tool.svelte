<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import {
    ArrowRight,
    FileMinus2,
    Info,
    Loader2,
    Trash2,
  } from "@lucide/svelte";
  import { DeletePagesState } from "./helper.svelte";
  import PageThumbnail from "./PageThumbnail.svelte";

  const store = new DeletePagesState();
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files[0])}
  />
{:else}
  <div class="sticky top-0 z-20 border-b border-border px-4 py-3 backdrop-blur">
    <div
      class="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-4"
    >
      <div class="flex items-center gap-3 overflow-hidden max-w-50 sm:max-w-xs">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600"
        >
          <FileMinus2 size={18} />
        </div>
        <div class="min-w-0">
          <h3 class="truncate text-sm font-medium">{store.state.file.name}</h3>
          <p class="text-[10px] text-muted-foreground">
            {store.state.pageCount} Pages
          </p>
        </div>
      </div>

      <div class="flex-1 max-w-md flex items-center gap-2">
        <Input
          type="text"
          value={store.state.inputText}
          oninput={(e) => store.handleInputUpdate(e.currentTarget.value)}
          placeholder="e.g. 1, 3-5, 8"
          class="flex h-9 w-full rounded-md"
        />
        {#if store.state.pagesToDelete.size > 0}
          <span class="text-xs font-bold text-destructive whitespace-nowrap">
            -{store.state.pagesToDelete.size}
          </span>
        {/if}
      </div>

      <Button
        variant="destructive_soft"
        onclick={() => store.reset()}
        size="icon"
        title="Remove File"
      >
        <Trash2 size={18} />
      </Button>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
    <div class="mx-auto max-w-5xl">
      {#if store.state.pagesToDelete.size === 0}
        <div
          class="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground bg-background border border-border p-3 rounded-lg shadow-sm w-fit mx-auto"
        >
          <Info size={16} class="text-primary" /> Click on pages below or use the
          input bar to select pages for deletion.
        </div>
      {/if}

      <div
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        {#each Array.from({ length: store.state.pageCount }) as _, i (i)}
          <PageThumbnail {store} index={i} />
        {/each}
      </div>
    </div>
  </div>

  <div class="border-t border-border p-4 text-center">
    <Button
      variant="dark"
      onclick={() => store.process()}
      disabled={store.isProcessing || store.state.pagesToDelete.size === 0}
      class="inline-flex h-11 min-w-50 px-8"
    >
      {#if store.isProcessing}
        <Loader2 class="animate-spin" /> {store.progress}
      {:else}
        Delete Selected Pages <ArrowRight size={18} />
      {/if}
    </Button>
  </div>
{/if}
