<script lang="ts">
  import {
    ChoiceList,
    FileRow,
    OptionGroup,
    ProgressLine,
    ResultCard,
    SegmentedControl,
    ToolFooter,
  } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import type { Binding, BlankPlacement, SheetSide, SheetSize } from "./booklet";
  import { BookletState } from "./helper.svelte";

  const store = new BookletState();
  const uid = $props.id();

  const PREVIEW_SHEETS = 8;
  const sizes: { value: SheetSize; label: string; hint: string }[] = [
    { value: "a4", label: "A4", hint: "Folds to A5, common outside North America" },
    { value: "letter", label: "US Letter", hint: "Folds to half letter" },
    { value: "double", label: "Twice the page width", hint: "Keeps pages at their original size" },
  ];
  const bindings: { value: Binding; label: string }[] = [
    { value: "left", label: "Left" },
    { value: "right", label: "Right" },
  ];
  const blankChoices: { value: BlankPlacement; label: string; hint: string }[] = [
    { value: "end", label: "At the end", hint: "Blank pages go after your last page" },
    { value: "before-back-cover", label: "Before the back cover", hint: "Your last page stays on the back" },
  ];

  const sheets = $derived(store.sheets);
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
  const sheetLabel = (n: number) => `${n} ${n === 1 ? "sheet" : "sheets"}`;
  const halfText = (index: number | null) => (index === null ? "Blank" : String(index + 1));
  const sideText = (side: SheetSide) => `${halfText(side.left)} and ${halfText(side.right)}`;
</script>

{#snippet half(index: number | null)}
  <span
    class={cn(
      "grid place-items-center text-caption font-medium tabular-nums",
      index === null ? "bg-muted text-muted-foreground" : "bg-card text-foreground"
    )}
  >
    {halfText(index)}
  </span>
{/snippet}

{#snippet side(label: string, value: SheetSide)}
  <div class="flex flex-col gap-1">
    <span class="text-caption text-muted-foreground">{label}</span>
    <div
      class="grid aspect-[1.414/1] grid-cols-2 divide-x divide-dashed divide-border overflow-hidden rounded-md border border-border"
      role="img"
      aria-label={`${label}: pages ${sideText(value)}`}
    >
      {@render half(value.left)}
      {@render half(value.right)}
    </div>
  </div>
{/snippet}

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to make a booklet</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Pages are arranged two to a sheet, so you can print, fold in half and staple.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard
        title={`Booklet ready on ${sheetLabel(store.result.sheets)}`}
        description={`${store.result.name} is downloaded. Print double-sided and flip on the short edge.`}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="pdf-booklet" />
      </ResultCard>
    {/if}

    <FileRow
      name={store.file.name}
      meta={`${formatBytes(store.file.size)} · ${pageLabel(store.pageCount)}`}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    <p class="text-body text-muted-foreground">
      Print double-sided and flip on the short edge. Keep the sheets in order, fold the stack in half and staple along the fold.
    </p>

    <section aria-labelledby="{uid}-sheets" class="flex flex-col gap-3 rounded-2xl border border-border bg-muted px-4 py-4">
      <div class="flex items-baseline justify-between gap-3">
        <h3 id="{uid}-sheets" class="text-body font-medium text-foreground">Sheet order</h3>
        <span class="text-caption tabular-nums text-muted-foreground">
          {sheetLabel(sheets.length)}{store.blankCount > 0 ? ` · ${store.blankCount} blank ${store.blankCount === 1 ? "page" : "pages"} added` : ""}
        </span>
      </div>
      <ol class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {#each sheets.slice(0, PREVIEW_SHEETS) as sheet, i (i)}
          <li class="flex flex-col gap-2 rounded-xl border border-border bg-background p-3">
            <span class="text-body font-medium text-foreground">Sheet {i + 1}</span>
            <div class="grid grid-cols-2 gap-3">
              {@render side("Front", sheet.front)}
              {@render side("Back", sheet.back)}
            </div>
          </li>
        {/each}
      </ol>
      {#if sheets.length > PREVIEW_SHEETS}
        <p class="text-caption text-muted-foreground">and {sheetLabel(sheets.length - PREVIEW_SHEETS)} more in the same pattern.</p>
      {/if}
    </section>
  </div>

  <WorkspaceInspector title="Booklet">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Paper">
        <ChoiceList name="{uid}-size" choices={sizes} bind:value={store.sheetSize} />
      </OptionGroup>

      <OptionGroup
        label="Binding"
        description={store.binding === "left"
          ? "The fold is on the left, like most books."
          : "The fold is on the right, for Arabic, Hebrew, Japanese and other right-to-left books."}
      >
        <SegmentedControl name="{uid}-binding" options={bindings} bind:value={store.binding} />
      </OptionGroup>

      <OptionGroup
        label="Blank pages"
        description={store.blankCount > 0
          ? `A booklet needs a page count divisible by 4, so ${store.blankCount} blank ${store.blankCount === 1 ? "page is" : "pages are"} added.`
          : "Your page count already fits, so no blank pages are needed."}
      >
        <ChoiceList name="{uid}-blanks" choices={blankChoices} bind:value={store.blanks} />
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else}
        <span class="block truncate tabular-nums">
          {pageLabel(store.pageCount)} on {sheetLabel(sheets.length)} · {sheets.length * 2} printed sides
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={!store.canRun}>
      {store.isProcessing ? "Making booklet…" : "Make booklet"}
    </Button>
  </ToolFooter>
{/if}
