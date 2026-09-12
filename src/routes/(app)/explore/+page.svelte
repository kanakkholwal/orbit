<script lang="ts">
  import { goto, replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import Seo from "$components/Seo.svelte";
  import { ToolCard } from "$components/tool";
  import { Button } from "$components/ui/button";
  import ToolLauncher from "$components/workspace/ToolLauncher.svelte";
  import { config } from "$constants/app";
  import { categories, toolsCategories } from "$constants/tools";
  import { stagger } from "$lib/motion";
  import { toolList } from "$tools/list";
  import { IconSearch as Search } from "@tabler/icons-svelte";

  let searchQuery = $state(page.url.searchParams.get("search") || "");
  let activeCategory = $state(page.url.searchParams.get("category") || "all");

  const normalizedQuery = $derived(searchQuery.trim().toLowerCase());

  const sections = $derived(
    toolsCategories
      .filter((cat) => activeCategory === "all" || cat.id === activeCategory)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        tools: (cat.tools ?? []).filter(
          (tool) =>
            !normalizedQuery ||
            tool.title.toLowerCase().includes(normalizedQuery) ||
            tool.description.toLowerCase().includes(normalizedQuery) ||
            tool.keywords?.some((k) => k.includes(normalizedQuery))
        ),
      }))
      .filter((cat) => cat.tools.length > 0)
  );

  const matches = $derived(sections.flatMap((s) => s.tools));

  const chips = categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon }));

  const exploreKeywords = [...config.appKeywords, "pdf tools", "pdf converter", "pdf editor online free"];

  function syncUrl() {
    const url = new URL(page.url);
    if (searchQuery) url.searchParams.set("search", searchQuery);
    else url.searchParams.delete("search");
    if (activeCategory !== "all") url.searchParams.set("category", activeCategory);
    else url.searchParams.delete("category");
    replaceState(url.href, {});
  }

  function setQuery(value: string) {
    searchQuery = value;
    syncUrl();
  }

  function setCategory(id: string) {
    activeCategory = id;
    syncUrl();
  }

  function openBestMatch() {
    if (normalizedQuery && matches[0]) goto(`/tools/${matches[0].slug}`);
    else document.getElementById("library")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    searchQuery = "";
    activeCategory = "all";
    syncUrl();
  }
</script>

<Seo
  title="Explore Free PDF Tools | Orbit - No Upload, 100% Offline"
  description="Explore a complete library of free, fast PDF tools. Edit, convert, merge, and process PDFs entirely in your browser with zero data uploads."
  keywords={exploreKeywords}
/>

<ToolLauncher
  query={searchQuery}
  category={activeCategory}
  {chips}
  onquery={setQuery}
  oncategory={setCategory}
  onsubmit={openBestMatch}
/>

<div id="library" class="mx-auto flex w-full max-w-6xl scroll-mt-4 flex-col gap-12 px-4 pb-16 pt-10 md:px-8">
  {#if normalizedQuery}
    <p class="text-body text-muted-foreground" aria-live="polite">
      {matches.length}
      {matches.length === 1 ? "tool" : "tools"} match “{searchQuery}”
    </p>
  {/if}

  {#if sections.length === 0}
    <div class="panel-card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <Search class="size-5 text-muted-foreground" />
      <p class="text-body-lg font-medium text-foreground">No tools found</p>
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Nothing matches “{searchQuery}”. Try another word, or clear the filters to see all {toolList.length} tools.
      </p>
      <Button variant="outline" size="sm" class="mt-1" onclick={reset}>Clear filters</Button>
    </div>
  {:else}
    {#each sections as section (section.id)}
      <section class="flex flex-col gap-4" aria-labelledby={`cat-${section.id}`}>
        <div class="flex items-end justify-between gap-4">
          <div>
            <h2 id={`cat-${section.id}`} class="text-subheading font-medium text-foreground">{section.name}</h2>
            {#if section.description}
              <p class="mt-0.5 text-body text-muted-foreground">{section.description}</p>
            {/if}
          </div>
          <span class="shrink-0 text-caption tabular-nums text-muted-foreground">
            {section.tools.length}
            {section.tools.length === 1 ? "tool" : "tools"}
          </span>
        </div>

        <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {#each section.tools as tool, i (tool.slug)}
            <li class="contents">
              <ToolCard {tool} delay={stagger(i, 30, 8)} />
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  {/if}
</div>
