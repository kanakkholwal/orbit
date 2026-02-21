<script lang="ts">
  import Button from "$components/ui/button/button.svelte";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import {
    ArrowRight,
    LayoutGrid,
    Loader2,
    Settings2,
    Trash2,
  } from "@lucide/svelte";
  import Sortable from "sortablejs";
  import { slide } from "svelte/transition";
  import { OrganizePdfState } from "./helper.svelte";
  import PageThumbnail from "./PageThumbnail.svelte";

  const store = new OrganizePdfState();

  let sortableContainer: HTMLElement;
  let customOrderInput = $state("");
  let showAdvanced = $state(false);

  function setupSortable(node: HTMLElement) {
    const sortable = Sortable.create(node, {
      animation: 150,
      ghostClass: "opacity-50",
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt;
        if (
          oldIndex !== undefined &&
          newIndex !== undefined &&
          oldIndex !== newIndex
        ) {
          // Update store state to match visual change
          store.movePage(oldIndex, newIndex);
        }
      },
    });
    return { destroy: () => sortable.destroy() };
  }

  function handleCustomOrder() {
    if (customOrderInput) {
      store.applyCustomOrder(customOrderInput);
      customOrderInput = ""; // Reset input
      showAdvanced = false;
    }
  }
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
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600"
      >
        <LayoutGrid size={18} />
      </div>
      <div class="min-w-0">
        <h3 class="truncate text-sm font-medium">{store.state.file.name}</h3>
        <p class="text-[10px] text-muted-foreground">
          {store.state.pages.length} Pages
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onclick={() => (showAdvanced = !showAdvanced)}
      >
        <Settings2 size={14} /> <span class="hidden sm:inline">Advanced</span>
      </Button>
      <Button
        onclick={() => store.reset()}
        variant="destructive_soft"
        size="sm"
        title="Remove File"
      >
        <Trash2 size={18} />
      </Button>
    </div>
  </div>

  {#if showAdvanced}
    <div class="border-b border-border bg-muted/30 p-4" transition:slide>
      <div class="mx-auto max-w-lg flex items-end gap-2">
        <div class="flex-1 space-y-1">
          <Label for="order-input" class="text-xs"
            >Manual Page Order (e.g. 1, 3, 2)</Label
          >
          <Input
            id="order-input"
            type="text"
            bind:value={customOrderInput}
            placeholder="e.g. 1, 2, 1, 3 (Duplicates allowed)"
            class="h-9 w-full rounded-md"
          />
        </div>
        <Button variant="dark" onclick={handleCustomOrder}>Apply</Button>
      </div>
    </div>
  {/if}

  <div class="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
    <div class="mx-auto max-w-5xl">
      <div
        use:setupSortable
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        {#each store.state.pages as page, i (page.id)}
          <PageThumbnail {store} {page} index={i} />
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
      disabled={store.isProcessing}
    >
      {#if store.isProcessing}
        <Loader2 class="animate-spin" /> {store.progress}
      {:else}
        Save Organized PDF <ArrowRight size={18} />
      {/if}
    </Button>
  </div>
{/if}
