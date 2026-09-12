<script lang="ts">
  import Logo from "$components/Logo.svelte";
  import Seo from "$components/Seo.svelte";
  import ThemeToggle from "$components/ThemeToggle.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { recentTools } from "$lib/runtime/recent-tools.svelte";
  import { cn } from "$lib/utils";
  import { getTool, toolList } from "$tools/list";
  import {
    IconArrowUpRight as ArrowUpRight,
    IconLayoutGrid as All,
    IconLock as Lock,
    IconSearch as Search,
    IconX as X,
  } from "@tabler/icons-svelte";

  /** True when a web visitor previews the desktop home via `?mode=desktop`. */
  let { preview = false }: { preview?: boolean } = $props();

  const quickSlugs = ["merge-pdf", "compress-pdf", "esign-pdf", "pdf-to-docx"];
  const quickActions = quickSlugs.map((slug) => getTool(slug)).filter((t) => t !== null);

  let query = $state("");
  let category = $state("all");
  let searchInput = $state<HTMLInputElement | null>(null);

  const recent = $derived(recentTools.items.map((r) => getTool(r.slug)).filter((t) => t !== null).slice(0, 4));

  const categories = $derived([
    { id: "all", name: "All tools", count: toolList.length, icon: All },
    ...toolsCategories.map((c) => ({ id: c.id, name: c.name, count: c.tools?.length ?? 0, icon: c.icon })),
  ]);

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return toolList.filter(
      (t) =>
        (category === "all" || t.category === category) &&
        (!q || t.title.toLowerCase().includes(q) || t.keywords?.some((k) => k.includes(q)))
    );
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return "Working late";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  function onKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement | null;
    const typing = target?.closest("input, textarea, [contenteditable='true']");
    if (e.key === "/" && !typing) {
      e.preventDefault();
      searchInput?.focus();
    }
    if (e.key === "Escape" && document.activeElement === searchInput) {
      query = "";
      searchInput?.blur();
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<Seo title={`${config.appName} for desktop`} description={config.appDescription} keywords={config.appKeywords} />

<div class={cn("flex w-full flex-col bg-canvas", preview ? "min-h-screen" : "h-full overflow-y-auto")}>
  <header
    class="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl"
  >
    <a href={preview ? "/?mode=desktop" : "/"} class="flex shrink-0 items-center rounded-md" aria-label={`${config.appName} home`}>
      <Logo size="xs" />
    </a>

    <label
      class="mx-auto flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-ring"
    >
      <Search class="size-4 shrink-0 text-muted-foreground" />
      <span class="sr-only">Search tools</span>
      <input
        bind:this={searchInput}
        bind:value={query}
        type="search"
        placeholder={`Search ${toolList.length} tools`}
        class="h-full min-w-0 flex-1 bg-transparent text-body text-foreground outline-none"
      />
      <kbd class="rounded-sm border border-border bg-muted px-1.5 font-mono text-caption text-muted-foreground">/</kbd>
    </label>

    <div class="flex shrink-0 items-center gap-1.5">
      {#if preview}
        <Button href="/" variant="ghost" size="sm" class="text-muted-foreground">
          <X />
          Exit preview
        </Button>
      {/if}
      <ThemeToggle class="size-9 rounded-md hover:bg-muted" />
    </div>
  </header>

  <div class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10">
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-heading-lg font-medium text-foreground">
          {greeting}
        </h1>
        <p class="mt-2 text-body text-muted-foreground md:text-body-lg">
          Pick a tool to get started. Everything stays on this computer.
        </p>
      </div>
      <span
        class="flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-caption font-medium text-muted-foreground"
      >
        <Lock class="size-3.5 text-primary" />
        Private and offline
      </span>
    </section>

    {#if !query}
      <section aria-labelledby="quick-actions" class="flex flex-col gap-3">
        <h2 id="quick-actions" class="text-body font-medium text-foreground">
          {recent.length > 0 ? "Jump back in" : "Popular tools"}
        </h2>
        <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {#each recent.length > 0 ? recent : quickActions as tool (tool.slug)}
            <li>
              <a
                href={`/tools/${tool.slug}`}
                class="panel-card group flex h-full flex-col gap-4 p-5 transition-[box-shadow,transform] duration-200 ease-craft hover:shadow-lg active:scale-[0.98]"
              >
                <span class="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <tool.icon class="size-5" />
                </span>
                <span>
                  <span class="flex items-center justify-between gap-2 text-body-lg font-medium text-foreground">
                    {tool.title}
                    <ArrowUpRight class="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </span>
                  <span class="mt-1 line-clamp-2 block text-body text-muted-foreground">
                    {tool.description.split(". ")[0]}
                  </span>
                </span>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <section aria-labelledby="all-tools" class="flex flex-col gap-6 lg:flex-row lg:gap-10">
      <nav class="shrink-0 lg:w-56" aria-label="Categories">
        <h2 id="all-tools" class="mb-3 text-body font-medium text-foreground">Browse</h2>
        <ul class="flex gap-1 overflow-x-auto pb-1 lg:sticky lg:top-20 lg:flex-col lg:overflow-visible">
          {#each categories as c (c.id)}
            <li class="shrink-0">
              <button
                type="button"
                aria-pressed={category === c.id}
                onclick={() => (category = c.id)}
                class={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-body transition-colors duration-200",
                  category === c.id
                    ? "bg-card font-medium text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <c.icon class={cn("size-4 shrink-0", category === c.id && "text-primary")} />
                <span class="flex-1 whitespace-nowrap">{c.name}</span>
                <span class="text-caption tabular-nums text-muted-foreground">{c.count}</span>
              </button>
            </li>
          {/each}
        </ul>
      </nav>

      <div class="min-w-0 flex-1">
        {#if filtered.length === 0}
          <div class="panel-card flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Search class="size-5 text-muted-foreground" />
            <p class="text-body text-muted-foreground">No tools match “{query}”.</p>
            <Button
              variant="outline"
              size="sm"
              onclick={() => {
                query = "";
                category = "all";
              }}
            >
              Clear search
            </Button>
          </div>
        {:else}
          <ul class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {#each filtered as tool (tool.slug)}
              <li>
                <a
                  href={`/tools/${tool.slug}`}
                  class="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors duration-200 hover:border-border hover:bg-card"
                >
                  <span
                    class="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-foreground transition-colors group-hover:text-primary"
                  >
                    <tool.icon class="size-4.5" />
                  </span>
                  <span class="min-w-0">
                    <span class="block truncate text-body font-medium text-foreground">{tool.title}</span>
                    <span class="block truncate text-caption text-muted-foreground">
                      {toolsCategories.find((c) => c.id === tool.category)?.name}
                    </span>
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </section>
  </div>
</div>
