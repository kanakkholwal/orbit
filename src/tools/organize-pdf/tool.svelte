<script lang="ts">
  import { ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import {
    ArrowRight,
    LoaderCircle,
    Settings2,
  } from "@lucide/svelte";
  import Sortable from "sortablejs";
  import { slide } from "svelte/transition";
  import { OrganizePdfState } from "./helper.svelte";
  import PageThumbnail from "./PageThumbnail.svelte";

  const store = new OrganizePdfState();

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
          store.movePage(oldIndex, newIndex);
        }
      },
    });
    return { destroy: () => sortable.destroy() };
  }

  function handleCustomOrder() {
    if (customOrderInput) {
      store.applyCustomOrder(customOrderInput);
      customOrderInput = "";
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
  <div class="flex flex-col gap-8">
    <ToolBar
      label={store.state.file.name}
      count={store.state.pages.length}
      onReset={() => store.reset()}
      resetLabel="Clear"
    >
      {#snippet actions()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => (showAdvanced = !showAdvanced)}
          aria-expanded={showAdvanced}
          class="rounded-sm"
        >
          <Settings2 class="size-3.5" />
          <span class="hidden sm:inline">Advanced</span>
        </Button>
      {/snippet}
    </ToolBar>

    {#if showAdvanced}
      <div transition:slide={{ duration: 220 }}>
        <ToolPanel title="Manual order">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div class="flex flex-1 flex-col gap-1.5">
              <Label
                for="order-input"
                class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                Page order
              </Label>
              <Input
                id="order-input"
                type="text"
                bind:value={customOrderInput}
                placeholder="e.g. 1, 2, 1, 3 (duplicates allowed)"
                class="h-10 rounded-sm font-mono text-sm"
              />
            </div>
            <Button
              onclick={handleCustomOrder}
              class="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Apply
            </Button>
          </div>
        </ToolPanel>
      </div>
    {/if}

    <ToolPanel title="Pages" counter={store.state.pages.length}>
      <div
        use:setupSortable
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        {#each store.state.pages as page, i (page.id)}
          <PageThumbnail {store} {page} index={i} />
        {/each}
      </div>
    </ToolPanel>

    <ToolFooter hint={store.isProcessing ? store.progressLabel : "Save reordered PDF"}>
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
          Save organized PDF
          <ArrowRight class="size-4" />
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
