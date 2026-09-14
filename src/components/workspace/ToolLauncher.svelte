<script lang="ts">
  import { registerFileDrop } from "$lib/runtime/file-drop.svelte";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { toolList } from "$tools/list";
  import {
    IconArrowRight as ArrowRight,
    IconLayoutGrid as All,
    IconPaperclip as Paperclip,
    IconSearch as Search,
    type Icon,
  } from "@tabler/icons-svelte";
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
  <div class="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-20 pt-12 text-center sm:pb-24 sm:pt-16">
    <span
      class="flex -rotate-2 items-center gap-2 rounded-md border border-border bg-background p-0.5 pl-2.5 text-caption font-semibold text-foreground"
    >
      <span><span class="text-primary">{toolList.length} tools</span>, nothing uploaded</span>
      <span class="rounded-sm border border-border bg-muted px-1.5 py-0.5">Free</span>
    </span>

    <h1 class="mt-5 text-balance text-heading-lg font-medium text-foreground md:text-display">
      What do you want to <span class="text-primary">do</span> with your <span class="text-primary">PDF</span>?
    </h1>
    <p class="mt-4 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg">
      Search for a tool, or drop in a file and pick what to do with it.
    </p>

    <div class="mt-8 w-full rounded-2xl border border-border bg-card/85 p-2 text-left backdrop-blur-xl">
      <div class="no-scrollbar flex gap-1 overflow-x-auto p-1" role="group" aria-label="Filter by category">
        {#each allChips as chip (chip.id)}
          {@const active = category === chip.id}
          <button
            type="button"
            aria-pressed={active}
            onclick={() => oncategory(chip.id)}
            class={cn(
              "flex shrink-0 items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-3 text-body outline-none transition-[background-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-background font-medium text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span
              class={cn(
                "grid size-6 place-items-center rounded-md transition-colors",
                active ? "bg-primary text-primary-foreground" : "border border-border bg-background"
              )}
            >
              <chip.icon class="size-3.5" />
            </span>
            {chip.name}
          </button>
        {/each}
      </div>

      <form
        class="mt-1 flex h-14 items-center gap-2 rounded-xl bg-muted pl-4 pr-2.5 transition-shadow focus-within:ring-2 focus-within:ring-ring"
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
          class="h-full min-w-0 flex-1 bg-transparent text-body-lg text-foreground placeholder:text-placeholder focus:outline-none"
        />
        <button
          type="button"
          onclick={() => fileInput?.click()}
          class="flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-body text-muted-foreground outline-none transition-colors hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Paperclip class="size-4" />
          <span class="hidden sm:inline">Choose a file</span>
          <span class="sr-only sm:hidden">Choose a file</span>
        </button>
        <button
          type="submit"
          aria-label="Open the best match"
          class="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background outline-none transition-transform duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowRight class="size-4" />
        </button>
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

      {#if files.length > 0}
        <FileSuggestions {files} onclear={() => (files = [])} class="px-1 pb-1 pt-3" />
      {/if}
    </div>

    <p class="mt-4 text-body text-muted-foreground">or drop a PDF anywhere in this area</p>
  </div>

  {#if dragging}
    <div
      class="pointer-events-none absolute inset-3 z-10 grid place-items-center rounded-2xl border-2 border-dashed border-primary bg-primary/5 backdrop-blur-[1px]"
      transition:fade={{ duration: 120 }}
    >
      <p class="rounded-full bg-background px-4 py-2 text-body font-medium text-foreground shadow-sm">
        Drop to see what you can do
      </p>
    </div>
  {/if}
</section>
