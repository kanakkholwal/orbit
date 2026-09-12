<script lang="ts">
  import { Button } from "$components/ui/button";
  import { categories } from "$constants/tools";
  import { toolList } from "$tools/list";
  import {
    IconArrowRight as ArrowRight,
    IconLayoutGrid as All,
    IconLock as Lock,
    IconSearch as Search,
  } from "@tabler/icons-svelte";

  const MAX_RESULTS = 25;

  const filters = [
    { id: "all", name: "All tools", icon: All },
    ...categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
  ];

  let query = $state("");
  let category = $state("all");
  let previewSlug = $state<string | null>(null);

  const results = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return toolList
      .filter((t) => category === "all" || t.category === category)
      .filter(
        (t) =>
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.keywords?.some((k) => k.includes(q))
      )
      .slice(0, MAX_RESULTS);
  });

  const specimen = $derived(
    results.find((t) => t.slug === previewSlug) ?? results[0] ?? toolList[0]
  );
  const specimenCategory = $derived(
    categories.find((c) => c.id === specimen.category)?.name ?? "Tool"
  );
  const activeIndex = $derived(filters.findIndex((f) => f.id === category));
</script>

<div class="flex h-full flex-col gap-5 py-6 lg:flex-row">
  <article
    class="relative flex min-h-100 flex-col overflow-hidden rounded-2xl border border-border bg-card lg:min-h-0 lg:w-1/2"
  >
    <div aria-hidden="true" class="plate-grid absolute inset-0"></div>
    {#each ["left-4 top-4 border-l border-t", "right-4 top-4 border-r border-t", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"] as corner (corner)}
      <span aria-hidden="true" class="absolute size-4 border-border-strong {corner}"></span>
    {/each}

    <header class="relative flex items-start justify-between gap-4 px-8 pt-8">
      <div class="min-w-0">
        <p class="truncate text-body font-medium text-foreground">{specimenCategory}</p>
        <p class="mt-1 text-caption text-muted-foreground">Hover a tool to preview it</p>
      </div>
      <span class="flex shrink-0 items-center gap-1.5 text-caption font-medium text-primary">
        <Lock class="size-3.5" />
        Stays on your device
      </span>
    </header>

    <div class="relative grid flex-1 place-items-center p-8">
      <div
        class="grid size-36 place-items-center rounded-3xl border-2 border-foreground bg-card text-foreground shadow-md sm:size-44"
      >
        <specimen.icon class="size-16 sm:size-20" stroke={1.5} />
      </div>
    </div>

    <footer class="relative flex flex-col gap-4 px-8 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <h3 class="text-subheading font-medium text-foreground">{specimen.title}</h3>
        <p class="mt-1 line-clamp-2 max-w-md text-body text-muted-foreground">
          {specimen.description}
        </p>
      </div>
      <Button href={`/tools/${specimen.slug}`} variant="outline" class="shrink-0">
        Open tool
        <ArrowRight />
      </Button>
    </footer>
  </article>

  <div class="panel-brand-tall flex items-center justify-center rounded-2xl p-2 sm:p-6 md:p-10 lg:w-1/2">
    <div
      class="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-[2px]"
    >
      <label
        class="flex h-11 items-center overflow-hidden rounded-xl border border-white/40 bg-white/80 text-fixed-dark focus-within:ring-2 focus-within:ring-white"
      >
        <span class="flex h-full items-center px-3">
          <Search class="size-4" />
        </span>
        <span class="sr-only">Search tools</span>
        <input
          type="search"
          bind:value={query}
          oninput={() => (previewSlug = null)}
          placeholder="Search for tools..."
          class="h-full min-w-0 flex-1 bg-transparent pr-4 pl-2 text-body text-fixed-dark outline-none placeholder:text-neutral-600"
        />
      </label>

      <div class="mb-3 mt-4 flex min-h-50 flex-col sm:mb-4 sm:mt-6 sm:min-h-115 md:min-h-82.5">
        {#if results.length > 0}
          <ul
            class="grid flex-1 grid-cols-3 content-start justify-items-center gap-2 px-1 sm:grid-cols-4 sm:gap-3 sm:px-0 md:grid-cols-5"
          >
            {#each results as tool, i (tool.slug)}
              <li class="w-14 {i >= 9 ? 'hidden sm:block' : ''}">
                <a
                  href={`/tools/${tool.slug}`}
                  onpointerenter={() => (previewSlug = tool.slug)}
                  onfocus={() => (previewSlug = tool.slug)}
                  class="group flex flex-col items-center gap-1 outline-none"
                  aria-current={specimen.slug === tool.slug ? "true" : undefined}
                >
                  <span
                    class="grid size-10 place-items-center rounded-lg bg-white/60 text-fixed-dark transition-colors duration-200 group-hover:bg-white group-focus-visible:ring-2 group-focus-visible:ring-white group-aria-current:bg-white"
                  >
                    <tool.icon class="size-5" />
                  </span>
                  <span class="w-full truncate text-center text-caption text-white">{tool.title}</span>
                </a>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="flex flex-1 items-center justify-center text-center text-body text-white">
            No tools match “{query}”.
          </p>
        {/if}
      </div>

      <div class="mt-4 border-t border-white/25 pt-4">
        <div class="rounded-xl bg-white">
          <div
            class="segment-track relative grid w-full gap-1 rounded-xl bg-black/10 p-1"
            style:grid-template-columns={`repeat(${filters.length}, minmax(0, 1fr))`}
            role="group"
            aria-label="Filter by category"
          >
            <span
              aria-hidden="true"
              class="segment-thumb absolute inset-y-1 left-1 rounded-xl bg-neutral-100 transition-transform duration-300 ease-craft"
              style:width={`calc((100% - 0.5rem - ${filters.length - 1} * 0.25rem) / ${filters.length})`}
              style:transform={`translateX(calc(${activeIndex} * (100% + 0.25rem)))`}
            ></span>
            {#each filters as filter (filter.id)}
              <button
                type="button"
                aria-pressed={category === filter.id}
                aria-label={filter.name}
                title={filter.name}
                onclick={() => {
                  category = filter.id;
                  previewSlug = null;
                }}
                class="relative z-10 flex items-center justify-center rounded-xl py-2.5 transition-[color,transform] duration-150 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary {category === filter.id ? 'text-fixed-dark' : 'text-neutral-500'}"
              >
                <filter.icon class="size-5" />
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .plate-grid {
    background-image:
      linear-gradient(to right, var(--border) 1px, transparent 1px),
      linear-gradient(to bottom, var(--border) 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.5;
  }

  .segment-track {
    box-shadow:
      0 1px 0 rgb(255 255 255 / 0.25),
      inset 0 1px 2px rgb(0 0 0 / 0.15);
  }

  .segment-thumb {
    box-shadow:
      0.6px 0.6px 0.9px -1px rgb(0 0 0 / 0.18),
      1.3px 1.3px 1.9px -1.5px rgb(0 0 0 / 0.25),
      3px 3px 4px -2px rgb(0 0 0 / 0.1),
      -0.5px -0.5px 0 rgb(0 0 0 / 0.1),
      inset 0.5px 0.5px 1px #fff,
      inset -0.5px -0.5px 1px rgb(0 0 0 / 0.15);
  }
</style>
