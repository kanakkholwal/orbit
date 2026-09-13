<script lang="ts">
  import { OptionGroup, PasswordPrompt, ResultCard, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { sortableList } from "$lib/actions/sortable-list";
  import {
    IconArrowBackUp as Undo,
    IconDownload as Download,
    IconLoader2 as Loader,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { OrganizePdfState } from "./helper.svelte";
  import PageThumbnail from "./PageThumbnail.svelte";

  const store = new OrganizePdfState();
  const uid = $props.id();

  let orderInput = $state("");

  const pageCount = $derived(store.state.pages.length);
  const orderIssue = $derived(store.orderIssue(orderInput));
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;

  const pageGridSort = {
    onReorder: (o: number, n: number) => store.movePage(o, n),
    options: {
      animation: 200,
      ghostClass: "opacity-40",
      dragClass: "cursor-grabbing",
      filter: "button",
      preventOnFilter: false,
      delay: 150,
      delayOnTouchOnly: true,
    },
  };

  function applyOrder(e: SubmitEvent) {
    e.preventDefault();
    if (!orderInput.trim() || orderIssue) return;
    store.applyCustomOrder(orderInput);
    orderInput = "";
  }
</script>

{#if store.locked.file}
  <PasswordPrompt
    fileName={store.locked.file.name}
    error={store.locked.error}
    busy={store.locked.busy}
    onsubmit={(password) => store.unlock(password)}
    oncancel={() => store.reset()}
  />
{:else if !store.state.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files[0])}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to rearrange its pages</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Drag pages into a new order, copy or delete pages, then save a new PDF.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard
        title={`Saved a PDF with ${pageLabel(store.result.pages)}`}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="organize-pdf" />
      </ResultCard>
    {/if}

    <ToolBar
      label="Pages"
      count={pageCount}
      meta={store.state.file.name}
      onReset={store.isProcessing ? undefined : () => store.reset()}
      resetLabel="Close file"
    >
      {#snippet actions()}
        <Button
          variant="outline"
          size="sm"
          disabled={store.isOriginalOrder || store.isProcessing}
          onclick={() => store.restoreOriginalOrder()}
        >
          <Undo />
          <span class="hidden sm:inline">Restore original</span>
          <span class="sr-only sm:hidden">Restore original</span>
        </Button>
      {/snippet}
    </ToolBar>

    <p class="text-body text-muted-foreground">
      Drag pages into the order you want, or use the arrows under each page.
    </p>

    {#if pageCount === 0}
      <div class="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <Loader class="size-5 animate-spin text-primary" />
        <p class="text-body">Loading pages</p>
      </div>
    {:else}
      <div
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        use:sortableList={pageGridSort}
      >
        {#each store.state.pages as page, i (page.id)}
          <PageThumbnail {store} {page} index={i} total={pageCount} />
        {/each}
      </div>
    {/if}
  </div>

  <WorkspaceInspector title="Page order">
    <div class="flex flex-col gap-6">
      <OptionGroup
        label="Type an order"
        description="List page numbers in the order you want. Repeat a number to copy a page; leave one out to drop it."
      >
        <form class="flex flex-col gap-2" onsubmit={applyOrder}>
          <label for={`${uid}-order`} class="sr-only">Page order</label>
          <input
            id={`${uid}-order`}
            type="text"
            inputmode="numeric"
            bind:value={orderInput}
            placeholder="3, 1, 2, 4-6"
            aria-invalid={orderIssue ? "true" : undefined}
            aria-describedby={orderIssue ? `${uid}-order-issue` : undefined}
            class="h-10 w-full rounded-lg border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring {orderIssue
              ? 'border-destructive'
              : 'border-border'}"
          />
          {#if orderIssue}
            <span id={`${uid}-order-issue`} class="text-caption text-destructive">{orderIssue}</span>
          {/if}
          <Button type="submit" variant="outline" disabled={!orderInput.trim() || !!orderIssue}>Apply order</Button>
        </form>
      </OptionGroup>

      <OptionGroup label="New file">
        <dl class="flex flex-col divide-y divide-border rounded-xl border border-border">
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Pages</dt>
            <dd class="font-medium tabular-nums text-foreground">{pageCount}</dd>
          </div>
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Copied pages</dt>
            <dd class="font-medium tabular-nums text-foreground">{store.copyCount}</dd>
          </div>
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Left out</dt>
            <dd class="font-medium tabular-nums text-foreground">{store.removedCount}</dd>
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
          Saving {pageLabel(pageCount)}…
        </span>
      {:else if store.isOriginalOrder}
        <span class="block truncate">Pages are in their original order.</span>
      {:else}
        <span class="block truncate tabular-nums">The new PDF will have {pageLabel(pageCount)}.</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.save()} disabled={store.isProcessing || pageCount === 0}>
      {store.isProcessing ? "Saving…" : "Save new PDF"}
    </Button>
  </ToolFooter>
{/if}
