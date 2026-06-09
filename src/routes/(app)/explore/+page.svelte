<script lang="ts">
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import Seo from "$components/Seo.svelte";
  import { ToolCard } from "$components/tool";
  import Input from "$components/ui/input/input.svelte";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { cn } from "$lib/utils";
  import { toolList } from "$tools/list";
  import { ArrowUpRight, Search, X } from "@lucide/svelte";
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  let searchQuery = $state(page.url.searchParams.get("search") || "");
  let activeCategory = $state(page.url.searchParams.get("category") || "all");

  let normalizedQuery = $derived(searchQuery.trim().toLowerCase());

  let filteredCategories = $derived(
    toolsCategories
      .map((cat) => {
        if (activeCategory !== "all" && cat.id !== activeCategory) return null;
        const matchingTools = cat.tools?.filter(
          (tool) =>
            !normalizedQuery ||
            tool.title.toLowerCase().includes(normalizedQuery) ||
            tool.description.toLowerCase().includes(normalizedQuery)
        );
        return matchingTools && matchingTools.length > 0
          ? { ...cat, tools: matchingTools }
          : null;
      })
      .filter(Boolean)
  );

  let totalMatches = $derived(
    filteredCategories.reduce((acc, c) => acc + (c?.tools?.length ?? 0), 0)
  );

  const exploreKeywords = [
    ...config.appKeywords,
    "pdf tools",
    "pdf converter",
    "pdf editor online free",
  ];

  function updateCategory(id: string) {
    const url = new URL(page.url);
    if (id === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", id);
    activeCategory = id;
    replaceState(url.href, { scroll: false });
  }

  function handleSearch(value: string) {
    const url = new URL(page.url);
    if (value) url.searchParams.set("search", value);
    else url.searchParams.delete("search");
    searchQuery = value;
    replaceState(url.href, { scroll: false });
  }

  function reset() {
    handleSearch("");
    updateCategory("all");
  }

  let categoryTabs = $derived([
    { id: "all", name: "All", count: toolList.length },
    ...toolsCategories.map((c) => ({
      id: c.id,
      name: c.name,
      count: c.tools?.length ?? 0,
    })),
  ]);
</script>

<Seo
  title="Explore Free PDF Tools | Orbit - No Upload, 100% Offline"
  description="Explore a complete library of free, fast PDF tools. Edit, convert, merge, and process PDFs entirely in your browser with zero data uploads."
  keywords={exploreKeywords}
/>

<main
  class="relative z-5 mx-auto flex w-full max-w-[min(1560px,100%)] flex-col gap-10 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-3 sm:pt-5"
>
  <header
    class="flex flex-col gap-6 border-b border-border/60 pb-10 pt-3 sm:pt-6"
    in:fly={{ y: 10, duration: 480, easing: cubicOut }}
  >
    <div class="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_22rem] lg:items-end">
      <div class="flex flex-col gap-4">
        <div
          class="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-secondary px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-foreground"
        >
          Tool index
          <span class="opacity-40">·</span>
          <span class="tabular-nums">{String(toolList.length).padStart(2, "0")} tools</span>
        </div>

        <div class="flex max-w-4xl flex-col gap-3">
          <h1 class="text-display-md text-foreground sm:text-display-lg md:text-display-mega md:leading-[1.05]">
            A complete offline PDF library, organized for desktop work.
          </h1>
          <p class="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Browse by category, narrow with search, and open the right tool from a
            quieter library view. Everything runs locally on your device.
          </p>
        </div>
      </div>

      <aside class="border-l border-border/60 pl-6">
        <div class="grid gap-3 text-sm text-muted-foreground">
          <p>
            Scope:
            <span class="text-foreground"> edit, convert, sign, merge, extract</span>
          </p>
          <p>
            Categories:
            <span class="font-medium text-foreground">
              {String(toolsCategories.length).padStart(2, "0")}
            </span>
          </p>
          <p>
            Privacy:
            <span class="font-medium text-foreground"> local only</span>
          </p>
        </div>
      </aside>
    </div>

    <div class="grid gap-6 border-t border-border/60 pt-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <Search class="size-4 shrink-0 text-muted-foreground" />
          <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            Search the library
          </p>
        </div>

        <div class="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4">
          <Input
            name="explore-search"
            value={searchQuery}
            oninput={(e) => handleSearch(e.currentTarget.value)}
            placeholder="Search merge, split, compress, sign..."
            class="h-12 flex-1 border-0 bg-transparent! px-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
          />
          {#if searchQuery}
            <button
              type="button"
              onclick={() => handleSearch("")}
              class="inline-flex size-7 shrink-0 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              aria-label="Clear search"
            >
              <X class="size-3.5" />
            </button>
          {:else}
            <kbd
              class="pointer-events-none hidden shrink-0 rounded-xs border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 sm:inline-block"
            >
              /
            </kbd>
          {/if}
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <span
            class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60"
          >
            Suggested
          </span>
          {#each ["merge", "compress", "sign", "ocr", "watermark"] as suggestion (suggestion)}
            <button
              type="button"
              onclick={() => handleSearch(suggestion)}
              class="inline-flex items-center rounded-full border border-border/60 bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {suggestion}
            </button>
          {/each}
        </div>
      </div>

      <div class="border-l border-border/60 pl-6">
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/65">
          Current view
        </p>
        <div class="mt-3 flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            Showing
            <span class="font-medium text-foreground">
              {String(totalMatches).padStart(2, "0")}
            </span>
            {totalMatches === 1 ? " result" : " results"}.
          </p>
          <p>
            Category:
            <span class="font-medium text-foreground">
              {categoryTabs.find((tab) => tab.id === activeCategory)?.name ?? "All"}
            </span>
          </p>
          <p>
            Query:
            <span class="font-mono text-foreground">
              {normalizedQuery ? `"${searchQuery}"` : "none"}
            </span>
          </p>
          {#if normalizedQuery || activeCategory !== "all"}
            <button
              type="button"
              onclick={reset}
              class="inline-flex w-fit items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-primary transition-colors hover:text-primary/80"
            >
              Reset filters
              <ArrowUpRight class="size-3" />
            </button>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <nav
    aria-label="Categories"
    class="border-b border-border/60 pb-4"
    in:fly={{ y: 8, duration: 480, delay: 80, easing: cubicOut }}
  >
    <div class="mb-3 flex items-center justify-between gap-3">
      <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
        Categories
      </span>
      <span class="font-mono text-[10px] text-muted-foreground/45">
        {String(categoryTabs.length).padStart(2, "0")} views
      </span>
    </div>

    <div class="flex flex-wrap items-center gap-1 overflow-x-auto pb-1 sm:overflow-visible">
      {#each categoryTabs as tab (tab.id)}
        <button
          type="button"
          onclick={() => updateCategory(tab.id)}
          aria-pressed={activeCategory === tab.id}
          class={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 active:scale-[0.97]",
            activeCategory === tab.id
              ? "border-primary/35 bg-primary/8 text-primary"
              : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          <span>{tab.name}</span>
          <span
            class={cn(
              "tabular-nums text-[10px]",
              activeCategory === tab.id
                ? "text-primary/70"
                : "text-muted-foreground/50"
            )}
          >
            {String(tab.count).padStart(2, "0")}
          </span>
        </button>
      {/each}
    </div>
  </nav>

  {#if filteredCategories.length === 0}
    <div
      class="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-card px-6 py-16 text-center"
      in:fly={{ y: 8, duration: 360, easing: cubicOut }}
    >
      <Search class="size-5 text-muted-foreground/50" />
      <p
        class="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70"
      >
        No matches
      </p>
      <p class="max-w-xs text-sm text-muted-foreground">
        Nothing found for
        <span class="font-mono text-foreground">"{searchQuery}"</span>. Try a
        different keyword.
      </p>
      <button
        type="button"
        onclick={reset}
        class="mt-2 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-primary transition-colors hover:text-primary/80"
      >
        Reset filters
        <ArrowUpRight class="size-3" />
      </button>
    </div>
  {:else}
    <div class="flex flex-col gap-12">
      {#if normalizedQuery}
        <div class="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {String(totalMatches).padStart(2, "0")} {totalMatches === 1
            ? "result"
            : "results"} for
          <span class="text-foreground">"{searchQuery}"</span>
        </div>
      {/if}

      {#each filteredCategories as category, ci (category?.id)}
        <section
          in:fly={{
            y: 10,
            duration: 480,
            delay: 60 + ci * 60,
            easing: cubicOut,
          }}
        >
          <div
            class="mb-6 flex items-baseline justify-between gap-3 border-b border-border/60 pb-3"
          >
            <div class="flex flex-col gap-1">
              <span
                class="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                {category?.name}
              </span>
              <p class="text-xs text-muted-foreground/80">
                {category?.description}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span
                class="font-mono text-[11px] tabular-nums text-muted-foreground/50"
              >
                {String(category?.tools?.length ?? 0).padStart(2, "0")}
              </span>
              {#if activeCategory === "all" && !normalizedQuery}
                <button
                  type="button"
                  onclick={() => updateCategory(category?.id || "all")}
                  class="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-primary transition-colors hover:text-primary/80 sm:inline-flex"
                >
                  View all
                </button>
              {/if}
            </div>
          </div>

          <ul
            class="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {#each category?.tools ?? [] as tool, ti (tool.slug)}
              <li class="contents">
                <ToolCard {tool} index={ti} delay={40 + (ti % 8) * 25} />
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  {/if}
</main>
