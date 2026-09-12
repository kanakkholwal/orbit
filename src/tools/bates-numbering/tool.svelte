<script lang="ts">
  import {
    OptionGroup,
    OptionToggle,
    ProgressLine,
    ResultCard,
    SegmentedControl,
    StatusPill,
    ToolBar,
    ToolFooter,
  } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { sortableList } from "$lib/actions/sortable-list";
  import { cn } from "$lib/utils";
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
  import type { StampPosition } from "./bates";
  import { BatesState } from "./helper.svelte";

  const store = new BatesState();
  const uid = $props.id();
  let addInput = $state<HTMLInputElement | null>(null);

  const numbering = [
    { value: "continue" as const, label: "Continue" },
    { value: "restart" as const, label: "Restart each file" },
  ];
  const positions: { value: StampPosition; label: string }[] = [
    { value: "top-left", label: "Top left" },
    { value: "top-center", label: "Top centre" },
    { value: "top-right", label: "Top right" },
    { value: "bottom-left", label: "Bottom left" },
    { value: "bottom-center", label: "Bottom centre" },
    { value: "bottom-right", label: "Bottom right" },
  ];
  const field =
    "h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring";

  const ranges = $derived(store.ranges);
  const sample = $derived(store.label(store.options.start));
  const doneCount = $derived(store.doneFiles.length);
  const showResult = $derived(!store.isProcessing && doneCount > 0);
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const sort = {
    onReorder: (from: number, to: number) => store.moveFile(from, to),
    options: { handle: ".drag-handle", animation: 200, ghostClass: "opacity-40", dragClass: "cursor-grabbing" },
  };
</script>

{#if store.files.length === 0}
  <UploadArea accept=".pdf,application/pdf" onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop PDFs to add Bates numbers</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Stamp every page with a unique number, like ABC000001, across one file or a whole set.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-4">
    {#if showResult}
      <ResultCard
        title={`Numbered ${plural(store.totalPages, "page")}`}
        description={doneCount === 1
          ? "The numbered file is downloaded."
          : `${doneCount} numbered files are downloaded as one ZIP.`}
      >
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadResults()}>
            <Download />
            Download again
          </Button>
          <Button variant="ghost" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="bates-numbering" />
      </ResultCard>
    {/if}

    <ToolBar
      label="Files"
      count={store.files.length}
      meta={`${plural(store.totalPages, "page")} · ${formatBytes(store.totalSize)}`}
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

    <p class="text-body text-muted-foreground">Numbers run top to bottom. Drag a row or use the arrows to change the order.</p>

    <div class="flex flex-col gap-2" use:sortableList={sort}>
      {#each store.files as file, i (file.id)}
        <div class="flex items-center gap-3 rounded-xl border border-border bg-card py-2 pl-1 pr-2">
          <div class="flex items-center">
            <span
              class="drag-handle grid size-9 cursor-grab place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
              aria-hidden="true"
            >
              <GripVertical class="size-4" />
            </span>
            <span class="grid size-8 place-items-center rounded-lg bg-muted text-body font-medium tabular-nums text-foreground">
              {i + 1}
            </span>
          </div>

          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="truncate text-body font-medium text-foreground" title={file.file.name}>{file.file.name}</span>
            <span class="truncate text-caption tabular-nums text-muted-foreground">
              {plural(file.pageCount, "page")} ·
              {#if file.stamped}
                <span class="font-medium text-foreground">{file.stamped}</span>
              {:else if ranges[i] && file.pageCount > 0}
                {store.label(ranges[i].first)} to {store.label(ranges[i].last)}
              {/if}
            </span>
          </div>

          <div class="flex shrink-0 items-center gap-1">
            {#if file.status === "processing"}
              <StatusPill status="processing" label="Stamping" />
            {:else if file.status === "done"}
              <StatusPill status="done" />
              <Button
                variant="ghost"
                size="icon-sm"
                class="text-muted-foreground hover:text-foreground"
                aria-label={`Download numbered ${file.file.name}`}
                onclick={() => store.downloadOne(file.id)}
              >
                <Download class="size-4" />
              </Button>
            {:else if file.status === "error"}
              <StatusPill status="error" label={file.error || "Failed"} />
            {/if}
            <Button
              variant="ghost"
              size="icon-sm"
              class="hidden text-muted-foreground sm:inline-flex"
              disabled={i === 0 || store.isProcessing}
              onclick={() => store.moveFile(i, i - 1)}
              aria-label={`Move ${file.file.name} up`}
            >
              <ArrowUp class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              class="hidden text-muted-foreground sm:inline-flex"
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

  <WorkspaceInspector title="Bates numbers">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Number" description={store.textIssue ?? `First page reads ${sample}${store.options.date ? `  ${store.options.date}` : ""}`}>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label for="{uid}-prefix" class="text-caption text-muted-foreground">Prefix</label>
            <input
              id="{uid}-prefix"
              type="text"
              bind:value={store.settings.prefix}
              placeholder="None"
              class={cn(field, store.textIssue && "border-destructive")}
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="{uid}-suffix" class="text-caption text-muted-foreground">Suffix</label>
            <input
              id="{uid}-suffix"
              type="text"
              bind:value={store.settings.suffix}
              placeholder="None"
              class={cn(field, store.textIssue && "border-destructive")}
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="{uid}-start" class="text-caption text-muted-foreground">Start at</label>
            <input id="{uid}-start" type="number" min="0" bind:value={store.settings.start} class={field} />
          </div>
          <div class="flex flex-col gap-1">
            <label for="{uid}-digits" class="text-caption text-muted-foreground">Digits</label>
            <input id="{uid}-digits" type="number" min="1" max="12" bind:value={store.settings.digits} class={field} />
          </div>
        </div>
      </OptionGroup>

      <OptionGroup
        label="Across files"
        description={store.settings.continueAcrossFiles
          ? "The next file picks up where the last one ended."
          : "Every file starts again from the first number."}
      >
        <SegmentedControl
          name="{uid}-numbering"
          options={numbering}
          value={store.settings.continueAcrossFiles ? "continue" : "restart"}
          onchange={(v) => (store.settings.continueAcrossFiles = v === "continue")}
        />
      </OptionGroup>

      <OptionGroup label="Position">
        <div
          class="mx-auto grid aspect-[3/4] w-full max-w-40 grid-cols-3 grid-rows-[auto_1fr_auto] gap-1 rounded-lg border border-border bg-background p-1.5"
          role="radiogroup"
          aria-label="Position on the page"
        >
          {#each positions as pos, i (pos.value)}
            {@const active = store.settings.position === pos.value}
            <label
              class={cn(
                "grid h-9 cursor-pointer place-items-center rounded-md transition-colors hover:bg-muted has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                i >= 3 && "row-start-3"
              )}
              title={pos.label}
            >
              <input
                type="radio"
                name="{uid}-position"
                value={pos.value}
                bind:group={store.settings.position}
                class="sr-only"
                aria-label={pos.label}
              />
              <span class={cn("h-1.5 w-8 rounded-full", active ? "bg-primary" : "bg-border")}></span>
            </label>
          {/each}
        </div>
        <p class="text-center text-caption text-muted-foreground">
          {positions.find((p) => p.value === store.settings.position)?.label}
        </p>
      </OptionGroup>

      <OptionGroup label="Size and spacing" description="In points. 72 points make an inch.">
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label for="{uid}-size" class="text-caption text-muted-foreground">Text size</label>
            <input id="{uid}-size" type="number" min="6" max="36" bind:value={store.settings.fontSize} class={field} />
          </div>
          <div class="flex flex-col gap-1">
            <label for="{uid}-margin" class="text-caption text-muted-foreground">Distance from edge</label>
            <input id="{uid}-margin" type="number" min="0" max="144" bind:value={store.settings.margin} class={field} />
          </div>
        </div>
      </OptionGroup>

      <OptionGroup label="Extras">
        <div class="-my-2.5 flex flex-col divide-y divide-border">
          <OptionToggle
            label="Add today's date"
            description="Printed after the number"
            bind:checked={store.settings.includeDate}
          />
        </div>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if store.textIssue}
        <span class="block truncate text-destructive">{store.textIssue}.</span>
      {:else if store.totalPages > 0 && ranges.length > 0}
        <span class="block truncate tabular-nums">
          {plural(store.files.length, "file")} · {store.label(ranges[0].first)} to {store.label(
            store.settings.continueAcrossFiles ? ranges[ranges.length - 1].last : Math.max(...ranges.map((r) => r.last))
          )}
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={!store.canRun}>
      {store.isProcessing ? "Stamping…" : `Stamp ${plural(store.files.length, "file")}`}
    </Button>
  </ToolFooter>
{/if}
