<script lang="ts">
  import { cn } from "$lib/utils";
  import { IconSearch as Search } from "@tabler/icons-svelte";
  import { onMount } from "svelte";
  import { BLOCK_ICONS } from "../icons";
  import { BLOCK_LIST, type BlockCategory, CATEGORY_LABELS } from "../model/blocks";
  import type { BlockType } from "../model/types";

  type Props = {
    onpick: (type: BlockType) => void;
    autofocus?: boolean;
    /** Shows one-line descriptions, for the roomier library panel. */
    descriptions?: boolean;
    class?: string;
  };

  let { onpick, autofocus = false, descriptions = false, class: className }: Props = $props();

  const uid = $props.id();
  let query = $state("");
  let active = $state(0);
  let input = $state<HTMLInputElement | null>(null);
  let list = $state<HTMLDivElement | null>(null);

  const results = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return BLOCK_LIST.filter(
      (d) => !q || d.label.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.keywords.some((k) => k.includes(q))
    );
  });

  const groups = $derived(
    (Object.keys(CATEGORY_LABELS) as BlockCategory[])
      .map((category) => ({ category, items: results.filter((d) => d.category === category) }))
      .filter((g) => g.items.length > 0)
  );

  $effect(() => {
    query;
    active = 0;
  });

  onMount(() => {
    if (autofocus) input?.focus({ preventScroll: true });
  });

  function onkeydown(event: KeyboardEvent) {
    if (results.length === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      active = (active + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
      list?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter") {
      event.preventDefault();
      onpick(results[active].type);
    }
  }
</script>

<div class={cn("flex min-h-0 flex-col", className)}>
  <div class="p-2">
    <label class="flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-2.5 transition-colors duration-150 focus-within:border-ring">
      <Search class="size-4 shrink-0 text-muted-foreground" />
      <span class="sr-only">Find a block</span>
      <input
        bind:this={input}
        bind:value={query}
        type="search"
        placeholder="Find a block"
        role="combobox"
        aria-expanded="true"
        aria-controls={`${uid}-list`}
        aria-activedescendant={results[active] ? `${uid}-${results[active].type}` : undefined}
        {onkeydown}
        class="h-full min-w-0 flex-1 bg-transparent text-body text-foreground placeholder:text-placeholder focus:outline-none"
      />
    </label>
  </div>
  <div bind:this={list} id={`${uid}-list`} role="listbox" aria-label="Blocks" class="scrollbar-subtle min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2">
    {#if results.length === 0}
      <p class="px-2 py-6 text-center text-body text-muted-foreground">No blocks match “{query}”.</p>
    {/if}
    {#each groups as group (group.category)}
      <div role="group" aria-label={CATEGORY_LABELS[group.category]} class="flex flex-col gap-0.5 pb-2">
        <div class="px-2 pb-1 pt-2 text-caption font-medium text-muted-foreground">{CATEGORY_LABELS[group.category]}</div>
        {#each group.items as definition (definition.type)}
          {@const index = results.indexOf(definition)}
          {@const Icon = BLOCK_ICONS[definition.type]}
          <button
            type="button"
            role="option"
            id={`${uid}-${definition.type}`}
            data-index={index}
            aria-selected={index === active}
            onpointermove={() => (active = index)}
            onclick={() => onpick(definition.type)}
            class={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2 text-left outline-none transition-colors duration-100",
              descriptions ? "min-h-12 py-1.5" : "h-9",
              index === active ? "bg-muted" : "hover:bg-muted/60"
            )}
          >
            <span class="grid size-7 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
              <Icon class="size-4" />
            </span>
            <span class="flex min-w-0 flex-col">
              <span class="truncate text-body text-foreground">{definition.label}</span>
              {#if descriptions}<span class="truncate text-caption text-muted-foreground">{definition.description}</span>{/if}
            </span>
          </button>
        {/each}
      </div>
    {/each}
  </div>
</div>
