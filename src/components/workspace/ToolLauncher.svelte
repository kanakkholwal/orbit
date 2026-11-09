<script lang="ts">
  import { registerFileDrop } from "$lib/runtime/file-drop.svelte";
  import { Badge } from "$components/ui/badge";
  import { Button } from "$components/ui/button";
  import { ToggleGroup, ToggleGroupItem } from "$components/ui/toggle-group";
  import { appState } from "$stores/app-state.svelte";
  import { toolList } from "$tools/list";
  import {
    IconArrowRight as ArrowRight,
    IconLayoutGrid as All,
    IconPaperclip as Paperclip,
    IconSearch as Search,
    type Icon,
  } from "$lib/icons";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import FileSuggestions from "./FileSuggestions.svelte";

  type Chip = { id: string; name: string; icon: Icon };

  type Props = {
    query: string;
    category: string;
    chips: Chip[];
    /** Called on Enter or the submit button, with the current query. */
    onsubmit: () => void;
    onquery: (value: string) => void;
    oncategory: (id: string) => void;
  };

  let { query, category, chips, onsubmit, onquery, oncategory }: Props = $props();

  let files = $state<File[]>([]);
  let dragging = $state(false);
  let dragDepth = 0;
  let fileInput = $state<HTMLInputElement | null>(null);

  const allChips = $derived<Chip[]>([{ id: "all", name: "All tools", icon: All }, ...chips]);

  onMount(() => {
    if (!appState.isTauri) return;
    return registerFileDrop((dropped) => (files = dropped));
  });

  function onDragEnter(e: DragEvent) {
    if (!e.dataTransfer?.types.includes("Files")) return;
    e.preventDefault();
    dragDepth += 1;
    dragging = true;
  }

  function onDragLeave() {
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) dragging = false;
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragDepth = 0;
    dragging = false;
    const dropped = Array.from(e.dataTransfer?.files ?? []);
    if (dropped.length > 0) files = dropped;
  }
</script>

<section
  aria-label="Find a tool"
  class="relative isolate overflow-hidden border-b border-border"
  ondragenter={onDragEnter}
  ondragover={(e) => e.dataTransfer?.types.includes("Files") && e.preventDefault()}
  ondragleave={onDragLeave}
  ondrop={onDrop}
>
  <div class="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-12 pt-12 text-center sm:pb-14 sm:pt-16">
    <Badge variant="secondary" class="rise">
      <span class="text-primary">{toolList.length} tools</span>, nothing uploaded
    </Badge>
    <h1 class="rise mt-5 text-balance text-4xl font-medium text-foreground md:text-5xl" style="--i:1">
      What do you want to <span class="text-primary">do</span> with your <span class="text-primary">PDF</span>?
    </h1>
    <p class="rise mt-4 max-w-xl text-pretty text-sm text-muted-foreground md:text-base" style="--i:2">
      Search for a tool, or drop in a file and pick what to do with it.
    </p>

    <div class="rise mt-8 w-full rounded-2xl border border-border bg-background p-1 text-left" style="--i:3">
      <div class="flex flex-col gap-3 rounded-[11px] bg-card p-3">
        <form
          class="flex h-12 items-center gap-2 rounded-xl border border-input bg-background pl-3.5 pr-1.5 transition-shadow focus-within:ring-2 focus-within:ring-ring"
          onsubmit={(e) => {
            e.preventDefault();
            onsubmit();
          }}
        >
          <Search class="size-5 shrink-0 text-muted-foreground" />
          <label for="launcher-query" class="sr-only">Search tools</label>
          <input
            id="launcher-query"
            type="search"
            value={query}
            oninput={(e) => onquery(e.currentTarget.value)}
            placeholder="Compress, merge, sign, convert…"
            autocomplete="off"
            class="h-full min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button type="button" variant="ghost" size="sm" onclick={() => fileInput?.click()}>
            <Paperclip />
            <span class="hidden sm:inline">Choose a file</span>
            <span class="sr-only sm:hidden">Choose a file</span>
          </Button>
          <Button type="submit" size="icon" aria-label="Open the best match">
            <ArrowRight />
          </Button>
          <input
            bind:this={fileInput}
            type="file"
            accept="application/pdf,image/*"
            multiple
            class="hidden"
            onchange={(e) => {
              files = Array.from(e.currentTarget.files ?? []);
              e.currentTarget.value = "";
            }}
          />
        </form>

        <div class="no-scrollbar -mx-1 overflow-x-auto px-1">
          <ToggleGroup
            type="single"
            variant="chip"
            size="sm"
            label="Filter by category"
            value={category}
            onValueChange={(v) => typeof v === "string" && v && oncategory(v)}
            class="flex-nowrap"
          >
            {#each allChips as chip (chip.id)}
              <ToggleGroupItem value={chip.id}>
                <chip.icon />
                {chip.name}
              </ToggleGroupItem>
            {/each}
          </ToggleGroup>
        </div>

        {#if files.length > 0}
          <FileSuggestions {files} onclear={() => (files = [])} class="px-1 pb-1" />
        {/if}
      </div>
    </div>

    <p class="mt-4 text-sm text-muted-foreground">or drop a PDF anywhere in this area</p>
  </div>

  {#if dragging}
    <div
      class="pointer-events-none absolute inset-3 z-10 grid place-items-center rounded-2xl border-2 border-dashed border-primary bg-primary/5"
      transition:fade={{ duration: 120 }}
    >
      <p class="rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground shadow-(--surface-shadow)">
        Drop to see what you can do
      </p>
    </div>
  {/if}
</section>
