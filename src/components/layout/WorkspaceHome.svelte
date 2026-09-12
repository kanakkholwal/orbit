<script lang="ts">
  import { ToolCard } from "$components/tool";
  import StartWithFile from "$components/workspace/StartWithFile.svelte";
  import { toolsCategories } from "$constants/tools";
  import { clearRecentTools, recentTools } from "$lib/runtime/recent-tools.svelte";
  import { getTool, toolList, type ToolConfig } from "$tools/list";
  import { IconArrowRight as ArrowRight, IconChevronRight as ChevronRight, IconHistory as History } from "@tabler/icons-svelte";

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
  <header class="flex flex-col gap-1">
    <h1 class="text-heading-lg font-medium text-foreground">{greeting}</h1>
    <p class="text-body text-muted-foreground md:text-body-lg">
      Pick up where you left off, or start with a file. Everything stays on this device.
    </p>
  </header>

  <div class="grid grid-cols-1 gap-3 lg:grid-cols-5">
    <StartWithFile class="lg:col-span-3" />

    <section class="panel-card flex flex-col p-4 sm:p-5 lg:col-span-2" aria-labelledby="recent-heading">
      <div class="flex items-center justify-between gap-3">
        <h2 id="recent-heading" class="text-body-lg font-medium text-foreground">Jump back in</h2>
        {#if recent.length > 0}
          <button
            type="button"
            onclick={clearRecentTools}
            class="rounded-md px-1.5 py-0.5 text-caption text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear
          </button>
        {/if}
      </div>

      {#if recent.length > 0}
        <ul class="-mx-2 mt-3 flex flex-col gap-0.5">
          {#each recent as tool (tool.slug)}
            <li>
              <a
                href={`/tools/${tool.slug}`}
                class="group flex items-center gap-3 rounded-lg px-2 py-2 outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <span class="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-foreground group-hover:text-primary">
                  <tool.icon class="size-4" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-body font-medium text-foreground">{tool.title}</span>
                  <span class="block truncate text-caption text-muted-foreground">{categoryName(tool.category)}</span>
                </span>
                <ChevronRight class="size-4 shrink-0 text-muted-foreground" />
              </a>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <History class="size-5 text-muted-foreground" />
          <p class="max-w-56 text-body text-muted-foreground">Tools you open will show up here.</p>
        </div>
      {/if}
    </section>
  </div>

  <section class="flex flex-col gap-4" aria-labelledby="popular-heading">
    <div class="flex items-end justify-between gap-4">
      <h2 id="popular-heading" class="text-subheading font-medium text-foreground">Popular tools</h2>
      <a
        href="/explore"
        class="flex items-center gap-1 rounded-md text-body text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        All {toolList.length} tools
        <ArrowRight class="size-4" />
      </a>
    </div>
    <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {#each popular as tool (tool.slug)}
        <li class="contents"><ToolCard {tool} delay={null} /></li>
      {/each}
    </ul>
  </section>

  <section class="flex flex-col gap-4" aria-labelledby="categories-heading">
    <h2 id="categories-heading" class="text-subheading font-medium text-foreground">Browse by category</h2>
    <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {#each toolsCategories as category (category.id)}
        <li>
          <a
            href={`/explore?category=${category.id}`}
            class="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span class="flex items-center justify-between">
              <span class="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <category.icon class="size-5" />
              </span>
              <span class="text-caption tabular-nums text-muted-foreground">{category.tools?.length ?? 0} tools</span>
            </span>
            <span>
              <span class="block text-body-lg font-medium text-foreground">{category.name}</span>
              <span class="mt-0.5 block text-body text-muted-foreground">{category.description}</span>
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </section>
</div>
