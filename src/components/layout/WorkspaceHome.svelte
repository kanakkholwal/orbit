<script lang="ts">
  import { ToolCard } from "$components/tool";
  import { Badge } from "$components/ui/badge";
  import { Button } from "$components/ui/button";
  import { Card } from "$components/ui/card";
  import StartWithFile from "$components/workspace/StartWithFile.svelte";
  import { toolsCategories } from "$constants/tools";
  import { clearRecentTools, recentTools } from "$lib/runtime/recent-tools.svelte";
  import { workspace } from "$stores/workspace.svelte";
  import { getTool, listedToolCount, type ToolConfig } from "$tools/list";
  import {
    IconArrowRight as ArrowRight,
    IconChevronRight as ChevronRight,
    IconHistory as History,
    IconSearch as Search,
  } from "$lib/icons";

  const popularSlugs = ["merge-pdf", "compress-pdf", "esign-pdf", "pdf-to-docx"];
  const popular = popularSlugs.map((slug) => getTool(slug)).filter((t): t is ToolConfig => t !== null);

  const recent = $derived(
    recentTools.items
      .map((r) => getTool(r.slug))
      .filter((t): t is ToolConfig => t !== null)
      .slice(0, 6)
  );

  const categoryName = (id: string) => toolsCategories.find((c) => c.id === id)?.name ?? "";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return "Working late";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();
</script>

<div class="flex w-full flex-col gap-10">
  <header class="rise flex flex-wrap items-end justify-between gap-4">
    <div class="flex flex-col gap-1">
      <h1 class="text-4xl font-medium text-foreground">{greeting}</h1>
      <p class="text-sm text-muted-foreground md:text-base">
        Pick up where you left off, or start with a file. Everything stays on this device.
      </p>
    </div>
    <Button variant="outline" onclick={() => (workspace.searchOpen = true)} class="w-full sm:w-64 justify-start text-muted-foreground">
      <Search />
      Search {listedToolCount} tools
      <kbd class="ml-auto rounded-sm border border-border bg-muted px-1.5 text-xs">Ctrl K</kbd>
    </Button>
  </header>

  <div class="rise grid grid-cols-1 gap-3 lg:grid-cols-5" style="--i:1">
    <StartWithFile class="lg:col-span-3" />

    <Card variant="framed" class="lg:col-span-2" aria-labelledby="recent-heading">
      <div class="flex h-full flex-col gap-3 rounded-[11px] bg-card p-4 sm:p-5">
        <div class="flex items-center justify-between gap-3">
          <h2 id="recent-heading" class="text-base font-medium text-foreground">Jump back in</h2>
          {#if recent.length > 0}
            <Button variant="ghost" size="xs" onclick={clearRecentTools}>Clear</Button>
          {/if}
        </div>

        {#if recent.length > 0}
          <ul class="-mx-2 flex flex-col gap-0.5">
            {#each recent as tool (tool.slug)}
              <li>
                <a
                  href={`/tools/${tool.slug}`}
                  class="group flex items-center gap-3 rounded-lg px-2 py-2 outline-none transition-colors duration-(--duration-fast) hover:bg-foreground/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <span class="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-foreground group-hover:text-primary">
                    <tool.icon class="size-4" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-medium text-foreground">{tool.title}</span>
                    <span class="block truncate text-xs text-muted-foreground">{categoryName(tool.category)}</span>
                  </span>
                  <ChevronRight class="size-4 shrink-0 text-muted-foreground" />
                </a>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
            <History class="size-5 text-muted-foreground" />
            <p class="max-w-56 text-sm text-muted-foreground">Tools you open will show up here.</p>
          </div>
        {/if}
      </div>
    </Card>
  </div>

  <section class="rise flex flex-col gap-4" aria-labelledby="popular-heading" style="--i:2">
    <div class="flex items-end justify-between gap-4">
      <h2 id="popular-heading" class="text-xl font-medium text-foreground">Popular tools</h2>
      <Button href="/explore" variant="ghost" size="sm">
        All {listedToolCount} tools
        <ArrowRight />
      </Button>
    </div>
    <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {#each popular as tool (tool.slug)}
        <li class="contents"><ToolCard {tool} delay={null} /></li>
      {/each}
    </ul>
  </section>

  <section class="rise flex flex-col gap-4" aria-labelledby="categories-heading" style="--i:3">
    <h2 id="categories-heading" class="text-xl font-medium text-foreground">Browse by category</h2>
    <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {#each toolsCategories as category (category.id)}
        <li>
          <a
            href={`/explore?category=${category.id}`}
            class="group block h-full rounded-2xl border border-border bg-background p-1 outline-none transition-colors duration-(--duration-base) hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div class="flex h-full flex-col gap-3 rounded-[11px] bg-card p-4">
              <span class="flex items-center justify-between">
                <span class="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <category.icon class="size-5" />
                </span>
                <Badge variant="secondary">{category.tools?.length ?? 0} tools</Badge>
              </span>
              <span>
                <span class="block text-base font-medium text-foreground">{category.name}</span>
                <span class="mt-0.5 block text-sm text-muted-foreground">{category.description}</span>
              </span>
            </div>
          </a>
        </li>
      {/each}
    </ul>
  </section>
</div>
