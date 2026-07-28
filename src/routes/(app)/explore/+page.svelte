<script lang="ts">
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import Seo from "$components/Seo.svelte";
  import { ToolCard } from "$components/tool";
  import { Button } from "$components/ui/button";
  import Input from "$components/ui/input/input.svelte";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { cn } from "$lib/utils";
  import { toolList } from "$tools/list";
  import { IconSearch as Search, IconX as X } from "@tabler/icons-svelte";
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
  class="relative z-5 mx-auto flex w-full max-w-app-content flex-col gap-8 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-4 sm:pt-8"
>
  <header
    class="flex flex-col items-center gap-5 text-center"
    in:fly={{ y: 10, duration: 480, easing: cubicOut }}
  >
    <div class="flex flex-col gap-3">
      <h1 class="text-display-lg text-foreground sm:text-display-mega">
        Explore the library
      </h1>
      <p class="mx-auto max-w-md text-base leading-relaxed text-muted-foreground">
        {toolList.length} tools that run entirely on your device. Search, or browse
        by category.
      </p>
    </div>

    <div
      class="mt-1 flex w-full max-w-xl items-center gap-2.5 rounded-2xl border border-border bg-card px-4 shadow-sm transition-shadow duration-200 focus-within:shadow-md"
    >
      <Search class="size-5 shrink-0 text-muted-foreground" />
      <Input
        name="explore-search"
        value={searchQuery}
        oninput={(e) => handleSearch(e.currentTarget.value)}
        placeholder="Search tools…"
        class="h-12 flex-1 border-0 bg-transparent! px-0 text-base shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
      />
      {#if searchQuery}
        <button
          type="button"
          onclick={() => handleSearch("")}
          class="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X class="size-4" />
        </button>
      {/if}
    </div>

    <div class="flex flex-wrap items-center justify-center gap-1.5">
      {#each ["merge", "compress", "sign", "ocr", "watermark"] as suggestion (suggestion)}
        <button
          type="button"
          onclick={() => handleSearch(suggestion)}
          class="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-all duration-200 ease-snappy hover:border-primary/40 hover:text-foreground active:bg-muted"
        >
          {suggestion}
        </button>
      {/each}
    </div>
  </header>

  <nav
    aria-label="Categories"
    class="flex flex-wrap items-center justify-center gap-1.5"
    in:fly={{ y: 8, duration: 480, delay: 80, easing: cubicOut }}
  >
    {#each categoryTabs as tab (tab.id)}
      <button
        type="button"
        onclick={() => updateCategory(tab.id)}
        aria-pressed={activeCategory === tab.id}
        class={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ease-snappy active:brightness-95",
          activeCategory === tab.id
            ? "bg-primary text-primary-foreground shadow-sm"
            : "border border-border bg-card text-muted-foreground hover:text-foreground"
        )}
      >
        {tab.name}
        <span
          class={cn(
            "tabular-nums text-xs",
            activeCategory === tab.id
              ? "text-primary-foreground/70"
              : "text-muted-foreground/50"
          )}
        >
          {tab.count}
        </span>
      </button>
    {/each}
  </nav>

  {#if filteredCategories.length === 0}
    <div
      class="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center"
      in:fly={{ y: 8, duration: 360, easing: cubicOut }}
    >
      <span
        class="inline-flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <Search class="size-5" />
      </span>
      <p class="text-base font-medium text-foreground">No tools found</p>
      <p class="max-w-xs text-sm text-muted-foreground">
        Nothing matches “{searchQuery}”. Try another keyword.
      </p>
      <Button variant="secondary" size="sm" class="mt-1 rounded-full" onclick={reset}>
        Clear filters
      </Button>
    </div>
  {:else}
    <div class="flex flex-col gap-10">
      {#each filteredCategories as category, ci (category?.id)}
        <section
          in:fly={{ y: 10, duration: 480, delay: 60 + ci * 50, easing: cubicOut }}
        >
          <div class="mb-4 flex items-baseline justify-between gap-3">
            <h2 class="text-title-md text-foreground">{category?.name}</h2>
            <span class="text-sm tabular-nums text-muted-foreground/60">
              {category?.tools?.length ?? 0}
            </span>
          </div>

          <ul
            class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
