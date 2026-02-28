<script lang="ts">
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { Button } from "$components/ui/button";
  import Input from "$components/ui/input/input.svelte";
  import { toolsCategories } from "$constants/tools";
  import { ArrowRight, ArrowUpRight, Search, Sparkles } from "@lucide/svelte";

  // Initialize both from the URL parameters
  let searchQuery = $state(page.url.searchParams.get("search") || "");
  let activeCategory = $state(page.url.searchParams.get("category") || "all");

  let filteredCategories = $derived(
    toolsCategories
      .map((cat) => {
        if (activeCategory !== "all" && cat.id !== activeCategory) return null;

        const matchingTools = cat.tools?.filter(
          (tool) =>
            tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase()),
        );

        return matchingTools?.length! > 0
          ? { ...cat, tools: matchingTools }
          : null;
      })
      .filter(Boolean),
  );

  function updateCategory(category: string) {
    const url = new URL(page.url);
    if (category === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", category);
    }
    activeCategory = category;
    replaceState(url.href, { scroll: false });
  }

  function handleSearchInput(query: string) {
    const url = new URL(page.url);
    if (query) {
      url.searchParams.set("search", query);
    } else {
      url.searchParams.delete("search");
    }
    searchQuery = query; // Ensure Svelte state stays in sync
    replaceState(url.href, { scroll: false });
  }
</script>

<main
  class="relative z-10 container mx-auto px-4 py-24 md:py-32 pt-10! max-w-app @container"
>
  <div
    class="flex flex-col @4xl:flex-row items-start @4xl:items-end justify-between gap-6 mb-16"
  >
    <div class="max-w-2xl">
      <div
        class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm mb-4"
      >
        <Sparkles size={12} />
        <span>Explore Library</span>
      </div>
      <h1
        class="text-4xl @4xl:text-5xl font-extrabold tracking-tight text-foreground mb-4"
      >
        Everything you need <br />
        <span
          class="text-transparent bg-clip-text bg-linear-to-r from-primary to-sky-600"
          >to master PDFs.</span
        >
      </h1>
      <p class="text-lg text-muted-foreground">
        Browser-based tools for every workflow. Secure, fast, and free.
      </p>
    </div>

    <div class="w-full @4xl:w-auto relative group flex items-center mt-auto">
      <Search
        size={18}
        class="size-7 my-auto text-primary absolute z-5 inset-y-0 left-0 pl-3 pointer-events-none group-focus-within:text-primary transition-colors"
      />
      <Input
        type="search"
        name="explore-search"
        value={searchQuery}
        oninput={(e) => handleSearchInput(e.currentTarget.value)}
        placeholder="Search tools (e.g. 'Merge')..."
        class="w-full md:w-80 rounded-xl pl-10 pr-4 py-3 text-sm font-medium shadow-sm backdrop-blur-md outline-none bg-card"
      />
    </div>
  </div>

  <div
    class="flex flex-wrap items-center gap-2 mb-12 border-b border-border/60 pb-6"
  >
    <Button
      variant={activeCategory === "all" ? "dark" : "secondary"}
      class="rounded-full"
      onclick={() => updateCategory("all")}
    >
      All Tools
    </Button>
    {#each toolsCategories as cat}
      <Button
        variant={activeCategory === cat.id ? "dark" : "ghost"}
        class="rounded-full"
        onclick={() => updateCategory(cat.id)}
      >
        {cat.name}
      </Button>
    {/each}
  </div>

  <div class="space-y-16">
    {#if filteredCategories.length === 0}
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div
          class="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground mb-4"
        >
          <Search size={24} />
        </div>
        <h3 class="text-lg font-semibold text-foreground">No tools found</h3>
        <p class="text-muted-foreground">
          Try searching for something else like "Split" or "Protect".
        </p>
      </div>
    {/if}

    {#each filteredCategories as category}
      <section class="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-foreground tracking-tight">
              {category?.name}
            </h2>
            <p class="text-muted-foreground text-sm">
              {category?.description}
            </p>
          </div>
          {#if activeCategory === "all"}
            <button
              onclick={() => updateCategory(category?.id || "all")}
              class="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all <ArrowRight size={14} />
            </button>
          {/if}
        </div>

        <div
          class="grid grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4 gap-5"
        >
          {#each category?.tools as tool}
            <a
              href={`/tools/${tool.slug}`}
              class="group flex flex-col justify-between p-5 rounded-xl border border-border bg-card/80 hover:bg-secondary/80 transition-colors relative overflow-hidden"
            >
              <div class="flex items-start justify-between mb-4">
                <div
                  class={`p-2.5 rounded-lg ${tool.color} bg-opacity-10 text-current`}
                >
                  {#if tool.icon}
                    {@const Icon = tool.icon}
                    <Icon size={20} />
                  {/if}
                </div>
                <ArrowUpRight
                  size={18}
                  class="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>

              <div>
                <h3 class="font-bold text-foreground mb-1">{tool.title}</h3>
                <p
                  class="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
                >
                  {tool.description}
                </p>
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/each}
  </div>
</main>
