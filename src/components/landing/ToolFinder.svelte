<script lang="ts">
  import { ChipGroup, ToolCard } from "$components/tool";
  import { SectionHeader } from "$components/site";
  import { Button } from "$components/ui/button";
  import { InputGroup, InputGroupAddon, InputGroupInput } from "$components/ui/input-group";
  import { toolsCategories } from "$constants/tools";
  import { IconArrowRight as ArrowRight, IconSearch as Search } from "$lib/icons";
  import { toolList } from "$tools/list";

  const MAX = 8;
  const chips = [{ value: "all", label: "All" }, ...toolsCategories.map((c) => ({ value: c.id, label: c.name }))];

  let query = $state("");
  let group = $state("all");

  const q = $derived(query.trim().toLowerCase());
  // Menu tools by default; a search also looks through the ready-made presets.
  const pool = $derived(
    q ? toolList : toolsCategories.flatMap((c) => c.tools ?? [])
  );
  const matches = $derived.by(() => {
    const found = pool
      .filter((t) => group === "all" || t.category === group)
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.keywords?.some((k) => k.includes(q)));
    if (q || group !== "all") return found;
    // Without a search, mix the groups so the first row is not all PDF tools.
    const lanes = toolsCategories.map((c) => [...(c.tools ?? [])]);
    const mixed: typeof found = [];
    while (lanes.some((l) => l.length > 0)) for (const lane of lanes) if (lane.length > 0) mixed.push(lane.shift()!);
    return mixed;
  });
  const shown = $derived(matches.slice(0, MAX));
  const seeAll = $derived(`/explore${q ? `?search=${encodeURIComponent(query.trim())}` : group !== "all" ? `?category=${group}` : ""}`);
</script>

<div class="flex flex-col gap-6">
  <SectionHeader eyebrow="Find a tool" title="What do you want" accent="to do?" />

  <div class="flex flex-col gap-3">
    <InputGroup class="h-11">
      <InputGroupAddon><Search /></InputGroupAddon>
      <InputGroupInput bind:value={query} type="search" placeholder="Search, e.g. compress photo or merge pdf" aria-label="Search tools" />
    </InputGroup>
    <ChipGroup name="Tool group" options={chips} value={group} onchange={(v) => (group = v)} />
  </div>

  {#if shown.length > 0}
    <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {#each shown as tool (tool.slug)}
        <li class="contents"><ToolCard {tool} delay={null} /></li>
      {/each}
    </ul>
    <div class="flex items-center justify-between gap-4">
      <p class="text-sm text-muted-foreground" aria-live="polite">
        {matches.length > MAX ? `Showing ${MAX} of ${matches.length}` : `${matches.length} ${matches.length === 1 ? "tool" : "tools"}`}
      </p>
      <Button href={seeAll} variant="outline" size="sm">
        See all
        <ArrowRight />
      </Button>
    </div>
  {:else}
    <p class="rounded-2xl border border-dashed border-border-strong px-6 py-10 text-center text-sm text-muted-foreground">
      No tools match “{query}”. Try a shorter word.
    </p>
  {/if}
</div>
