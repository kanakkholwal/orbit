<script lang="ts">
  import { goto, replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import Seo from "$components/Seo.svelte";
  import { ChipGroup, CollectionGrid, ToolCard } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { InputGroup, InputGroupAddon, InputGroupInput } from "$components/ui/input-group";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { IconSearch as Search } from "$lib/icons";
  import { MorphText } from "$components/text/morph-text";
  import { toolList } from "$tools/list";
  import { MediaQuery } from "svelte/reactivity";

  const reduceMotion = new MediaQuery("prefers-reduced-motion: reduce");
  const subjects = ["PDFs", "photos", "videos", "audio", "documents", "forms"];

  let searchQuery = $state("");
  let activeCategory = $state("all");

  // The page is prerendered, so the query string is only readable in the browser. It also changes
  // when a sidebar group link is followed while already on this page.
  $effect(() => {
    searchQuery = page.url.searchParams.get("search") || "";
    activeCategory = page.url.searchParams.get("category") || "all";
  });

  const normalizedQuery = $derived(searchQuery.trim().toLowerCase());
  const browsing = $derived(!normalizedQuery && activeCategory === "all");
  const total = toolsCategories.reduce((sum, c) => sum + (c.tools?.length ?? 0), 0);

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

  // Preset pages are not in menus, so a search also looks through them.
  const presetMatches = $derived(
    normalizedQuery
      ? toolList.filter(
          (t) =>
            t.alias &&
            (t.title.toLowerCase().includes(normalizedQuery) || t.keywords?.some((k) => k.includes(normalizedQuery)))
        )
      : []
  );

  const matches = $derived([...sections.flatMap((s) => s.tools), ...presetMatches]);
  const chips = [{ value: "all", label: "All" }, ...toolsCategories.map((c) => ({ value: c.id, label: c.name }))];
  const fresh = toolList.filter((t) => t.isNew && !t.alias).slice(0, 4);

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
  }

  function reset() {
    searchQuery = "";
    activeCategory = "all";
    syncUrl();
  }
</script>

<Seo
  title={`All tools: PDF, photos, video, audio and documents | ${config.appName}`}
  isBase
  description="Every tool in one place. Compress, resize, convert and edit PDFs, photos, video, audio and documents on your own device. Free, with no upload and no account."
  keywords={[...config.appKeywords, "file converter", "image compressor", "video converter", "document converter"]}
/>

<div class="mx-auto flex w-full max-w-6xl flex-col px-4 pb-20 pt-6 md:px-8">
  <header class="rise flex flex-col gap-2 pb-6">
    <h1 class="text-balance text-3xl font-medium text-foreground sm:text-5xl">
      <span class="sr-only">All tools for PDFs, photos, videos, audio, documents and forms</span>
      <span aria-hidden="true">
        Do more with your
        <MorphText words={subjects} index={reduceMotion.current ? 0 : undefined} intervalMs={2600} class="text-primary" />
      </span>
    </h1>
    <p class="max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
      {total} tools for PDFs, photos, video, audio and documents. Everything runs on your device, so nothing is uploaded.
    </p>
  </header>

  <div class="sticky top-0 z-10 -mx-4 flex flex-col gap-3 bg-background/90 px-4 py-3 backdrop-blur-xl md:-mx-8 md:px-8">
    <form
      onsubmit={(e) => {
        e.preventDefault();
        openBestMatch();
      }}
    >
      <InputGroup class="h-11">
        <InputGroupAddon><Search /></InputGroupAddon>
        <InputGroupInput
          type="search"
          value={searchQuery}
          oninput={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search, e.g. passport photo"
          aria-label="Search tools"
        />
      </InputGroup>
    </form>
    <ChipGroup name="Tool group" options={chips} value={activeCategory} onchange={setCategory} />
  </div>

  {#if browsing}
    <section class="flex flex-col gap-4 pt-6" aria-label="Collections">
      <CollectionGrid />

      {#if fresh.length > 0}
        <div class="flex flex-col gap-3 pt-6">
          <h2 class="text-xl font-medium text-foreground">New</h2>
          <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {#each fresh as tool, i (tool.slug)}
              <li class="contents"><ToolCard {tool} delay={i * 30} /></li>
            {/each}
          </ul>
        </div>
      {/if}
    </section>
  {/if}

  <div id="library" class="flex flex-col gap-12 pt-10">
    {#if normalizedQuery}
      <p class="text-sm text-muted-foreground" aria-live="polite">
        {matches.length}
        {matches.length === 1 ? "tool matches" : "tools match"} “{searchQuery}”
      </p>
    {/if}

    {#if matches.length === 0}
      <div class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong px-6 py-14 text-center">
        <Search class="size-5 text-muted-foreground" />
        <p class="text-base font-medium text-foreground">No tools found</p>
        <p class="max-w-sm text-pretty text-sm text-muted-foreground">
          Nothing matches “{searchQuery}”. Try another word, or clear the filters to see all {total} tools.
        </p>
        <Button variant="outline" size="sm" class="mt-1" onclick={reset}>Clear filters</Button>
      </div>
    {:else}
      {#each sections as section (section.id)}
        <section class="flex flex-col gap-4" aria-labelledby={`cat-${section.id}`}>
          <div class="flex items-end justify-between gap-4">
            <div>
              <h2 id={`cat-${section.id}`} class="text-xl font-medium text-foreground">{section.name}</h2>
              {#if section.description}
                <p class="mt-0.5 text-sm text-muted-foreground">{section.description}</p>
              {/if}
            </div>
            <span class="shrink-0 text-sm tabular-nums text-muted-foreground">{section.tools.length}</span>
          </div>

          <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {#each section.tools as tool, i (tool.slug)}
              <li class="contents"><ToolCard {tool} delay={Math.min(i, 8) * 30} /></li>
            {/each}
          </ul>
        </section>
      {/each}

      {#if presetMatches.length > 0}
        <section class="flex flex-col gap-4" aria-labelledby="cat-presets">
          <div>
            <h2 id="cat-presets" class="text-xl font-medium text-foreground">Ready-made sizes and formats</h2>
            <p class="mt-0.5 text-sm text-muted-foreground">Presets of the tools above, set up for one job.</p>
          </div>
          <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {#each presetMatches as tool, i (tool.slug)}
              <li class="contents"><ToolCard {tool} delay={Math.min(i, 8) * 30} /></li>
            {/each}
          </ul>
        </section>
      {/if}
    {/if}
  </div>
</div>
