<script lang="ts">
  import { OptionGroup, ProgressLine, ResultCard, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { arrayMove, sortableList } from "$lib/actions/sortable-list";
  import {
    IconArrowBackUp as Undo,
    IconArrowForwardUp as Redo,
    IconDownload as Download,
    IconFilePlus as FilePlus,
    IconLoader2 as Loader,
    IconPlus as Plus,
    IconRefresh as Refresh,
    IconRotate2 as RotateLeft,
    IconRotateClockwise as RotateRight,
    IconTrash as Trash,
  } from "@tabler/icons-svelte";
  import { setContext } from "svelte";
  import { PDF_STATE_KEY, PdfEditorState } from "./helper.svelte";
  import PdfPage from "./PdfPage.svelte";

  const pdfState = new PdfEditorState();
  setContext(PDF_STATE_KEY, pdfState);

  let addInput = $state<HTMLInputElement | null>(null);

  const selectedCount = $derived(pdfState.selectedIds.size);
  const docs = $derived(pdfState.documentCount);
  const busy = $derived(pdfState.loader.show);
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const mod = isMac ? "⌘" : "Ctrl";

  const shortcuts = [
    { keys: `${mod} Z`, label: "Undo" },
    { keys: `${mod} Shift Z`, label: "Redo" },
    { keys: `${mod} A`, label: "Select all pages" },
    { keys: "Delete", label: "Delete selected pages" },
    { keys: "Esc", label: "Clear selection" },
  ];

  function onKeydown(e: KeyboardEvent) {
    if (pdfState.pages.length === 0 || busy) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable='true'], [role='dialog']")) return;
    const cmd = e.metaKey || e.ctrlKey;
    const key = e.key.toLowerCase();
    if (cmd && key === "z") {
      e.preventDefault();
      if (e.shiftKey) pdfState.redo();
      else pdfState.undo();
    } else if (cmd && key === "y") {
      e.preventDefault();
      pdfState.redo();
    } else if (cmd && key === "a") {
      e.preventDefault();
      pdfState.selectAll();
    } else if ((e.key === "Delete" || e.key === "Backspace") && selectedCount > 0) {
      e.preventDefault();
      pdfState.bulkDelete();
    } else if (e.key === "Escape" && selectedCount > 0) {
      pdfState.deselectAll();
    }
  }

  const iconButton = "text-muted-foreground";
</script>

<svelte:window onkeydown={onKeydown} />

{#if pdfState.pages.length === 0}
  {#if busy}
    <div class="flex min-h-80 flex-col items-center justify-center gap-4">
      <Loader class="size-5 animate-spin text-primary" />
      <ProgressLine label={pdfState.loader.text || "Opening files"} current={pdfState.loader.progress} total={100} class="w-full max-w-sm" />
    </div>
  {:else}
    <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => pdfState.loadPdfs(files)}>
      {#snippet title()}
        <h3 class="text-heading-sm font-medium text-foreground">Drop PDFs to rearrange</h3>
      {/snippet}
      {#snippet description()}
        <p class="max-w-sm text-pretty text-body text-muted-foreground">
          Reorder, rotate, duplicate and delete pages from one or more files, then save them as one PDF or several.
        </p>
      {/snippet}
    </UploadArea>
  {/if}
{:else}
  <div class="flex flex-col gap-4">
    {#if pdfState.result && !busy}
      <ResultCard
        title={pdfState.result.documents > 1 ? `Saved ${pdfState.result.documents} documents` : "Saved your PDF"}
        description={`${pdfState.result.name} is downloaded.`}
      >
        {#snippet actions()}
          <Button variant="outline" onclick={() => pdfState.downloadResult()}>
            <Download />
            Download again
          </Button>
          <Button variant="ghost" onclick={() => pdfState.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        {#if pdfState.resultFiles.length > 0}
          <FileSuggestions files={pdfState.resultFiles} heading="Continue with" exclude="multi-pdf" />
        {/if}
      </ResultCard>
    {/if}

    <ToolBar
      label="Pages"
      count={pdfState.pages.length}
      meta={selectedCount > 0 ? `${selectedCount} selected` : undefined}
    >
      {#snippet actions()}
        {#if selectedCount > 0}
          <Button variant="ghost" size="icon-sm" class={iconButton} onclick={() => pdfState.bulkRotate(-90)} aria-label="Rotate selected pages left" title="Rotate left">
            <RotateLeft class="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" class={iconButton} onclick={() => pdfState.bulkRotate(90)} aria-label="Rotate selected pages right" title="Rotate right">
            <RotateRight class="size-4" />
          </Button>
          <Button variant="ghost" size="sm" class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onclick={() => pdfState.bulkDelete()}>
            <Trash class="size-4" />
            Delete {selectedCount}
          </Button>
          <Button variant="ghost" size="sm" class="text-muted-foreground" onclick={() => pdfState.deselectAll()}>Clear</Button>
          <span class="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true"></span>
        {:else}
          <Button variant="ghost" size="sm" class="text-muted-foreground" onclick={() => pdfState.selectAll()}>Select all</Button>
        {/if}

        <Button variant="ghost" size="icon-sm" class={iconButton} disabled={!pdfState.canUndo} onclick={() => pdfState.undo()} aria-label="Undo" title={`Undo (${mod} Z)`}>
          <Undo class="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" class={iconButton} disabled={!pdfState.canRedo} onclick={() => pdfState.redo()} aria-label="Redo" title={`Redo (${mod} Shift Z)`}>
          <Redo class="size-4" />
        </Button>
        <Button variant="outline" size="sm" onclick={() => pdfState.addBlankPage()}>
          <FilePlus />
          <span class="hidden md:inline">Blank page</span>
          <span class="sr-only md:hidden">Add blank page</span>
        </Button>
        <Button variant="outline" size="sm" disabled={busy} onclick={() => addInput?.click()}>
          <Plus />
          <span class="hidden md:inline">Add files</span>
          <span class="sr-only md:hidden">Add files</span>
        </Button>
      {/snippet}
    </ToolBar>

    <p class="text-body text-muted-foreground">
      Tap a page to select it. Drag pages to reorder, and use the scissors to start a new document after a page.
    </p>

    <div
      use:sortableList={{
        onReorder: (o, n) => {
          pdfState.snapshot();
          pdfState.pages = arrayMove(pdfState.pages, o, n);
        },
        options: { animation: 200, ghostClass: "opacity-40", delay: 150, delayOnTouchOnly: true },
      }}
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6"
    >
      {#each pdfState.pages as page, i (page.id)}
        <PdfPage {page} index={i} isLast={i === pdfState.pages.length - 1} />
      {/each}
    </div>

    <input
      bind:this={addInput}
      type="file"
      accept=".pdf,application/pdf"
      multiple
      class="hidden"
      onchange={(e) => {
        const picked = Array.from(e.currentTarget.files ?? []);
        if (picked.length > 0) pdfState.loadPdfs(picked);
        e.currentTarget.value = "";
      }}
    />
  </div>

  <WorkspaceInspector title="Document">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Result">
        <dl class="flex flex-col divide-y divide-border rounded-xl border border-border">
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Pages</dt>
            <dd class="font-medium tabular-nums text-foreground">{pdfState.pages.length}</dd>
          </div>
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Documents</dt>
            <dd class="font-medium tabular-nums text-foreground">{docs}</dd>
          </div>
          <div class="flex items-center justify-between px-3 py-2.5 text-body">
            <dt class="text-muted-foreground">Saved as</dt>
            <dd class="font-medium text-foreground">{docs > 1 ? "ZIP of PDFs" : "One PDF"}</dd>
          </div>
        </dl>
      </OptionGroup>

      <OptionGroup label="Keyboard shortcuts">
        <ul class="flex flex-col gap-2">
          {#each shortcuts as s (s.label)}
            <li class="flex items-center justify-between gap-3 text-body">
              <span class="text-muted-foreground">{s.label}</span>
              <kbd class="shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans text-caption font-medium text-foreground">{s.keys}</kbd>
            </li>
          {/each}
        </ul>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if busy}
        <ProgressLine label={pdfState.loader.text || "Working"} current={pdfState.loader.progress} total={100} class="max-w-md" />
      {:else}
        <span class="block truncate tabular-nums">
          {pdfState.pages.length} {pdfState.pages.length === 1 ? "page" : "pages"} ·
          {docs > 1 ? `saves as ${docs} PDFs in a ZIP` : "saves as one PDF"}
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" disabled={busy} onclick={() => pdfState.download()}>
      {busy ? "Saving…" : docs > 1 ? `Save ${docs} PDFs` : "Save PDF"}
    </Button>
  </ToolFooter>
{/if}
