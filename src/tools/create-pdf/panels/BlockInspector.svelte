<script lang="ts">
  import SegmentedControl from "$components/tool/SegmentedControl.svelte";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import * as Select from "$components/ui/select";
  import { Switch } from "$components/ui/switch";
  import { Textarea } from "$components/ui/textarea";
  import { IconArrowDown as Down, IconArrowUp as Up, IconCopy as Copy, IconTrash as Trash } from "@tabler/icons-svelte";
  import { BLOCK_ICONS } from "../icons";
  import { type Field, getBlockDefinition } from "../model/blocks";
  import type { Block } from "../model/types";
  import type { CreatorState } from "../state.svelte";
  import ImageField from "./ImageField.svelte";
  import RowsEditor from "./RowsEditor.svelte";
  import SignaturePad from "./SignaturePad.svelte";
  import TableEditor from "./TableEditor.svelte";

  type Props = { studio: CreatorState; block: Block };

  let { studio, block }: Props = $props();

  const uid = $props.id();
  const definition = $derived(getBlockDefinition(block.type));
  const Icon = $derived(BLOCK_ICONS[block.type]);
  const values = $derived(block.props as Record<string, unknown>);
  const index = $derived(studio.doc?.blocks.findIndex((b) => b.id === block.id) ?? -1);
  const count = $derived(studio.doc?.blocks.length ?? 0);

  const set = (key: string, value: unknown, tag = `field:${block.id}:${key}`) => studio.updateProps(block.id, { [key]: value } as never, tag);
  const id = (field: Field) => `${uid}-${field.key}`;
</script>

<div class="flex flex-col">
  <div class="flex items-center gap-2.5 border-b border-border px-4 py-3">
    <span class="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-primary">
      <Icon class="size-4.5" />
    </span>
    <div class="min-w-0 flex-1">
      <h2 class="truncate text-body font-medium text-foreground">{definition.label}</h2>
      <p class="truncate text-caption text-muted-foreground">{definition.description}</p>
    </div>
  </div>

  <div class="flex items-center gap-1 border-b border-border px-3 py-2">
    <Button variant="ghost" size="icon-sm" aria-label="Move up" title="Move up" disabled={index <= 0} onclick={() => studio.nudge(block.id, -1)}><Up /></Button>
    <Button variant="ghost" size="icon-sm" aria-label="Move down" title="Move down" disabled={index >= count - 1} onclick={() => studio.nudge(block.id, 1)}><Down /></Button>
    <Button variant="ghost" size="icon-sm" aria-label="Duplicate" title="Duplicate" onclick={() => studio.duplicate(block.id)}><Copy /></Button>
    <div class="flex-1"></div>
    <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" onclick={() => studio.remove(block.id)}>
      <Trash />
      Delete
    </Button>
  </div>

  <div class="flex flex-col gap-6 p-4">
    {#if definition.fields.length === 0}
      <p class="text-body text-muted-foreground">Nothing to set. Everything after this block starts on a new page.</p>
    {/if}
    {#each definition.fields as field (field.key)}
      {#if field.kind === "switch"}
        <div class="flex items-start justify-between gap-4">
          <label for={id(field)} class="flex min-w-0 cursor-pointer flex-col gap-0.5">
            <span class="text-body font-medium text-foreground">{field.label}</span>
            {#if field.hint}<span class="text-caption text-muted-foreground">{field.hint}</span>{/if}
          </label>
          <Switch id={id(field)} checked={Boolean(values[field.key])} onCheckedChange={(v) => set(field.key, v)} class="mt-0.5" />
        </div>
      {:else}
        <div class="flex flex-col gap-2">
          {#if field.kind === "text" || field.kind === "textarea" || field.kind === "number" || field.kind === "select"}
            <label for={id(field)} class="text-body font-medium text-foreground">{field.label}</label>
          {:else}
            <span class="text-body font-medium text-foreground">{field.label}</span>
          {/if}

          {#if field.kind === "text"}
            <Input id={id(field)} value={values[field.key] as string} placeholder={field.placeholder} oninput={(e) => set(field.key, e.currentTarget.value)} />
          {:else if field.kind === "textarea"}
            <Textarea id={id(field)} value={values[field.key] as string} rows={3} placeholder={field.placeholder} oninput={(e) => set(field.key, e.currentTarget.value)} />
            {#if field.hint}<p class="text-caption text-muted-foreground">{field.hint}</p>{/if}
          {:else if field.kind === "number"}
            <div class="flex items-center gap-3">
              <input
                id={id(field)}
                type="range"
                min={field.min}
                max={field.max}
                step={field.step ?? 1}
                value={values[field.key] as number}
                oninput={(e) => set(field.key, Number(e.currentTarget.value))}
                class="h-9 min-w-0 flex-1 accent-primary"
              />
              <span class="w-14 text-right text-body tabular-nums text-muted-foreground">{values[field.key]} {field.unit ?? ""}</span>
            </div>
          {:else if field.kind === "segmented"}
            <SegmentedControl
              size="sm"
              name={id(field)}
              value={String(values[field.key])}
              options={field.options.map((o) => ({ value: String(o.value), label: o.label }))}
              onchange={(value) => {
                const option = field.options.find((o) => String(o.value) === value);
                if (option) set(field.key, option.value);
              }}
            />
          {:else if field.kind === "select"}
            <Select.Root type="single" value={String(values[field.key])} onValueChange={(v) => set(field.key, v)}>
              <Select.Trigger id={id(field)} class="w-full">
                {field.options.find((o) => String(o.value) === String(values[field.key]))?.label ?? "Choose"}
              </Select.Trigger>
              <Select.Content>
                {#each field.options as option (option.value)}
                  <Select.Item value={String(option.value)} label={option.label} />
                {/each}
              </Select.Content>
            </Select.Root>
          {:else if field.kind === "list"}
            <RowsEditor rows={values[field.key] as string[]} itemLabel={field.itemLabel} onchange={(rows) => set(field.key, rows, `rows:${block.id}`)} />
          {:else if field.kind === "rows"}
            <RowsEditor
              rows={values[field.key] as Record<string, string>[]}
              columns={field.columns}
              itemLabel={field.itemLabel}
              onchange={(rows) => set(field.key, rows, `rows:${block.id}`)}
            />
          {:else if field.kind === "table" && block.type === "table"}
            <TableEditor columns={block.props.columns} rows={block.props.rows} onchange={(next) => studio.updateProps(block.id, next, `table:${block.id}`)} />
          {:else if field.kind === "image"}
            <ImageField label={field.label} value={values[field.key] as string} onchange={(v) => set(field.key, v)} />
          {:else if field.kind === "signature"}
            <SignaturePad value={values[field.key] as string} onchange={(v) => set(field.key, v)} />
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>
