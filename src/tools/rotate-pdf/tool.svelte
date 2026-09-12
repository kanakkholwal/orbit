<script lang="ts">
  import { OptionGroup, ResultCard, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import {
    IconArrowBackUp as Undo,
    IconDownload as Download,
    IconLoader2 as Loader,
    IconRefresh as Refresh,
    IconRotate2 as RotateLeft,
    IconRotateClockwise as RotateRight,
  } from "@tabler/icons-svelte";
  import { RotatePdfState } from "./helper.svelte";
  import PageThumbnail from "./PageThumbnail.svelte";

  const store = new RotatePdfState();

  const turned = $derived(store.turnedCount);
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
</script>

{#if !store.state.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files[0])}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to turn its pages</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Fix sideways or upside down pages, one at a time or all at once.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard
        title={`Turned ${pageLabel(store.result.turned)}`}
        description={`${store.result.name} is downloaded.`}
      >
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadResult()}>
            <Download />
            Download again
          </Button>
          <Button variant="ghost" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="rotate-pdf" />
      </ResultCard>
    {/if}

    <ToolBar
      label="Pages"
      count={store.state.pageCount}
      meta={store.state.file.name}
      onReset={store.isProcessing ? undefined : () => store.reset()}
      resetLabel="Close file"
    />

    <p class="text-body text-muted-foreground">Use the arrows under a page to turn it a quarter turn.</p>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {#each store.state.pages as page (page.pageIndex)}
        <PageThumbnail {store} index={page.pageIndex} />
      {/each}
    </div>
  </div>

  <WorkspaceInspector title="Rotation">
    <div class="flex flex-col gap-6">
      <OptionGroup label="All pages" description="Turn every page by a quarter turn.">
        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" onclick={() => store.rotateAll(-90)}>
            <RotateLeft />
            Turn left
          </Button>
          <Button variant="outline" onclick={() => store.rotateAll(90)}>
            <RotateRight />
            Turn right
          </Button>
        </div>
        <Button variant="ghost" disabled={turned === 0} onclick={() => store.resetRotations()}>
          <Undo />
          Undo all turns
        </Button>
      </OptionGroup>

      <OptionGroup label="Result">
        <dl class="flex flex-col divide-y divide-border rounded-xl border border-border">
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Pages</dt>
            <dd class="font-medium tabular-nums text-foreground">{store.state.pageCount}</dd>
          </div>
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Turned</dt>
            <dd class="font-medium tabular-nums text-foreground">{turned}</dd>
          </div>
        </dl>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Saving {pageLabel(turned)}…
        </span>
      {:else if turned === 0}
        <span class="block truncate">Turn at least one page to save.</span>
      {:else}
        <span class="block truncate tabular-nums">
          {pageLabel(turned)} will be turned, {store.state.pageCount - turned} stay as they are.
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.save()} disabled={store.isProcessing || turned === 0}>
      {store.isProcessing ? "Saving…" : turned > 0 ? `Turn ${pageLabel(turned)}` : "Turn pages"}
    </Button>
  </ToolFooter>
{/if}
