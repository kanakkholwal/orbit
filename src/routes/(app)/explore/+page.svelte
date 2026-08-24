<script lang="ts">
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import Seo from "$components/Seo.svelte";
  import { ChapterRule } from "$components/site";
  import { ToolCard } from "$components/tool";
  import { Button } from "$components/ui/button";
  import Input from "$components/ui/input/input.svelte";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { rise, stagger } from "$lib/motion";
  import { cn } from "$lib/utils";
  import { toolList } from "$tools/list";
  import { IconSearch as Search, IconX as X } from "@tabler/icons-svelte";
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

  let resultCount = $derived(
    filteredCategories.reduce((n, c) => n + (c?.tools?.length ?? 0), 0)
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

  const suggestions = ["merge", "compress", "sign", "ocr", "watermark"];
</script>

<Seo
  title="Explore Free PDF Tools | Orbit - No Upload, 100% Offline"
  description="Explore a complete library of free, fast PDF tools. Edit, convert, merge, and process PDFs entirely in your browser with zero data uploads."
  keywords={exploreKeywords}
/>

<main
  class="relative z-5 mx-auto flex w-full max-w-app-content flex-col gap-10 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-4 sm:pt-8"
>
  <!-- Interior hero: left-aligned, one lede, then a rule carrying the facts. -->
  <header class="flex flex-col gap-6" in:fly={rise(10)}>
    <div class="flex flex-col gap-3">
      <span class="label-eyebrow text-primary">Library</span>
      <h1 class="max-w-2xl text-balance text-heading-lg text-foreground">
        Every tool, in one place.
      </h1>
      <p class="max-w-xl text-pretty text-body-lg leading-relaxed text-muted-foreground">
        {toolList.length} tools that run entirely on your device. Search, or browse
        by category.
      </p>
    </div>

    <div class="flex w-full max-w-xl flex-col gap-3">
      <div
        class="flex items-center gap-2.5 rounded-sm border border-border bg-card px-4 transition-colors duration-200 focus-within:border-primary"
      >
        <Search class="size-4 shrink-0 text-muted-foreground" />
        <Input
          name="explore-search"
          value={searchQuery}
          oninput={(e) => handleSearch(e.currentTarget.value)}
          placeholder="Search tools…"
          class="h-11 flex-1 border-0 bg-transparent! px-0 shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
        />
        {#if searchQuery}
          <button
            type="button"
            onclick={() => handleSearch("")}
            class="pressable inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-paper hover:text-foreground"
            aria-label="Clear search"
          >
            <X class="size-4" />
          </button>
        {/if}
      </div>

      {#if !searchQuery}
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span class="label-eyebrow text-muted-foreground">Try</span>
          {#each suggestions as suggestion (suggestion)}
            <button
              type="button"
              onclick={() => handleSearch(suggestion)}
              class="text-body-sm text-muted-foreground underline decoration-border-strong underline-offset-4 transition-colors duration-200 hover:text-foreground hover:decoration-current"
            >
              {suggestion}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <ul
      class="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-caption text-muted-foreground"
    >
      <li>{toolList.length} tools</li>
      <li>Nothing is uploaded</li>
      <li>No account, no watermark</li>
      <li>Works offline once installed</li>
    </ul>
  </header>

  <!-- Segmented track: one shape for every filter control in the app. -->
  <nav aria-label="Categories" class="-mx-1 overflow-x-auto px-1 no-scrollbar">
    <div
      class="inline-flex items-center gap-1 rounded-full border border-border bg-paper p-1"
    >
      {#each categoryTabs as tab (tab.id)}
        <button
          type="button"
          onclick={() => updateCategory(tab.id)}
          aria-pressed={activeCategory === tab.id}
          class={cn(
            "pressable inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-body-sm font-medium transition-[background-color,color,box-shadow] duration-200",
            activeCategory === tab.id
              ? "bg-card text-foreground shadow-craft-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.name}
          <span class="tabular-nums text-caption text-muted-foreground">
            {tab.count}
          </span>
        </button>
      {/each}
    </div>
  </nav>

  {#if filteredCategories.length === 0}
    <div
      class="flex flex-col items-start gap-3 border-t border-border pt-10"
      in:fly={rise(8)}
    >
      <Search class="size-5 text-muted-foreground" />
      <p class="text-body font-semibold text-foreground">No tools found</p>
      <p class="max-w-sm text-pretty text-body-sm text-muted-foreground">
        Nothing matches “{searchQuery}”. Try another keyword, or clear the
        filters to see all {toolList.length} tools.
      </p>
      <Button variant="outline" size="sm" class="mt-1" onclick={reset}>
        Clear filters
      </Button>
    </div>
  {:else}
    {#if normalizedQuery}
      <p class="text-body-sm text-muted-foreground" aria-live="polite">
        {resultCount}
        {resultCount === 1 ? "tool" : "tools"} matching “{searchQuery}”
      </p>
    {/if}

    <div class="flex flex-col gap-12">
      {#each filteredCategories as category, ci (category?.id)}
        <section in:fly={rise(10, stagger(ci, 50, 4))}>
          <ChapterRule
            index={String(ci + 1).padStart(2, "0")}
            label={category?.name ?? ""}
          >
            {#snippet action()}
              <span class="tabular-nums text-caption text-muted-foreground">
                {category?.tools?.length ?? 0}
                {(category?.tools?.length ?? 0) === 1 ? "tool" : "tools"}
              </span>
            {/snippet}
          </ChapterRule>

          <ul
            class="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {#each category?.tools ?? [] as tool, ti (tool.slug)}
              <li class="contents">
                <ToolCard
                  {tool}
                  index={ti}
                  framing="cell"
                  delay={stagger(ti, 30, 8)}
                />
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  {/if}
</main>
