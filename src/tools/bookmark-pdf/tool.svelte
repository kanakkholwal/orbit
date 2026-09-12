<script lang="ts">
  import { OptionGroup, ResultCard, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import {
    IconArrowBackUp as Undo,
    IconArrowForwardUp as Redo,
    IconChevronLeft as ChevronLeft,
    IconChevronRight as ChevronRight,
    IconDownload as Download,
    IconBookmarks as Bookmarks,
    IconFileImport as FileImport,
    IconLoader2 as Loader,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import BookmarkItem from "./BookmarkItem.svelte";
  import { BookmarkPdfState } from "./helper.svelte";
  import Viewer from "./Viewer.svelte";
  import { workspace } from "$stores/workspace.svelte";

  const store = new BookmarkPdfState();
  const uid = $props.id();

  let newTitle = $state("");
  let selectedId = $state<string | null>(null);
  let editingId = $state<string | null>(null);

  const current = $derived(store.state.currentPage);
  const total = $derived(store.totalCount);
  const canUndo = $derived(store.state.historyIndex > 0);
  const canRedo = $derived(store.state.historyIndex < store.state.history.length - 1);
  const bookmarkLabel = (n: number) => `${n} ${n === 1 ? "bookmark" : "bookmarks"}`;

  function addRoot() {
    const title = newTitle.trim();
    if (!title) return;
    selectedId = store.addBookmark(null, title);
    newTitle = "";
  }

  function clearAll() {
    store.reset();
    selectedId = null;
    editingId = null;
    newTitle = "";
  }
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf,application/pdf"
    multiple={false}
    disabled={store.state.isProcessing}
    onFilesSelected={(files) => store.loadFile(files[0])}
  >
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">
        {store.state.isProcessing ? "Opening your PDF" : "Drop a PDF to add bookmarks"}
      </h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Add a clickable table of contents so readers can jump straight to each section.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.state.isProcessing}
      <ResultCard
        title={`Saved with ${bookmarkLabel(store.result.count)}`}
        description={`${store.result.name} is downloaded.`}
      >
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadResult()}>
            <Download />
            Download again
          </Button>
          <Button variant="ghost" onclick={clearAll}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="bookmark-pdf" />
      </ResultCard>
    {/if}

    <ToolBar
      label={store.state.file.name}
      meta={`${store.state.pageCount} ${store.state.pageCount === 1 ? "page" : "pages"}`}
      onReset={store.state.isProcessing ? undefined : clearAll}
      resetLabel="Clear"
    >
      {#snippet actions()}
        <Button variant="outline" size="sm" class="xl:hidden" onclick={() => (workspace.inspectorDrawerOpen = true)}>
          <Bookmarks />
          Bookmarks
        </Button>
        <div class="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={current <= 1}
            onclick={() => store.setPage(current - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          <span class="min-w-24 px-1 text-center text-body tabular-nums text-foreground" aria-live="polite">
            Page {current} of {store.state.pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={current >= store.state.pageCount}
            onclick={() => store.setPage(current + 1)}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      {/snippet}
    </ToolBar>

    <Viewer {store} class="h-[max(22rem,calc(100dvh-17rem))]" />
  </div>

  <WorkspaceInspector title="Bookmarks">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Add a bookmark" description={`Links to page ${current}, the page you're looking at.`}>
        <div class="flex gap-2">
          <label for={`${uid}-new`} class="sr-only">Bookmark name</label>
          <input
            id={`${uid}-new`}
            type="text"
            bind:value={newTitle}
            placeholder="For example, Chapter 1"
            onkeydown={(e) => e.key === "Enter" && addRoot()}
            class="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring"
          />
          <Button variant="outline" onclick={addRoot} disabled={!newTitle.trim()}>Add</Button>
        </div>
      </OptionGroup>

      <section class="flex flex-col gap-2.5" aria-labelledby={`${uid}-list`}>
        <div class="flex items-center justify-between gap-2">
          <h3 id={`${uid}-list`} class="text-body font-medium text-foreground">
            Your bookmarks
            <span class="font-normal tabular-nums text-muted-foreground">{total}</span>
          </h3>
          <div class="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onclick={() => store.undo()} disabled={!canUndo} aria-label="Undo">
              <Undo />
            </Button>
            <Button variant="ghost" size="icon-sm" onclick={() => store.redo()} disabled={!canRedo} aria-label="Redo">
              <Redo />
            </Button>
          </div>
        </div>

        {#if store.state.bookmarks.length === 0}
          <p class="rounded-xl border border-dashed border-border px-3 py-4 text-center text-body text-muted-foreground">
            No bookmarks yet. Add one above, or bring in the ones this PDF already has.
          </p>
        {:else}
          <p class="text-caption text-muted-foreground">Select a bookmark to rename, nest or remove it.</p>
          <ul class="-mx-1 flex flex-col">
            {#each store.state.bookmarks as node (node.id)}
              <BookmarkItem
                {node}
                {store}
                {selectedId}
                {editingId}
                onselect={(id) => (selectedId = id)}
                onedit={(id) => (editingId = id)}
              />
            {/each}
          </ul>
        {/if}

        <Button variant="outline" class="w-full" onclick={() => store.extractExisting()}>
          <FileImport />
          Import bookmarks from this PDF
        </Button>
      </section>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.state.isProcessing}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Saving your PDF…
        </span>
      {:else if total === 0}
        <span class="block truncate">Add at least one bookmark to save.</span>
      {:else}
        <span class="block truncate tabular-nums">{bookmarkLabel(total)} will be added to the PDF.</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.save()} disabled={store.state.isProcessing || total === 0}>
      {store.state.isProcessing ? "Saving…" : "Save bookmarked PDF"}
    </Button>
  </ToolFooter>
{/if}
