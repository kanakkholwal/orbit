<script lang="ts">
  import { Checkbox } from "$components/ui/checkbox";
  import { cn } from "$lib/utils";
  import type { SearchResult } from "@embedpdf/models";
  import { MatchFlag } from "@embedpdf/models";
  import { useScrollCapability } from "@embedpdf/plugin-scroll/svelte";
  import { useSearch } from "@embedpdf/plugin-search/svelte";
  import {
    IconChevronDown as ChevronDown,
    IconChevronUp as ChevronUp,
    IconLoader2 as Loader,
    IconSearch as SearchIcon,
    IconX as X,
  } from "@tabler/icons-svelte";
  import { tick } from "svelte";
  import { chromeButton } from "./chrome";

  interface SearchProps {
    documentId: string;
  }

  let { documentId }: SearchProps = $props();

  const search = useSearch(() => documentId);
  const scrollCapability = useScrollCapability();
  const uid = $props.id();

  let inputValue = $state(search.state.query || "");
  let inputRef: HTMLInputElement | undefined = $state();

  $effect(() => {
    tick().then(() => {
      inputRef?.focus({ preventScroll: true });
      inputValue = search.state.query || "";
    });
  });

  $effect(() => {
    if (inputValue === "") search.provides?.stopSearch();
    else search.provides?.searchAllPages(inputValue);
  });

  $effect(() => {
    if (typeof search.state.activeResultIndex === "number" && !search.state.loading && search.state.results.length > 0) {
      scrollToItem(search.state.activeResultIndex);
    }
  });

  function setFlag(flag: MatchFlag, checked: boolean) {
    const flags = search.state.flags;
    search.provides?.setFlags(checked ? [...flags, flag] : flags.filter((f) => f !== flag));
  }

  function scrollToItem(index: number) {
    const item = search.state.results[index];
    if (!item) return;
    const origin = item.rects.reduce(
      (min, rect) => ({ x: Math.min(min.x, rect.origin.x), y: Math.min(min.y, rect.origin.y) }),
      { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY }
    );
    scrollCapability.provides?.scrollToPage({
      pageNumber: item.pageIndex + 1,
      pageCoordinates: origin,
      alignX: 50,
      alignY: 50,
    });
  }

  const grouped = $derived(
    Object.entries(
      search.state.results.reduce<Record<number, { hit: SearchResult; index: number }[]>>((map, r, i) => {
        map[r.pageIndex] = [...(map[r.pageIndex] ?? []), { hit: r, index: i }];
        return map;
      }, {})
    )
  );

  const flagOptions = $derived([
    { flag: MatchFlag.MatchCase, label: "Match case", checked: search.state.flags.includes(MatchFlag.MatchCase) },
    { flag: MatchFlag.MatchWholeWord, label: "Whole words", checked: search.state.flags.includes(MatchFlag.MatchWholeWord) },
  ]);
</script>

<div class="flex h-full flex-col">
  <div class="flex flex-col gap-3 border-b border-border p-3">
    <label
      class="flex h-9 items-center gap-2 rounded-lg border border-border bg-background pl-2.5 pr-1 transition-colors duration-150 focus-within:border-ring"
    >
      <SearchIcon class="size-4 shrink-0 text-muted-foreground" />
      <span class="sr-only">Search in document</span>
      <input
        bind:this={inputRef}
        bind:value={inputValue}
        type="search"
        placeholder="Search in document"
        onkeydown={(e) => {
          if (e.key !== "Enter" || search.state.total === 0) return;
          e.preventDefault();
          if (e.shiftKey) search.provides?.previousResult();
          else search.provides?.nextResult();
        }}
        class="h-full min-w-0 flex-1 bg-transparent text-body text-foreground placeholder:text-placeholder focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {#if inputValue}
        <button
          type="button"
          aria-label="Clear search"
          onclick={() => {
            inputValue = "";
            inputRef?.focus();
          }}
          class="grid size-7 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <X class="size-3.5" />
        </button>
      {/if}
    </label>

    <div class="flex flex-wrap gap-x-4 gap-y-2">
      {#each flagOptions as option (option.flag)}
        <div class="flex items-center gap-2">
          <Checkbox
            id={`${uid}-${option.flag}`}
            checked={option.checked}
            onCheckedChange={(checked) => setFlag(option.flag, checked === true)}
          />
          <label for={`${uid}-${option.flag}`} class="cursor-pointer text-body text-foreground">{option.label}</label>
        </div>
      {/each}
    </div>

    {#if search.state.active && !search.state.loading}
      <div class="-mb-1 flex h-9 items-center justify-between">
        <span class="text-body text-muted-foreground" aria-live="polite">
          {#if search.state.total === 0}
            No matches
          {:else}
            {(search.state.activeResultIndex ?? 0) + 1} of {search.state.total}
          {/if}
        </span>
        {#if search.state.total > 1}
          <div class="flex gap-1">
            <button
              type="button"
              aria-label="Previous match"
              title="Previous match (Shift Enter)"
              class={chromeButton({ shape: "icon" })}
              onclick={() => search.provides?.previousResult()}
            >
              <ChevronUp class="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next match"
              title="Next match (Enter)"
              class={chromeButton({ shape: "icon" })}
              onclick={() => search.provides?.nextResult()}
            >
              <ChevronDown class="size-4" />
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="scrollbar-subtle min-h-0 flex-1 overflow-y-auto p-3">
    {#if search.state.loading}
      <div class="flex h-32 items-center justify-center gap-2 text-body text-muted-foreground">
        <Loader class="size-4 animate-spin" />
        Searching
      </div>
    {:else if !search.state.active}
      <p class="px-1 py-6 text-center text-body text-muted-foreground">Type a word or phrase to find it on every page.</p>
    {:else}
      <div class="flex flex-col gap-4">
        {#each grouped as [page, hits] (page)}
          <section class="flex flex-col gap-1">
            <h3 class="px-1 pb-0.5 text-caption font-medium text-muted-foreground">Page {Number(page) + 1}</h3>
            {#each hits as { hit, index } (index)}
              {@const active = index === search.state.activeResultIndex}
              <button
                type="button"
                onclick={() => search.provides?.goToResult(index)}
                aria-current={active ? "true" : undefined}
                class={cn(
                  "w-full rounded-lg px-2.5 py-2 text-left text-body leading-relaxed text-muted-foreground outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  active ? "bg-muted text-foreground" : "hover:bg-muted/60"
                )}
              >
                {#if hit.context.truncatedLeft}…{/if}{hit.context.before}<mark
                  class="rounded-xs bg-primary/15 px-0.5 font-medium text-foreground">{hit.context.match}</mark
                >{hit.context.after}{#if hit.context.truncatedRight}…{/if}
              </button>
            {/each}
          </section>
        {/each}
      </div>
    {/if}
  </div>
</div>
