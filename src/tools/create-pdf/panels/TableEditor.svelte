<script lang="ts">
  import { Button } from "$components/ui/button";
  import { IconClipboardText as Paste, IconColumnInsertRight as AddColumn, IconRowInsertBottom as AddRow, IconX as X } from "@tabler/icons-svelte";

  type Props = {
    columns: string[];
    rows: string[][];
    onchange: (next: { columns: string[]; rows: string[][] }) => void;
  };

  let { columns, rows, onchange }: Props = $props();

  let pasting = $state(false);
  let pasted = $state("");

  const normalized = $derived(rows.map((row) => columns.map((_, i) => row[i] ?? "")));

  function setCell(r: number, c: number, value: string) {
    onchange({ columns, rows: normalized.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? value : cell)) : row)) });
  }

  function applyPaste() {
    const lines = pasted.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return;
    const split = (line: string) => (line.includes("\t") ? line.split("\t") : line.split(",")).map((cell) => cell.trim());
    const [head, ...body] = lines.map(split);
    const width = Math.max(...lines.map((l) => split(l).length));
    const pad = (row: string[]) => Array.from({ length: width }, (_, i) => row[i] ?? "");
    onchange({ columns: pad(head), rows: body.map(pad) });
    pasted = "";
    pasting = false;
  }

  const cellClass =
    "h-9 w-full min-w-24 rounded-md border border-transparent bg-transparent px-2 text-body text-foreground outline-none transition-colors hover:border-border focus:border-ring focus:bg-background";
</script>

<div class="flex flex-col gap-3">
  <div class="scrollbar-subtle -mx-1 overflow-x-auto px-1">
    <table class="w-full border-separate border-spacing-0 text-body">
      <thead>
        <tr>
          {#each columns as column, c (c)}
            <th class="border-b border-border p-0.5 text-left font-medium">
              <div class="flex items-center">
                <input
                  class="{cellClass} font-medium"
                  value={column}
                  aria-label={`Column ${c + 1} name`}
                  oninput={(e) => onchange({ columns: columns.map((x, i) => (i === c ? e.currentTarget.value : x)), rows: normalized })}
                />
                {#if columns.length > 1}
                  <button
                    type="button"
                    class="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Remove column ${column || c + 1}`}
                    onclick={() => onchange({ columns: columns.filter((_, i) => i !== c), rows: normalized.map((row) => row.filter((_, i) => i !== c)) })}
                  >
                    <X class="size-3.5" />
                  </button>
                {/if}
              </div>
            </th>
          {/each}
          <th class="w-9 border-b border-border"></th>
        </tr>
      </thead>
      <tbody>
        {#each normalized as row, r (r)}
          <tr>
            {#each row as cell, c (c)}
              <td class="border-b border-border p-0.5">
                <input class={cellClass} value={cell} aria-label={`Row ${r + 1}, ${columns[c] || `column ${c + 1}`}`} oninput={(e) => setCell(r, c, e.currentTarget.value)} />
              </td>
            {/each}
            <td class="border-b border-border p-0.5">
              <button
                type="button"
                class="grid size-9 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Remove row ${r + 1}`}
                onclick={() => onchange({ columns, rows: normalized.filter((_, i) => i !== r) })}
              >
                <X class="size-4" />
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="flex flex-wrap gap-2">
    <Button variant="outline" size="sm" onclick={() => onchange({ columns, rows: [...normalized, columns.map(() => "")] })}>
      <AddRow />
      Row
    </Button>
    <Button variant="outline" size="sm" onclick={() => onchange({ columns: [...columns, `Column ${columns.length + 1}`], rows: normalized.map((row) => [...row, ""]) })}>
      <AddColumn />
      Column
    </Button>
    <Button variant="ghost" size="sm" aria-expanded={pasting} onclick={() => (pasting = !pasting)}>
      <Paste />
      Paste
    </Button>
  </div>

  {#if pasting}
    <div class="flex flex-col gap-2">
      <textarea
        bind:value={pasted}
        rows="5"
        placeholder={"Item\tQty\tPrice\nDesign\t1\t$400"}
        aria-label="Rows copied from a spreadsheet"
        class="w-full rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-caption leading-relaxed text-foreground outline-none placeholder:text-placeholder focus:border-ring"
      ></textarea>
      <p class="text-caption text-muted-foreground">Copy cells from a spreadsheet or CSV. The first line becomes the header.</p>
      <Button size="sm" class="self-start" disabled={!pasted.trim()} onclick={applyPaste}>Replace table</Button>
    </div>
  {/if}
</div>
