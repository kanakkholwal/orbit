<script lang="ts">
  import { Input } from "$components/ui/input";
  import { Switch } from "$components/ui/switch";
  import { IconBraces as Braces } from "@tabler/icons-svelte";
  import { fieldLabel } from "../model/fields";
  import type { CreatorState } from "../state.svelte";

  let { studio }: { studio: CreatorState } = $props();

  const uid = $props.id();
  const filled = $derived(studio.fields.filter((f) => studio.doc?.data[f]?.trim()).length);
</script>

<div class="flex flex-col gap-5 p-4">
  <div class="flex items-start justify-between gap-4 rounded-xl bg-muted p-3">
    <label for={`${uid}-show`} class="flex min-w-0 cursor-pointer flex-col gap-0.5">
      <span class="text-body font-medium text-foreground">Show values on the page</span>
      <span class="text-caption text-muted-foreground">Turn off to edit the placeholders.</span>
    </label>
    <Switch id={`${uid}-show`} bind:checked={studio.showValues} class="mt-0.5" />
  </div>

  {#if studio.fields.length === 0}
    <div class="flex flex-col items-center gap-2 px-2 py-8 text-center">
      <span class="grid size-10 place-items-center rounded-xl border border-border text-muted-foreground"><Braces class="size-5" /></span>
      <p class="text-body font-medium text-foreground">No fields yet</p>
      <p class="text-body text-muted-foreground">Type a name in double braces, like <code class="rounded bg-muted px-1 font-mono text-caption">{"{{client}}"}</code>, anywhere in the document. Fill it in here and reuse the layout.</p>
    </div>
  {:else}
    <div class="flex items-baseline justify-between">
      <h3 class="text-body font-medium text-foreground">Fields</h3>
      <span class="text-caption tabular-nums text-muted-foreground">{filled} of {studio.fields.length} filled</span>
    </div>
    <div class="flex flex-col gap-4">
      {#each studio.fields as field (field)}
        <div class="flex flex-col gap-1.5">
          <label for={`${uid}-${field}`} class="flex items-baseline justify-between gap-2">
            <span class="text-body font-medium text-foreground">{fieldLabel(field)}</span>
            <code class="font-mono text-caption text-muted-foreground">{`{{${field}}}`}</code>
          </label>
          <Input
            id={`${uid}-${field}`}
            value={studio.doc?.data[field] ?? ""}
            placeholder={`Value for ${fieldLabel(field).toLowerCase()}`}
            oninput={(e) => {
              const value = e.currentTarget.value;
              studio.change(`data:${field}`, (d) => (d.data[field] = value));
            }}
          />
        </div>
      {/each}
    </div>
    <p class="text-caption text-muted-foreground">Empty fields stay visible in the PDF so nothing goes out half-filled.</p>
  {/if}
</div>
