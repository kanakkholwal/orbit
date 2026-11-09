<script lang="ts">
  import { cn } from "$lib/utils";
  import { IconChevronDown as Down, IconChevronUp as Up } from "$lib/icons";
  import { toast } from "svelte-sonner";
  import { columnLetter } from "../excel-to-pdf/build";
  import { CHUNK, ROW_HEIGHT, type SpreadsheetViewerState } from "./helper.svelte";

  let { store }: { store: SpreadsheetViewerState } = $props();

  const HEADER_H = 38;
  const NUM_W = 64;
  const OVERSCAN_ROWS = 8;
  const OVERSCAN_COLS = 2;
  const MAX_CHUNKS = 40;

  let scroller = $state<HTMLDivElement | null>(null);
  let scrollTop = $state(0);
  let scrollLeft = $state(0);
  let viewH = $state(600);
  let viewW = $state(900);
  let selected = $state<{ r: number; c: number } | null>(null);
  let arrived = $state(0);

  const chunks = new Map<number, string[][]>();
  const inflight = new Set<number>();
  let seenVersion = -1;

  const lefts = $derived.by(() => {
    const out = new Array<number>(store.cols + 1);
    out[0] = NUM_W;
    for (let c = 0; c < store.cols; c++) out[c + 1] = out[c] + (store.widths[c] ?? 120);
    return out;
  });
  const totalW = $derived(lefts[store.cols] ?? NUM_W);
  const totalH = $derived(HEADER_H + store.count * ROW_HEIGHT);

  const firstRow = $derived(Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_ROWS));
  const lastRow = $derived(Math.min(store.count, Math.ceil((scrollTop + viewH) / ROW_HEIGHT) + OVERSCAN_ROWS));

  const cols = $derived.by(() => {
    const left = scrollLeft;
    const right = scrollLeft + viewW;
    let lo = 0;
    let hi = store.cols;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (lefts[mid + 1] <= left) lo = mid + 1;
      else hi = mid;
    }
    const start = Math.max(0, lo - OVERSCAN_COLS);
    let end = lo;
    while (end < store.cols && lefts[end] < right) end++;
    return { start, end: Math.min(store.cols, end + OVERSCAN_COLS) };
  });

  const rowIndexes = $derived.by(() => {
    const out: number[] = [];
    for (let r = firstRow; r < lastRow; r++) out.push(r);
    return out;
  });

  const colIndexes = $derived.by(() => {
    const out: number[] = [];
    for (let c = cols.start; c < cols.end; c++) out.push(c);
    return out;
  });

  function cell(r: number, c: number): string | undefined {
    void arrived;
    const rows = chunks.get(Math.floor(r / CHUNK));
    if (!rows) return undefined;
    return rows[r % CHUNK]?.[c] ?? "";
  }

  $effect(() => {
    if (store.version !== seenVersion) {
      seenVersion = store.version;
      chunks.clear();
      inflight.clear();
      selected = null;
      if (scroller) scroller.scrollTop = 0;
    }
    if (store.status !== "ready" || store.count === 0) return;
    const from = Math.floor(firstRow / CHUNK);
    const to = Math.floor(Math.max(firstRow, lastRow - 1) / CHUNK);
    const version = store.version;
    for (let chunk = from; chunk <= to; chunk++) {
      if (chunks.has(chunk) || inflight.has(chunk)) continue;
      inflight.add(chunk);
      store.fetchRows(chunk * CHUNK, (chunk + 1) * CHUNK).then((rows) => {
        if (version !== store.version) return;
        inflight.delete(chunk);
        chunks.set(chunk, rows);
        if (chunks.size > MAX_CHUNKS) {
          const far = [...chunks.keys()].sort((a, b) => Math.abs(b - from) - Math.abs(a - from))[0];
          chunks.delete(far);
        }
        arrived += 1;
      });
    }
  });

  let frame = 0;
  function onScroll(event: Event) {
    const el = event.currentTarget as HTMLDivElement;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      scrollTop = el.scrollTop;
      scrollLeft = el.scrollLeft;
    });
  }

  const numeric = (value: string) => /^[-+]?[\d.,]+%?$/.test(value);

  async function onKeydown(event: KeyboardEvent) {
    if (!selected) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
      const value = cell(selected.r, selected.c) ?? "";
      await navigator.clipboard.writeText(value);
      toast.success("Cell copied");
    }
  }

  const headerText = (c: number) => (store.headerRow ? store.headerRow[c] || columnLetter(c) : columnLetter(c));
</script>

<div
  bind:this={scroller}
  bind:clientHeight={viewH}
  bind:clientWidth={viewW}
  onscroll={onScroll}
  onkeydown={onKeydown}
  tabindex="0"
  role="grid"
  aria-rowcount={store.count}
  aria-colcount={store.cols}
  aria-label="Spreadsheet preview"
  class="scrollbar-subtle relative h-full min-h-0 overflow-auto overscroll-contain rounded-xl border border-border bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
>
  <div class="relative" style:width="{totalW}px" style:height="{totalH}px">
    <div class="sticky top-0 z-20 border-b border-border bg-card" style:height="{HEADER_H}px" style:width="{totalW}px">
      <div
        class="sticky left-0 z-10 float-left grid h-full place-items-center border-r border-border bg-card text-xs text-muted-foreground"
        style:width="{NUM_W}px"
      >
        #
      </div>
      {#each colIndexes as c (c)}
        {@const active = store.sort?.col === c}
        <button
          type="button"
          role="columnheader"
          onclick={() => store.toggleSort(c)}
          title={`Sort by ${headerText(c)}`}
          class={cn(
            "absolute top-0 flex h-full items-center gap-1.5 border-r border-border px-3 text-left text-xs font-medium outline-none transition-colors duration-(--duration-fast) hover:bg-foreground/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            active ? "text-foreground" : "text-muted-foreground"
          )}
          style:left="{lefts[c]}px"
          style:width="{store.widths[c] ?? 120}px"
        >
          <span class="truncate">{headerText(c)}</span>
          {#if active}
            {#if store.sort?.dir === 1}<Up class="size-3.5 shrink-0 text-primary" />{:else}<Down class="size-3.5 shrink-0 text-primary" />{/if}
          {/if}
        </button>
      {/each}
    </div>

    {#each rowIndexes as r (r)}
      <div
        role="row"
        aria-rowindex={r + 1}
        class={cn("group absolute left-0 border-b border-border/60", r % 2 === 1 && "bg-foreground/[0.02]")}
        style:top="{HEADER_H + r * ROW_HEIGHT}px"
        style:height="{ROW_HEIGHT}px"
        style:width="{totalW}px"
      >
        <div
          class="sticky left-0 z-10 float-left flex h-full items-center justify-end border-r border-border bg-background px-3 text-xs tabular-nums text-muted-foreground group-hover:bg-muted"
          style:width="{NUM_W}px"
        >
          {r + 1}
        </div>
        {#each colIndexes as c (c)}
          {@const value = cell(r, c)}
          <div
            role="gridcell"
            tabindex="-1"
            onclick={() => (selected = { r, c })}
            onkeydown={() => {}}
            class={cn(
              "absolute top-0 flex h-full items-center border-r border-border/60 px-3 text-sm group-hover:bg-foreground/[0.04]",
              value !== undefined && numeric(value) && "justify-end tabular-nums",
              selected?.r === r && selected?.c === c && "z-[1] ring-2 ring-inset ring-primary"
            )}
            style:left="{lefts[c]}px"
            style:width="{store.widths[c] ?? 120}px"
          >
            {#if value === undefined}
              <span class="h-3 w-2/3 rounded bg-foreground/[0.06]"></span>
            {:else}
              <span class="truncate" title={value}>{value}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
