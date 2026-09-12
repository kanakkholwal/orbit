<script lang="ts">
  import { FileRow, OptionGroup, OptionToggle, ProgressLine, ResultCard, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { prefersReducedMotion } from "$lib/motion";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import {
    IconArrowRight as ArrowRight,
    IconArrowsExchange as Swap,
    IconChevronDown as ChevronDown,
    IconChevronUp as ChevronUp,
    IconFileSearch as FileSearch,
    IconPlus as Plus,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import type { DiffPart } from "./diff";
  import { CompareState, type PageResult, type Side } from "./helper.svelte";

  const store = new CompareState();

  let picker = $state<HTMLInputElement | null>(null);
  let pickingSide = $state<Side>("original");
  let diffView = $state<HTMLElement | null>(null);

  const slots: { side: Side; label: string; empty: string }[] = [
    { side: "original", label: "Original", empty: "Choose the original PDF" },
    { side: "changed", label: "Changed", empty: "Choose the changed PDF" },
  ];

  const plural = (n: number, word: string) => `${n} ${n === 1 ? word : `${word}s`}`;

  const showDiff = $derived(store.compared && !store.isProcessing);
  const visiblePages = $derived(store.hideSame ? store.results.filter((p) => p.status !== "same") : store.results);
  const pageCounts = $derived({
    before: store.original?.pages?.length ?? 0,
    after: store.changed?.pages?.length ?? 0,
  });
  const currentPage = $derived(
    store.results.find((p) => p.changes > 0 && store.current >= p.firstChange && store.current < p.firstChange + p.changes)
  );

  function choose(side: Side) {
    pickingSide = side;
    picker?.click();
  }

  function partText(part: DiffPart) {
    return part.tokens.map((t) => (t.br ? (part.kind === "same" ? "\n" : " ↵\n") : t.text)).join(" ");
  }

  function pageLabel(page: PageResult) {
    if (page.status === "added") return `Page ${page.after}`;
    if (page.status === "removed") return `Page ${page.before}`;
    return page.before === page.after ? `Page ${page.after}` : null;
  }

  function statusLabel(page: PageResult) {
    if (page.status === "added") return "New page";
    if (page.status === "removed") return "Removed page";
    return page.changes > 0 ? plural(page.changes, "change") : "No changes";
  }

  function goTo(index: number) {
    if (store.totalChanges === 0) return;
    store.current = (index + store.totalChanges) % store.totalChanges;
    const el = diffView?.querySelector<HTMLElement>(`[data-change="${store.current}"]`);
    const details = el?.closest("details");
    if (details) details.open = true;
    el?.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  $effect(() => {
    if (store.current >= store.totalChanges) store.current = 0;
  });
</script>

{#if !store.original && !store.changed}
  <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop two PDFs to compare</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        See every word that was added or removed between two versions. The first file is treated as the original.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showDiff}
      {#if !store.hasText}
        <section class="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 sm:p-5" aria-live="polite">
          <h2 class="text-body-lg font-medium text-foreground">No text to compare</h2>
          <p class="text-body text-muted-foreground">
            These PDFs look like scans or images, so there are no words to read. Run
            <a href="/tools/ocr-pdf" class="font-medium text-primary underline-offset-4 hover:underline">OCR PDF</a>
            on both files first, then compare them again.
          </p>
        </section>
      {:else}
        <ResultCard
          title={store.totalChanges > 0
            ? `${plural(store.totalChanges, "change")} across ${plural(store.changedPages, "page")}`
            : "No differences found"}
          description={pageCounts.before !== pageCounts.after
            ? `The original has ${plural(pageCounts.before, "page")} and the changed file has ${pageCounts.after}.`
            : store.totalChanges > 0
              ? "Added words are green. Removed words are red and struck through."
              : "The text in both files matches. Layout, images and colours are not compared."}
        >
          {#snippet actions()}
            <Button variant="ghost" onclick={() => store.reset()}>
              <Refresh />
              Start over
            </Button>
          {/snippet}
        </ResultCard>
      {/if}
    {/if}

    <ToolBar label="Files" count={[store.original, store.changed].filter(Boolean).length} onReset={store.isProcessing ? undefined : () => store.reset()} resetLabel="Clear all">
      {#snippet actions()}
        <Button variant="outline" size="sm" disabled={store.isProcessing || !store.ready} onclick={() => store.swap()}>
          <Swap />
          Swap
        </Button>
      {/snippet}
    </ToolBar>

    <div class="grid gap-2 sm:grid-cols-2">
      {#each slots as slot (slot.side)}
        {@const entry = store[slot.side]}
        <div class="flex min-w-0 flex-col gap-1.5">
          <span class="text-caption font-medium text-muted-foreground">{slot.label}</span>
          {#if entry}
            <FileRow
              name={entry.file.name}
              meta={entry.pages ? `${formatBytes(entry.file.size)} · ${plural(entry.pages.length, "page")}` : formatBytes(entry.file.size)}
              onRemove={store.isProcessing ? undefined : () => store.removeFile(slot.side)}
            />
          {:else}
            <button
              type="button"
              onclick={() => choose(slot.side)}
              class="flex h-14 items-center gap-3 rounded-xl border border-dashed border-border-strong px-2 text-left text-body text-muted-foreground outline-none transition-colors hover:border-primary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-muted"><Plus class="size-5" /></span>
              {slot.empty}
            </button>
          {/if}
        </div>
      {/each}
    </div>

    {#if showDiff && store.hasText}
      <div bind:this={diffView} class="flex flex-col gap-3">
        {#if visiblePages.length === 0}
          <p class="py-10 text-center text-body text-muted-foreground">Every page matches. Turn off "Hide unchanged pages" to read them.</p>
        {/if}
        {#each visiblePages as page (`${page.before}-${page.after}`)}
          {@const label = pageLabel(page)}
          <section
            aria-label={label ?? `Original page ${page.before}, changed page ${page.after}`}
            class="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <details open={page.status !== "same"} class="group">
              <summary
                class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
              >
                <span class="flex items-center gap-1.5 text-body font-medium tabular-nums text-foreground">
                  {#if label}
                    {label}
                  {:else}
                    Page {page.before}
                    <ArrowRight class="size-3.5 text-muted-foreground" aria-label="is now" />
                    {page.after}
                  {/if}
                </span>
                <span class="flex items-center gap-2">
                  <span
                    class={cn(
                      "rounded-full px-2 py-0.5 text-caption font-medium tabular-nums",
                      page.status === "same" && "bg-muted text-muted-foreground",
                      page.status === "changed" && "bg-primary/10 text-primary",
                      page.status === "added" && "bg-primary/10 text-primary",
                      page.status === "removed" && "bg-destructive/10 text-destructive"
                    )}
                  >
                    {statusLabel(page)}
                  </span>
                  <ChevronDown class="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </span>
              </summary>
              <div class="border-t border-border px-4 py-4">
                {#if page.rough}
                  <p class="mb-3 text-caption text-muted-foreground">
                    These pages are too different to match word by word, so the whole text is shown as replaced.
                  </p>
                {/if}
                {#if page.parts.length === 0}
                  <p class="text-body text-muted-foreground">This page has no text.</p>
                {:else}
                  <p class="whitespace-pre-line break-words text-body leading-relaxed text-foreground">
                    {#each page.parts as part, i (i)}
                      {#if part.kind === "same"}
                        <span>{partText(part)}</span>
                      {:else}
                        {@const index = page.firstChange + part.change}
                        <span
                          data-change={index}
                          class={cn(
                            "rounded-sm px-0.5 box-decoration-clone",
                            part.kind === "added"
                              ? "bg-primary/15 underline decoration-primary decoration-1 underline-offset-2"
                              : "bg-destructive/10 text-destructive line-through",
                            store.current === index && "ring-2 ring-primary"
                          )}
                        >
                          <span class="sr-only">{part.kind === "added" ? "Added:" : "Removed:"}</span>
                          {partText(part)}
                        </span>
                      {/if}{" "}
                    {/each}
                  </p>
                {/if}
              </div>
            </details>
          </section>
        {/each}
      </div>
    {:else if !store.isProcessing && store.ready}
      <div class="flex flex-col items-center gap-2 rounded-2xl border border-border bg-muted px-4 py-12 text-center">
        <FileSearch class="size-6 text-muted-foreground" stroke={1.75} />
        <p class="max-w-sm text-body text-muted-foreground">
          Compare reads the text of both files on this device and marks what changed, page by page.
        </p>
      </div>
    {/if}

    <input
      bind:this={picker}
      type="file"
      accept=".pdf,application/pdf"
      class="hidden"
      onchange={(e) => {
        const file = e.currentTarget.files?.[0];
        if (file) store.setFile(pickingSide, file);
        e.currentTarget.value = "";
      }}
    />
  </div>

  <WorkspaceInspector title="Comparison">
    <div class="flex flex-col gap-6">
      <OptionGroup label="What counts as a change">
        <div class="-my-2.5 flex flex-col divide-y divide-border">
          <OptionToggle
            label="Ignore spacing and capitals"
            description="Line breaks and upper or lower case are not marked"
            bind:checked={store.loose}
          />
          <OptionToggle
            label="Hide unchanged pages"
            description="Show only pages with differences"
            bind:checked={store.hideSame}
          />
        </div>
      </OptionGroup>

      <OptionGroup label="Key" description="Only text is compared. Images, layout and colours are not.">
        <ul class="flex flex-col gap-2 text-body text-foreground">
          <li class="flex items-center gap-2">
            <span class="rounded-sm bg-primary/15 px-1 underline decoration-primary decoration-1 underline-offset-2">added</span>
            <span class="text-muted-foreground">in the changed file</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="rounded-sm bg-destructive/10 px-1 text-destructive line-through">removed</span>
            <span class="text-muted-foreground">from the original</span>
          </li>
          {#if !store.loose}
            <li class="flex items-center gap-2">
              <span class="rounded-sm bg-primary/15 px-1">↵</span>
              <span class="text-muted-foreground">a line break that moved</span>
            </li>
          {/if}
        </ul>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if showDiff && store.totalChanges > 0}
        <span class="block truncate tabular-nums">
          Change {store.current + 1} of {store.totalChanges}{currentPage ? ` · ${pageLabel(currentPage) ?? `page ${currentPage.after}`}` : ""}
        </span>
      {:else if showDiff}
        <span class="block truncate">{store.hasText ? "No differences in the text" : "Nothing to compare"}</span>
      {:else if !store.ready}
        <span class="block truncate">Add {store.original ? "the changed PDF" : "the original PDF"} to compare.</span>
      {:else}
        <span class="block truncate">{store.original?.file.name} and {store.changed?.file.name}</span>
      {/if}
    {/snippet}

    {#if showDiff && store.totalChanges > 0}
      <Button variant="outline" onclick={() => goTo(store.current - 1)} aria-keyshortcuts="Shift+N">
        <ChevronUp />
        Previous
      </Button>
      <Button variant="primary" onclick={() => goTo(store.current + 1)} aria-keyshortcuts="N">
        <ChevronDown />
        Next change
      </Button>
    {:else if !showDiff}
      <Button variant="primary" onclick={() => store.compare()} disabled={store.isProcessing || !store.ready}>
        {store.isProcessing ? "Comparing…" : "Compare"}
      </Button>
    {/if}
  </ToolFooter>
{/if}

<svelte:window
  onkeydown={(e) => {
    if (!showDiff || store.totalChanges === 0 || e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable]")) return;
    if (e.key.toLowerCase() !== "n") return;
    e.preventDefault();
    goTo(store.current + (e.shiftKey ? -1 : 1));
  }}
/>

