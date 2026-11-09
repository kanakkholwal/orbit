<script lang="ts">
  import { CtaBanner, CtaBannerGrain } from "$components/blocks/cta-banner";
  import { Button } from "$components/ui/button";
  import { InputGroup, InputGroupAddon, InputGroupInput } from "$components/ui/input-group";
  import { ToggleGroup, ToggleGroupItem } from "$components/ui/toggle-group";
  import { categories } from "$constants/tools";
  import { toolList } from "$tools/list";
  import {
    IconArrowRight as ArrowRight,
    IconLayoutGrid as All,
    IconLock as Lock,
    IconSearch as Search,
  } from "$lib/icons";

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
</script>

<div class="flex h-full flex-col gap-5 py-6 lg:flex-row">
  <article
    class="relative flex min-h-100 flex-col overflow-hidden rounded-2xl border border-border bg-background lg:min-h-0 lg:w-1/2"
  >
    {#each ["left-4 top-4 border-l border-t", "right-4 top-4 border-r border-t", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"] as corner (corner)}
      <span aria-hidden="true" class="absolute size-4 border-border-strong {corner}"></span>
    {/each}

    <header class="relative flex items-start justify-between gap-4 px-8 pt-8">
      <div class="min-w-0">
        <p class="truncate text-sm font-medium text-foreground">{specimenCategory}</p>
        <p class="mt-1 text-xs text-muted-foreground">Hover a tool to preview it</p>
      </div>
      <span class="flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary">
        <Lock class="size-3.5" />
        Stays on your device
      </span>
    </header>

    <div class="relative grid flex-1 place-items-center p-8">
      <div
        class="grid size-36 place-items-center rounded-3xl border-2 border-foreground bg-card text-foreground shadow-md sm:size-44"
      >
        <specimen.icon class="size-16 sm:size-20" />
      </div>
    </div>

    <footer class="relative flex flex-col gap-4 px-8 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <h3 class="text-xl font-medium text-foreground">{specimen.title}</h3>
        <p class="mt-1 line-clamp-2 max-w-md text-sm text-muted-foreground">
          {specimen.description}
        </p>
      </div>
      <Button href={`/tools/${specimen.slug}`} variant="outline" class="shrink-0">
        Open tool
        <ArrowRight />
      </Button>
    </footer>
  </article>

  <CtaBanner variant="grain" class="flex items-center justify-center p-2 sm:p-6 md:p-10 lg:w-1/2">
    <CtaBannerGrain />
    <div
      class="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-[2px]"
    >
      <InputGroup size="lg">
        <InputGroupAddon><Search /></InputGroupAddon>
        <InputGroupInput
          type="search"
          bind:value={query}
          oninput={() => (previewSlug = null)}
          placeholder="Search for tools..."
          aria-label="Search tools"
        />
      </InputGroup>

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
                    class="grid size-10 place-items-center rounded-lg bg-white/60 text-neutral-950 transition-colors duration-(--duration-base) group-hover:bg-white group-focus-visible:ring-2 group-focus-visible:ring-white group-aria-current:bg-white"
                  >
                    <tool.icon class="size-5" />
                  </span>
                  <span class="w-full truncate text-center text-xs text-white">{tool.title}</span>
                </a>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="flex flex-1 items-center justify-center text-center text-sm text-white">
            No tools match “{query}”.
          </p>
        {/if}
      </div>

      <div class="mt-4 border-t border-white/25 pt-4">
        <ToggleGroup
          type="single"
          variant="segmented"
          label="Filter by category"
          value={category}
          onValueChange={(v) => {
            if (typeof v === "string" && v) {
              category = v;
              previewSlug = null;
            }
          }}
          class="w-full"
        >
          {#each filters as filter (filter.id)}
            <ToggleGroupItem value={filter.id} aria-label={filter.name} title={filter.name} class="flex-1">
              <filter.icon />
            </ToggleGroupItem>
          {/each}
        </ToggleGroup>
      </div>
    </div>
  </CtaBanner>
</div>
