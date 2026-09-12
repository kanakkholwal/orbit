<script lang="ts">
  import {
    FileRow,
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
  import { Checkbox } from "$components/ui/checkbox";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import {
    IconDownload as Download,
    IconEye as Eye,
    IconPlus as Plus,
    IconRefresh as Refresh,
    IconTable as TableIcon,
  } from "@tabler/icons-svelte";
  import { columnLetter, WIDE_SHEET_COLUMNS } from "./build";
  import {
    ACCEPTED_FORMATS,
    ExcelToPdfState,
    LARGE_SHEET_ROWS,
    type Orientation,
    type PageSize,
    type TextSize,
  } from "./helper.svelte";

  const store = new ExcelToPdfState();
  const uid = $props.id();
  let addInput = $state<HTMLInputElement | null>(null);

  const sizes: { value: PageSize; label: string }[] = [
    { value: "A4", label: "A4" },
    { value: "Letter", label: "Letter" },
    { value: "Legal", label: "Legal" },
  ];

  const orientations: { value: Orientation; label: string }[] = [
    { value: "auto", label: "Auto" },
    { value: "portrait", label: "Portrait" },
    { value: "landscape", label: "Landscape" },
  ];

  const textSizes: { value: TextSize; label: string }[] = [
    { value: "normal", label: "Normal" },
    { value: "small", label: "Small" },
  ];

  const plural = (n: number, word: string) => `${n.toLocaleString()} ${n === 1 ? word : `${word}s`}`;

  const ready = $derived(store.convertible);
  const reading = $derived(store.files.some((f) => f.status === "reading"));
  const sheetCount = $derived(store.selectedSheets.length);
  const widest = $derived(store.selectedSheets.reduce((max, s) => Math.max(max, s.columns), 0));
  const largest = $derived(store.selectedSheets.reduce((max, s) => Math.max(max, s.rowCount), 0));
  const current = $derived(store.previewSheet);
  const showResult = $derived(!store.isProcessing && store.doneFiles.length > 0);
  const totalPages = $derived(store.doneFiles.reduce((sum, f) => sum + (f.pages ?? 0), 0));

  const previewHeader = $derived.by(() => {
    if (!current) return [];
    const { sheet } = current;
    return store.settings.header && sheet.preview[0]
      ? sheet.preview[0]
      : Array.from({ length: sheet.columns }, (_, c) => columnLetter(c));
  });
  const previewRows = $derived.by(() => {
    if (!current) return [];
    const rows = current.sheet.preview;
    return store.settings.header ? rows.slice(1) : rows.slice(0, 8);
  });
  const dataRows = $derived(current ? current.sheet.rowCount - (store.settings.header ? 1 : 0) : 0);

  const runLabel = $derived(
    store.isProcessing
      ? "Making PDF…"
      : ready.length > 1
        ? `Convert ${ready.length} files`
        : "Convert to PDF"
  );
</script>

{#if store.files.length === 0}
  <UploadArea accept={ACCEPTED_FORMATS} onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet icon()}
      <TableIcon class="size-6" stroke={1.75} />
    {/snippet}
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop spreadsheets to turn into PDF</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Excel, CSV and OpenDocument sheets become clean, printable tables. They never leave this device.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard
        title={store.doneFiles.length === 1 ? `Made a ${plural(totalPages, "page")} PDF` : `Made ${store.doneFiles.length} PDFs`}
        description={store.doneFiles.length === 1
          ? `${store.doneFiles[0].file.name.replace(/\.[^/.]+$/, "")}.pdf is downloaded.`
          : `${plural(totalPages, "page")} in total, downloaded as a ZIP.`}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="excel-to-pdf" />
      </ResultCard>
    {/if}

    <ToolBar
      label="Spreadsheets"
      count={store.files.length}
      meta={formatBytes(store.totalSize)}
      onReset={store.isProcessing ? undefined : () => store.reset()}
      resetLabel="Clear all"
    >
      {#snippet actions()}
        <Button variant="outline" size="sm" disabled={store.isProcessing} onclick={() => addInput?.click()}>
          <Plus />
          <span class="hidden sm:inline">Add files</span>
          <span class="sr-only sm:hidden">Add files</span>
        </Button>
      {/snippet}
    </ToolBar>

    <ul class="flex flex-col gap-3">
      {#each store.files as file (file.id)}
        <li class="flex flex-col gap-1">
          <FileRow
            name={file.file.name}
            icon={TableIcon}
            onRemove={store.isProcessing ? undefined : () => store.removeFile(file.id)}
          >
            <span>{formatBytes(file.file.size)}</span>
            {#if file.status !== "reading" && file.sheets.length > 0}
              <span>· {plural(file.sheets.length, "sheet")}</span>
            {/if}
            {#if file.status === "done" && file.pages}
              <span class="font-medium text-foreground">· {plural(file.pages, "page")}</span>
            {/if}

            {#snippet trailing()}
              {#if file.status === "reading"}
                <StatusPill status="processing" label="Reading" />
              {:else if file.status === "processing"}
                <StatusPill status="processing" label="Converting" />
              {:else if file.status === "done"}
                <StatusPill status="done" />
              {:else if file.status === "error"}
                <StatusPill status="error" label={file.error || "Failed"} />
              {/if}
            {/snippet}
          </FileRow>

          {#if file.sheets.some((s) => s.columns > 0)}
            <ul class="flex flex-col pl-3 sm:pl-14" aria-label={`Sheets in ${file.file.name}`}>
              {#each file.sheets as sheet, i (i)}
                {@const id = `${uid}-${file.id}-${i}`}
                {@const previewing = store.preview?.fileId === file.id && store.preview.sheet === i}
                {#if sheet.columns > 0}
                  <li class="flex h-9 items-center gap-3 rounded-lg pl-1">
                    <Checkbox {id} bind:checked={sheet.selected} disabled={store.isProcessing} />
                    <label for={id} class="flex min-w-0 flex-1 cursor-pointer items-baseline gap-2">
                      <span class="truncate text-body text-foreground">{sheet.name}</span>
                      <span class="shrink-0 text-caption tabular-nums text-muted-foreground">
                        {plural(sheet.rowCount, "row")} · {plural(sheet.columns, "column")}
                      </span>
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-pressed={previewing}
                      class={cn(previewing ? "bg-muted text-foreground" : "text-muted-foreground")}
                      onclick={() => (store.preview = { fileId: file.id, sheet: i })}
                    >
                      <Eye />
                      <span class="hidden sm:inline">Preview</span>
                      <span class="sr-only sm:hidden">Preview {sheet.name}</span>
                    </Button>
                  </li>
                {/if}
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>

    {#if current}
      <section class="flex flex-col gap-2.5 pt-2" aria-labelledby="{uid}-preview">
        <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 id="{uid}-preview" class="truncate text-body font-medium text-foreground">
            Preview · {current.sheet.name}
          </h2>
          <span class="text-caption tabular-nums text-muted-foreground">
            First {Math.min(previewRows.length, dataRows).toLocaleString()} of {plural(Math.max(dataRows, 0), "row")}
          </span>
        </div>

        {#if current.sheet.columns > WIDE_SHEET_COLUMNS}
          <p class="text-body text-muted-foreground">
            This sheet has {current.sheet.columns} columns. Landscape and small text help them fit across the page.
          </p>
        {/if}

        <div class="overflow-x-auto rounded-xl border border-border bg-card">
          <table class="w-full border-collapse text-left text-caption">
            <thead>
              <tr class="border-b border-foreground/70">
                {#each previewHeader as heading, c (c)}
                  <th
                    scope="col"
                    class={cn(
                      "max-w-56 truncate px-3 py-2 font-medium whitespace-nowrap",
                      store.settings.header ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {heading}
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each previewRows as row, r (r)}
                <tr class={cn("border-b border-border last:border-b-0", store.settings.striped && r % 2 === 1 && "bg-muted")}>
                  {#each previewHeader as _, c (c)}
                    <td class="max-w-56 truncate px-3 py-2 whitespace-nowrap text-foreground">{row[c] ?? ""}</td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {/if}

    <input
      bind:this={addInput}
      type="file"
      accept={ACCEPTED_FORMATS}
      multiple
      class="hidden"
      onchange={(e) => {
        const picked = Array.from(e.currentTarget.files ?? []);
        if (picked.length > 0) store.addFiles(picked);
        e.currentTarget.value = "";
      }}
    />
  </div>

  <WorkspaceInspector title="Table">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Layout">
        <div class="-my-2.5 flex flex-col divide-y divide-border">
          <OptionToggle
            label="First row is a header"
            description={store.settings.header ? "Repeats at the top of every page" : "Columns are labelled A, B, C"}
            bind:checked={store.settings.header}
          />
          <OptionToggle label="Sheet names as titles" description="A heading above each table" bind:checked={store.settings.titles} />
          <OptionToggle label="Striped rows" description="Shade every other row" bind:checked={store.settings.striped} />
        </div>
      </OptionGroup>

      <OptionGroup label="Paper size">
        <SegmentedControl name="{uid}-size" options={sizes} bind:value={store.settings.size} />
      </OptionGroup>

      <OptionGroup
        label="Orientation"
        description={widest > WIDE_SHEET_COLUMNS && store.settings.orientation === "portrait"
          ? `A sheet has ${widest} columns. Landscape gives them more room.`
          : "Auto turns the page sideways when a sheet is too wide."}
      >
        <SegmentedControl name="{uid}-orientation" options={orientations} bind:value={store.settings.orientation} />
      </OptionGroup>

      <OptionGroup
        label="Text size"
        description={widest > WIDE_SHEET_COLUMNS && store.settings.textSize === "normal"
          ? "Small fits many columns better."
          : "Small fits more rows and columns on each page."}
      >
        <SegmentedControl name="{uid}-text" options={textSizes} bind:value={store.settings.textSize} />
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if reading}
        <span class="block truncate">Reading spreadsheets…</span>
      {:else if sheetCount > 0}
        <span class="block truncate">
          {plural(sheetCount, "sheet")} ready{largest > LARGE_SHEET_ROWS ? " · large sheets take a little longer" : ""}
        </span>
      {:else}
        <span class="block truncate">Choose at least one sheet</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || reading || ready.length === 0}>
      {runLabel}
    </Button>
  </ToolFooter>
{/if}
