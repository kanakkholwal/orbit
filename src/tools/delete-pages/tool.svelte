<script lang="ts">
  import { ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { IconArrowRight as ArrowRight, IconInfoCircle as Info, IconLoader2 as LoaderCircle } from "@tabler/icons-svelte";
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
  <div class="flex flex-col gap-8">
    <ToolBar
      label={store.state.file.name}
      count={store.state.pageCount}
      onReset={() => store.reset()}
      resetLabel="Clear"
    />

    <ToolPanel
      title="Pages to delete"
      counter={store.state.pagesToDelete.size}
    >
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          type="text"
          value={store.state.inputText}
          oninput={(e) => store.handleInputUpdate(e.currentTarget.value)}
          placeholder="e.g. 1, 3-5, 8"
          class="h-10 flex-1 rounded-sm font-mono text-sm"
        />
        {#if store.state.pagesToDelete.size > 0}
          <span
            class="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-destructive/10 px-2.5 py-1 label-eyebrow text-destructive"
          >
            -{store.state.pagesToDelete.size} pages
          </span>
        {/if}
      </div>
      <p class="mt-2 text-xs leading-relaxed text-muted-foreground">
        Use commas for separate pages
        <code class="rounded-xs bg-muted/60 px-1 font-mono text-caption text-foreground">1, 3, 5</code>
        and hyphens for ranges
        <code class="rounded-xs bg-muted/60 px-1 font-mono text-caption text-foreground">1-5</code>.
      </p>
    </ToolPanel>

    <ToolPanel title="Pages" counter={store.state.pageCount}>
      {#if store.state.pagesToDelete.size === 0}
        <div
          class="mb-4 flex items-center justify-center gap-2 rounded-sm border border-border bg-muted/30 px-4 py-2.5"
        >
          <Info class="size-3.5 text-primary" />
          <p
            class="label-eyebrow text-muted-foreground"
          >
            Click pages to mark for deletion
          </p>
        </div>
      {/if}
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {#each Array.from({ length: store.state.pageCount }) as _, i (i)}
          <PageThumbnail {store} index={i} />
        {/each}
      </div>
    </ToolPanel>

    <ToolFooter
      hint={store.isProcessing
        ? store.progressLabel
        : `${store.state.pagesToDelete.size} page${store.state.pagesToDelete.size === 1 ? "" : "s"} marked`}
    >
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.process()}
        disabled={store.isProcessing || store.state.pagesToDelete.size === 0}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progressLabel}
        {:else}
          Delete & download
          <ArrowRight class="size-4" />
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
