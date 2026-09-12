<script lang="ts">
  import { ChoiceList, FileRow, OptionGroup, ResultCard, SegmentedControl, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconLoader2 as Loader, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { InsertBlankPagesState } from "./helper.svelte";
  import type { BlankSize, InsertPosition } from "./plan";
  import StripThumb from "./StripThumb.svelte";

  const store = new InsertBlankPagesState();
  const uid = $props.id();
  const PREVIEW_LIMIT = 40;

  const positions: { value: InsertPosition; label: string; hint: string }[] = [
    { value: "start", label: "At the start", hint: "Before the first page" },
    { value: "end", label: "At the end", hint: "After the last page" },
    { value: "every", label: "After every few pages", hint: "Useful for notes or double-sided printing" },
    { value: "after", label: "After specific pages", hint: "Pick the pages yourself" },
  ];

  const sizes: { value: BlankSize; label: string }[] = [
    { value: "match", label: "Match" },
    { value: "a4", label: "A4" },
    { value: "letter", label: "Letter" },
  ];

  const busy = $derived(store.isProcessing);
  const plan = $derived(store.plan);
  const added = $derived(plan.length - store.pageCount);
  const shown = $derived(plan.slice(0, PREVIEW_LIMIT));
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
  const countValid = $derived(Number.isInteger(store.count) && store.count >= 1 && store.count <= 100);
  const everyValid = $derived(Number.isInteger(store.every) && store.every >= 1);

  const blocker = $derived.by(() => {
    if (!countValid) return "Choose between 1 and 100 blank pages.";
    if (store.position === "every" && !everyValid) return "Choose how many pages to skip between blanks.";
    if (store.position === "after" && store.afterPages.length === 0) {
      return store.afterText.trim()
        ? `Those pages are not in this file. It has ${pageLabel(store.pageCount)}.`
        : "Type the pages to add blanks after, like 2, 5.";
    }
    if (added === 0) return `This file has fewer than ${store.every} pages, so nothing would be added.`;
    return null;
  });
</script>

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to add blank pages</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Add empty pages for notes, signatures or double-sided printing, exactly where you need them.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !busy}
      <ResultCard
        title="Blank pages added"
        description={`${store.result.name} now has ${pageLabel(store.result.pages)} and is downloaded.`}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="insert-blank-pages" />
      </ResultCard>
    {/if}

    <FileRow
      name={store.file.name}
      meta={`${formatBytes(store.file.size)} · ${pageLabel(store.pageCount)}`}
      onRemove={busy ? undefined : () => store.reset()}
    />

    <section aria-labelledby="{uid}-order" class="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="{uid}-order" class="text-body font-medium text-foreground">New page order</h2>
        <span class="text-caption tabular-nums text-muted-foreground">
          {pageLabel(store.pageCount)} + {added} blank = {plan.length}
        </span>
      </div>

      <ol class="flex flex-wrap gap-2">
        {#each shown as item, i (item.key)}
          <li>
            {#if item.kind === "page"}
              <StripThumb {store} pageIndex={item.index} position={i + 1} />
            {:else}
              <figure class="flex w-16 flex-col items-center gap-1">
                <div
                  class="grid aspect-[1/1.414] w-full place-items-center rounded-md border border-dashed border-primary/60 bg-primary/5 text-caption text-primary"
                >
                  Blank
                </div>
                <figcaption class="text-caption tabular-nums text-muted-foreground">{i + 1}</figcaption>
              </figure>
            {/if}
          </li>
        {/each}
      </ol>

      {#if plan.length > PREVIEW_LIMIT}
        <p class="text-caption text-muted-foreground">+ {plan.length - PREVIEW_LIMIT} more</p>
      {/if}
    </section>
  </div>

  <WorkspaceInspector title="Blank pages">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Where">
        <ChoiceList name="{uid}-position" choices={positions} bind:value={store.position} />
      </OptionGroup>

      <OptionGroup
        label="Every how many pages"
        description={store.position === "every" ? "1 adds a blank after every page." : "Only for After every few pages."}
      >
        <label for="{uid}-every" class="sr-only">Every how many pages</label>
        <Input
          id="{uid}-every"
          type="number"
          min="1"
          max={store.pageCount}
          inputmode="numeric"
          bind:value={store.every}
          disabled={store.position !== "every"}
          aria-invalid={store.position === "every" && !everyValid}
        />
      </OptionGroup>

      <OptionGroup
        label="After pages"
        description={store.position === "after" ? "Type page numbers or ranges, like 2, 5 or 3-6." : "Only for After specific pages."}
      >
        <label for="{uid}-after" class="sr-only">After pages</label>
        <Input
          id="{uid}-after"
          type="text"
          bind:value={store.afterText}
          placeholder="2, 5"
          disabled={store.position !== "after"}
          aria-invalid={store.position === "after" && store.afterText.trim() !== "" && store.afterPages.length === 0}
        />
      </OptionGroup>

      <OptionGroup label="Blank pages each time">
        <label for="{uid}-count" class="sr-only">Blank pages each time</label>
        <Input
          id="{uid}-count"
          type="number"
          min="1"
          max="100"
          inputmode="numeric"
          bind:value={store.count}
          aria-invalid={!countValid}
        />
      </OptionGroup>

      <OptionGroup
        label="Page size"
        description={store.size === "match" ? "Same size as the page next to it." : "Portrait, whatever size the pages around it are."}
      >
        <SegmentedControl name="{uid}-size" options={sizes} bind:value={store.size} />
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if busy}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Adding blank pages…
        </span>
      {:else if blocker}
        <span class="block truncate text-destructive">{blocker}</span>
      {:else}
        <span class="block truncate">Adds {pageLabel(added)} · {pageLabel(plan.length)} in total</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={busy || blocker !== null}>
      {busy ? "Adding…" : `Add ${added} blank ${added === 1 ? "page" : "pages"}`}
    </Button>
  </ToolFooter>
{/if}
