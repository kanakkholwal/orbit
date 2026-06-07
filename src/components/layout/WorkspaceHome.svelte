<script lang="ts">
  import { ToolCard } from "$components/tool";
  import { Input } from "$components/ui/input";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { cn } from "$lib/utils";
  import { toolList } from "$tools/list";
  import { ArrowUpRight, Search } from "@lucide/svelte";
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  let searchQuery = $state("");
  let activeCategory = $state<string>("all");

  let normalizedQuery = $derived(searchQuery.trim().toLowerCase());

  let filteredTools = $derived(
    toolList.filter((t) => {
      const matchesQuery =
        !normalizedQuery ||
        t.title.toLowerCase().includes(normalizedQuery) ||
        t.description.toLowerCase().includes(normalizedQuery) ||
        t.keywords?.some((k) => k.includes(normalizedQuery));
      const matchesCategory =
        activeCategory === "all" || t.category === activeCategory;
      return matchesQuery && matchesCategory;
    })
  );

  let categoryTabs = $derived([
    { id: "all", name: "All", count: toolList.length },
    ...toolsCategories.map((c) => ({
      id: c.id,
      name: c.name,
      count: c.tools?.length ?? 0,
    })),
  ]);

  // Time-aware greeting (local runtime; calm, non-gimmicky).
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return "Working late";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 22) return "Good evening";
    return "Winding down";
  })();
</script>

<div class="flex w-full flex-col gap-10">
  <header
    class="flex flex-col gap-5 border-b border-border/60 pb-8"
    in:fly={{ y: 10, duration: 480, easing: cubicOut }}
  >
    <span class="label-eyebrow text-primary">Workspace</span>
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="flex flex-col gap-2">
        <h1
          class="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          {greeting}.
        </h1>
        <p class="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Pick a tool. Drop a file. Everything stays on this device.
        </p>
      </div>

      <div class="relative w-full lg:w-80">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Search {toolList.length} tools…"
          bind:value={searchQuery}
          class="h-10 rounded-md pl-9 pr-12 text-sm placeholder:text-muted-foreground/60"
        />
        <kbd
          class="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-xs border border-border/60 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 lg:inline-block"
        >
          /
        </kbd>
      </div>
    </div>
  </header>

  <nav
    class="-mx-1 flex flex-wrap items-center gap-1 overflow-x-auto px-1 pb-1 sm:overflow-visible"
    in:fly={{ y: 8, duration: 480, delay: 80, easing: cubicOut }}
  >
    {#each categoryTabs as tab (tab.id)}
      <button
        type="button"
        onclick={() => (activeCategory = tab.id)}
        aria-pressed={activeCategory === tab.id}
        class={cn(
          "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 active:scale-[0.97]",
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

  <section in:fly={{ y: 10, duration: 480, delay: 140, easing: cubicOut }}>
    <div
      class="mb-6 flex items-baseline justify-between border-b border-border/60 pb-3"
    >
      <span class="label-eyebrow text-muted-foreground">
        {activeCategory === "all"
          ? "All tools"
          : toolsCategories.find((c) => c.id === activeCategory)?.name}
      </span>
      <span class="font-mono text-[11px] tabular-nums text-muted-foreground/50">
        {String(filteredTools.length).padStart(2, "0")} / {String(
          toolList.length
        ).padStart(2, "0")}
      </span>
    </div>

    {#if filteredTools.length === 0}
      <div
        class="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-6 py-16 text-center"
      >
        <Search class="size-5 text-muted-foreground/50" />
        <p class="label-eyebrow text-muted-foreground/70">No matches</p>
        <p class="max-w-xs text-sm text-muted-foreground">
          Nothing found for
          <span class="font-mono text-foreground">"{searchQuery}"</span>. Try a
          different keyword or clear the filter.
        </p>
        <button
          type="button"
          onclick={() => {
            searchQuery = "";
            activeCategory = "all";
          }}
          class="mt-2 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-primary transition-colors hover:text-primary/80"
        >
          Reset filters
          <ArrowUpRight class="size-3" />
        </button>
      </div>
    {:else}
      <ul
        class="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {#each filteredTools as tool, i (tool.slug)}
          <li class="contents">
            <ToolCard {tool} index={i} delay={40 + (i % 12) * 30} />
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>
