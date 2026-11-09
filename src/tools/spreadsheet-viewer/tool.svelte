<script lang="ts">
  import { Badge } from "$components/ui/badge";
  import { Button } from "$components/ui/button";
  import { InputGroup, InputGroupAddon, InputGroupInput } from "$components/ui/input-group";
  import { Spinner } from "$components/ui/spinner";
  import { Switch } from "$components/ui/switch";
  import { ToggleGroup, ToggleGroupItem } from "$components/ui/toggle-group";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { IconDownload as Download, IconSearch as Search, IconX as X } from "$lib/icons";
  import { formatBytes } from "$utils/helper";
  import { onDestroy } from "svelte";
  import Grid from "./Grid.svelte";
  import { ACCEPTED_FORMATS, SpreadsheetViewerState } from "./helper.svelte";

  const store = new SpreadsheetViewerState();
  onDestroy(() => store.destroy());

  const visibleSheets = $derived(store.sheets.map((s, i) => ({ ...s, i })).filter((s) => !s.hidden && s.cols > 0));
  const fmt = (n: number) => n.toLocaleString();
</script>

{#if store.status === "idle" || store.status === "error"}
  <UploadArea accept={ACCEPTED_FORMATS} multiple={false} onFilesSelected={(files) => store.open(files[0])}>
    {#snippet title()}
      <h3 class="text-2xl font-medium text-foreground">Drop a spreadsheet to preview</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-sm text-muted-foreground">
        CSV, TSV, Excel and OpenDocument files open in a fast grid. Tens of thousands of rows scroll smoothly.
      </p>
    {/snippet}
  </UploadArea>
  {#if store.error}
    <p class="mx-auto mt-4 max-w-3xl text-center text-sm text-destructive" role="alert">{store.error}</p>
  {/if}
{:else}
  <div class="flex h-[calc(100dvh-9rem)] min-h-96 flex-col gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <div class="flex min-w-0 items-baseline gap-2 pr-2">
        <h2 class="truncate text-sm font-medium text-foreground" title={store.fileName}>{store.fileName}</h2>
        <span class="shrink-0 text-xs tabular-nums text-muted-foreground">{formatBytes(store.fileSize)}</span>
      </div>

      <div class="w-full sm:ml-auto sm:w-64">
        <InputGroup>
          <InputGroupAddon><Search /></InputGroupAddon>
          <InputGroupInput
            type="search"
            value={store.query}
            oninput={(e) => store.setQuery(e.currentTarget.value)}
            placeholder="Search rows"
            aria-label="Search rows"
          />
        </InputGroup>
      </div>

      <label class="flex items-center gap-2 text-sm text-muted-foreground">
        <Switch checked={store.header} onCheckedChange={(v) => store.setHeader(v)} aria-label="First row is a header" />
        Header row
      </label>

      <Button variant="outline" size="sm" onclick={() => store.exportCsv()} disabled={store.status !== "ready"}>
        <Download />
        Export CSV
      </Button>
      <Button variant="ghost" size="sm" onclick={() => store.reset()}>
        <X />
        Close
      </Button>
    </div>

    {#if visibleSheets.length > 1}
      <div class="no-scrollbar -mx-1 overflow-x-auto px-1">
        <ToggleGroup
          type="single"
          variant="chip"
          size="sm"
          label="Sheets"
          value={String(store.sheet)}
          onValueChange={(v) => typeof v === "string" && v && store.selectSheet(Number(v))}
          class="flex-nowrap"
        >
          {#each visibleSheets as sheet (sheet.i)}
            <ToggleGroupItem value={String(sheet.i)}>
              {sheet.name}
              <span class="tabular-nums text-muted-foreground">{fmt(sheet.rows)}</span>
            </ToggleGroupItem>
          {/each}
        </ToggleGroup>
      </div>
    {/if}

    <div class="relative min-h-0 flex-1">
      {#if store.status === "reading"}
        <div class="absolute inset-0 z-30 grid place-items-center rounded-xl border border-border bg-background/80">
          <span class="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> Reading {store.fileName}</span>
        </div>
      {/if}
      {#if store.status === "ready" && store.count === 0}
        <div class="grid h-full place-items-center rounded-xl border border-dashed border-border-strong text-sm text-muted-foreground">
          {store.query ? `No rows match “${store.query}”.` : "This sheet has no rows."}
        </div>
      {:else}
        <Grid {store} />
      {/if}
    </div>

    <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="secondary">{fmt(store.count)} {store.count === 1 ? "row" : "rows"}</Badge>
      <Badge variant="secondary">{fmt(store.cols)} {store.cols === 1 ? "column" : "columns"}</Badge>
      <span>Stays on this device. Click a header to sort, click a cell and press Ctrl C to copy it.</span>
    </div>
  </div>
{/if}
