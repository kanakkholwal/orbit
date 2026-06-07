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
  class="relative z-5 mx-auto flex w-full max-w-6xl flex-col gap-10 px-1 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-2 sm:px-2 sm:pt-4"
>
  <header
    class="relative flex flex-col items-center gap-7 overflow-hidden border-b border-border/60 px-2 pb-10 pt-6 text-center sm:pt-10"
    in:fly={{ y: 10, duration: 480, easing: cubicOut }}
  >

    <div
      class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-primary/5 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-primary"
    >
      <span class="relative inline-flex size-1.5">
        <span
          class="absolute inset-0 animate-ping rounded-full bg-primary/60"
        ></span>
        <span class="relative inline-flex size-1.5 rounded-full bg-primary"></span>
      </span>
      Library
      <span class="opacity-40">·</span>
      <span class="tabular-nums">
        {String(toolList.length).padStart(2, "0")} tools
      </span>
      <span class="opacity-40">·</span>
      All offline
    </div>

    <div class="flex max-w-2xl flex-col items-center gap-3">
      <h1
        class="text-display-md text-foreground sm:text-display-lg md:text-display-mega md:leading-[1.05]"
      >
        Find the right tool
        <span class="text-primary">in two keystrokes.</span>
      </h1>
      <p class="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        Search the full library. Filter by category. Open instantly — your
        files never leave the device.
      </p>
    </div>

    <div class="relative w-full max-w-xl">
      <div
        class="pointer-events-none absolute -inset-px rounded-md bg-linear-to-b from-primary/20 to-transparent opacity-60"
        aria-hidden="true"
      ></div>
      <div class="relative flex items-center gap-2 rounded-md border border-border/60 bg-card/80 px-3 shadow-sm ring-1 ring-white/5 backdrop-blur-sm focus-within:border-primary/40 focus-within:ring-primary/20">
        <Search class="size-4 shrink-0 text-muted-foreground" />
        <Input
          name="explore-search"
          value={searchQuery}
          oninput={(e) => handleSearch(e.currentTarget.value)}
          placeholder="Search merge, split, compress, sign…"
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
            class="pointer-events-none hidden shrink-0 rounded-xs border border-border/60 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 sm:inline-block"
          >
            /
          </kbd>
        {/if}
      </div>

      {#if normalizedQuery}
        <div
          class="mt-3 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          <span class="tabular-nums text-primary">
            {String(totalMatches).padStart(2, "0")}
          </span>
          {totalMatches === 1 ? "match" : "matches"}
          <span class="opacity-40">·</span>
          <button
            type="button"
            onclick={() => handleSearch("")}
            class="text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear
          </button>
        </div>
      {:else}
        <div class="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          <span
            class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60"
          >
            Try
          </span>
          {#each ["merge", "compress", "sign", "ocr", "watermark"] as suggestion (suggestion)}
            <button
              type="button"
              onclick={() => handleSearch(suggestion)}
              class="inline-flex items-center rounded-full border border-border/60 bg-card/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {suggestion}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </header>

  <nav
    aria-label="Categories"
    class="-mx-1 flex flex-wrap items-center gap-1 overflow-x-auto px-1 pb-1 sm:overflow-visible"
    in:fly={{ y: 8, duration: 480, delay: 80, easing: cubicOut }}
  >
    {#each categoryTabs as tab (tab.id)}
      <button
        type="button"
        onclick={() => updateCategory(tab.id)}
        aria-pressed={activeCategory === tab.id}
        class={cn(
          "inline-flex shrink-0 items-center gap-2 rounded-sm px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 active:scale-[0.97]",
          activeCategory === tab.id
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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
  </nav>

  {#if filteredCategories.length === 0}
    <div
      class="flex flex-col items-center gap-3 rounded-md border border-border/60 bg-muted/20 px-6 py-16 text-center"
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
        <div
          class="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
        >
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
