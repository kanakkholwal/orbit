<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Checkbox } from "$components/ui/checkbox";
  import { cn } from "$lib/utils";
  import { IconArrowDown as Down, IconArrowUp as Up, IconPlus as Plus, IconX as X } from "@tabler/icons-svelte";
  import type { RowColumn } from "../model/blocks";

  type Row = Record<string, string | number | boolean> | string;

  type Props = {
    rows: Row[];
    /** Omit for a plain list of strings. */
    columns?: RowColumn[];
    itemLabel: string;
    onchange: (rows: Row[]) => void;
  };

  let { rows, columns, itemLabel, onchange }: Props = $props();

  const uid = $props.id();
  const textColumns = $derived(columns?.filter((c) => c.kind !== "check") ?? []);
  const check = $derived(columns?.find((c) => c.kind === "check"));

  function blank(): Row {
    if (!columns) return "";
    return Object.fromEntries(columns.map((c) => [c.key, c.kind === "number" ? 0 : c.kind === "check" ? false : ""]));
  }

  function set(index: number, key: string | null, value: string | number | boolean) {
    onchange(rows.map((row, i) => (i !== index ? row : key === null ? String(value) : { ...(row as Record<string, unknown>), [key]: value } as Row)));
  }

  function move(index: number, delta: -1 | 1) {
    const next = [...rows];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onchange(next);
  }

  const inputClass =
    "h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 text-body text-foreground outline-none transition-colors duration-150 placeholder:text-placeholder focus:border-ring";
</script>

<div class="flex flex-col gap-2">
  {#each rows as row, index (index)}
    <div class="group flex items-start gap-1.5">
      {#if check}
        <div class="grid h-9 place-items-center px-1">
          <Checkbox
            checked={Boolean((row as Record<string, unknown>)[check.key])}
            onCheckedChange={(value) => set(index, check.key, value === true)}
            aria-label={`${check.label}, ${itemLabel.toLowerCase()} ${index + 1}`}
          />
        </div>
      {/if}
      <div class={cn("flex min-w-0 flex-1 gap-1.5", textColumns.length > 2 && "flex-wrap")}>
        {#if !columns}
          <input class={inputClass} value={row as string} aria-label={`${itemLabel} ${index + 1}`} oninput={(e) => set(index, null, e.currentTarget.value)} />
        {:else}
          {#each textColumns as column (column.key)}
            <input
              id={`${uid}-${index}-${column.key}`}
              class={cn(inputClass, column.kind === "number" && "max-w-20 tabular-nums", textColumns.length > 2 && column.key !== textColumns[0].key && "basis-[45%]")}
              type={column.kind === "number" ? "number" : "text"}
              inputmode={column.kind === "number" ? "decimal" : undefined}
              placeholder={column.label}
              aria-label={`${column.label}, ${itemLabel.toLowerCase()} ${index + 1}`}
              value={(row as Record<string, unknown>)[column.key] as string}
              oninput={(e) => set(index, column.key, column.kind === "number" ? Number(e.currentTarget.value) || 0 : e.currentTarget.value)}
            />
          {/each}
        {/if}
      </div>
      <div class="flex shrink-0 opacity-100 transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100">
        <Button variant="ghost" size="icon-sm" aria-label={`Move ${itemLabel.toLowerCase()} ${index + 1} up`} disabled={index === 0} onclick={() => move(index, -1)}>
          <Up />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label={`Move ${itemLabel.toLowerCase()} ${index + 1} down`} disabled={index === rows.length - 1} onclick={() => move(index, 1)}>
          <Down />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label={`Remove ${itemLabel.toLowerCase()} ${index + 1}`} onclick={() => onchange(rows.filter((_, i) => i !== index))}>
          <X />
        </Button>
      </div>
    </div>
  {/each}
  <Button variant="outline" size="sm" class="self-start" onclick={() => onchange([...rows, blank()])}>
    <Plus />
    Add {itemLabel.toLowerCase()}
  </Button>
</div>
