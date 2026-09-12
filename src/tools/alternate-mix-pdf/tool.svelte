<script lang="ts">
  import { ChoiceList, OptionGroup, ProgressLine, ResultCard, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Switch } from "$components/ui/switch";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { sortableList } from "$lib/actions/sortable-list";
  import { formatBytes } from "$utils/helper";
  import {
    IconArrowDown as ArrowDown,
    IconArrowUp as ArrowUp,
    IconDownload as Download,
    IconGripVertical as GripVertical,
    IconPlus as Plus,
    IconRefresh as Refresh,
    IconX as X,
  } from "@tabler/icons-svelte";
  import { AlternateMixState } from "./helper.svelte";
  import type { RunOutMode } from "./mix";
  import { sourceLetter } from "./mix";

  const store = new AlternateMixState();
  const uid = $props.id();
  let addInput = $state<HTMLInputElement | null>(null);

  const PREVIEW_COUNT = 12;
  const runOutChoices: { value: RunOutMode; label: string; hint: string }[] = [
    { value: "append", label: "Add the rest at the end", hint: "Pages left in longer files follow in turn" },
    { value: "stop", label: "Stop there", hint: "Leftover pages are not included" },
  ];

  const order = $derived(store.order);
  const preview = $derived(order.slice(0, PREVIEW_COUNT));
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
  const sort = {
    onReorder: (from: number, to: number) => store.moveFile(from, to),
    options: { handle: ".drag-handle", animation: 200, ghostClass: "opacity-40", dragClass: "cursor-grabbing" },
  };
  const tones = ["bg-primary/10 text-primary", "bg-muted text-foreground"];
</script>

{#if store.files.length === 0}
  <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop PDFs to mix their pages</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Add two or more files. Pages are taken from each in turn, like shuffling front and back scans together.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard title={`Mixed into ${pageLabel(store.result.pages)}`} description={`${store.result.name} is downloaded.`}>
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="alternate-mix-pdf" />
      </ResultCard>
    {/if}

    <ToolBar
      label="Files"
      count={store.files.length}
      meta={`${pageLabel(store.totalPages)} · ${formatBytes(store.totalSize)}`}
      onReset={store.isProcessing ? undefined : () => store.reset()}
      resetLabel="Clear all"
    >
      {#snippet actions()}
        <Button variant="outline" size="sm" disabled={store.isProcessing} onclick={() => addInput?.click()}>
          <Plus />
          Add files
        </Button>
      {/snippet}
    </ToolBar>

    <p class="text-body text-muted-foreground">
      Pages are taken from each file in turn, top to bottom. Drag a row or use the arrows to change who goes first.
    </p>

    <div class="flex flex-col gap-2" use:sortableList={sort}>
      {#each store.files as file, i (file.id)}
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border bg-card py-2 pl-1 pr-2 sm:flex-nowrap">
          <div class="flex items-center">
            <span
              class="drag-handle grid size-9 cursor-grab place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
              aria-hidden="true"
            >
              <GripVertical class="size-4" />
            </span>
            <span class="grid size-8 place-items-center rounded-lg text-body font-medium {tones[i % 2]}">
              {sourceLetter(i)}
            </span>
          </div>

          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="truncate text-body font-medium text-foreground" title={file.file.name}>{file.file.name}</span>
            <span class="text-caption tabular-nums text-muted-foreground">
              {pageLabel(file.pageCount)} · {formatBytes(file.size)}{file.reversed ? " · last page first" : ""}
            </span>
          </div>

          <div class="order-last flex w-full items-center gap-4 pl-10 sm:order-0 sm:w-auto sm:pl-0">
            <label class="flex items-center gap-2 text-body text-muted-foreground">
              <Switch bind:checked={file.reversed} aria-label={`Reverse the order of ${file.file.name}`} />
              Reverse
            </label>
            <label class="flex items-center gap-2 text-body text-muted-foreground">
              <input
                type="number"
                min="1"
                max={Math.max(1, file.pageCount)}
                bind:value={file.perTurn}
                aria-label={`Pages per turn from ${file.file.name}`}
                class="h-9 w-16 rounded-lg border border-border bg-background px-2 text-body tabular-nums text-foreground outline-none transition-colors focus:border-ring"
              />
              per turn
            </label>
          </div>

          <div class="flex items-center">
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-muted-foreground"
              disabled={i === 0 || store.isProcessing}
              onclick={() => store.moveFile(i, i - 1)}
              aria-label={`Move ${file.file.name} up`}
            >
              <ArrowUp class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-muted-foreground"
              disabled={i === store.files.length - 1 || store.isProcessing}
              onclick={() => store.moveFile(i, i + 1)}
              aria-label={`Move ${file.file.name} down`}
            >
              <ArrowDown class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              disabled={store.isProcessing}
              onclick={() => store.removeFile(file.id)}
              aria-label={`Remove ${file.file.name}`}
            >
              <X class="size-4" />
            </Button>
          </div>
        </div>
      {/each}
    </div>

    <section aria-labelledby="{uid}-order" class="flex flex-col gap-3 rounded-2xl border border-border bg-muted px-4 py-4">
      <div class="flex items-baseline justify-between gap-3">
        <h3 id="{uid}-order" class="text-body font-medium text-foreground">Page order</h3>
        <span class="text-caption tabular-nums text-muted-foreground">{pageLabel(order.length)} in the result</span>
      </div>
      {#if store.files.length < 2}
        <p class="text-body text-muted-foreground">Add another file to see how the pages will be mixed.</p>
      {:else}
        <ol class="flex flex-wrap gap-1.5" aria-label="First pages of the result">
          {#each preview as slot, i (i)}
            <li class="rounded-md px-2 py-1 text-caption font-medium tabular-nums {tones[slot.source % 2]}">
              <span class="sr-only">Page {i + 1}: file</span>
              {store.label(slot)}
            </li>
          {/each}
          {#if order.length > PREVIEW_COUNT}
            <li class="px-1 py-1 text-caption text-muted-foreground">and {order.length - PREVIEW_COUNT} more</li>
          {/if}
        </ol>
        <p class="text-caption text-muted-foreground">A2 means page 2 of file A.</p>
      {/if}
    </section>

    <input
      bind:this={addInput}
      type="file"
      accept=".pdf,application/pdf"
      multiple
      class="hidden"
      onchange={(e) => {
        const picked = Array.from(e.currentTarget.files ?? []);
        if (picked.length > 0) store.addFiles(picked);
        e.currentTarget.value = "";
      }}
    />
  </div>

  <WorkspaceInspector title="Mix">
    <div class="flex flex-col gap-6">
      <OptionGroup
        label="Double-sided scans"
        description="Scanned the fronts, then flipped the stack and scanned the backs? This puts every back page behind its front."
      >
        <Button variant="outline" class="w-full" disabled={store.files.length !== 2} onclick={() => store.collateDuplex()}>
          Collate double-sided scans
        </Button>
        {#if store.files.length !== 2}
          <p class="text-caption text-muted-foreground">Needs exactly two files: fronts first, backs second.</p>
        {/if}
      </OptionGroup>

      <OptionGroup label="When a file runs out">
        <ChoiceList name="{uid}-run-out" choices={runOutChoices} bind:value={store.runOut} />
      </OptionGroup>

      <OptionGroup label="File name" description="Saved to your downloads as a PDF.">
        <label for="{uid}-name" class="sr-only">File name</label>
        <input
          id="{uid}-name"
          type="text"
          bind:value={store.outputName}
          placeholder="mixed.pdf"
          class="h-10 w-full rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring"
        />
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if store.files.length < 2}
        <span class="block truncate">Add another file to mix.</span>
      {:else}
        <span class="block truncate tabular-nums">{store.files.length} files · {pageLabel(order.length)} in the result</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={!store.canRun}>
      {store.isProcessing ? "Mixing…" : `Mix ${pageLabel(order.length)}`}
    </Button>
  </ToolFooter>
{/if}
