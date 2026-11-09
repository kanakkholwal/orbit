<script lang="ts">
  import { page } from "$app/state";
  import { Input } from "$components/ui/input";
  import { toolsCategories } from "$constants/tools";
  import { IconArrowRight as ArrowRight, IconChevronRight as Chevron, IconSearch as Search } from "$lib/icons";
  import { cn } from "$lib/utils";

  let { class: className, onnavigate }: { class?: string; onnavigate?: () => void } = $props();

  let query = $state("");
  let open = $state<string[]>([]);

  const path = $derived(page.url.pathname);
  const currentCategory = $derived(
    toolsCategories.find((c) => (c.tools ?? []).some((t) => path === `/tools/${t.slug}`))?.id
  );

  $effect(() => {
    const id = currentCategory ?? toolsCategories[0]?.id;
    if (id && !open.includes(id)) open = [...open, id];
  });

  const groups = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return toolsCategories
      .map((c) => ({
        id: c.id,
        name: c.name,
        total: c.tools?.length ?? 0,
        tools: (c.tools ?? []).filter(
          (t) => !q || t.title.toLowerCase().includes(q) || t.keywords?.some((k) => k.includes(q))
        ),
      }))
      .filter((g) => g.tools.length > 0);
  });

  const searching = $derived(query.trim().length > 0);
  const isOpen = (id: string) => searching || open.includes(id);
  const toggle = (id: string) => (open = open.includes(id) ? open.filter((o) => o !== id) : [...open, id]);
</script>

<div class={cn("flex h-full min-h-0 flex-col", className)}>
  <div class="relative px-2 pb-1 pt-2">
    <Search class="pointer-events-none absolute left-4.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
    <Input bind:value={query} type="search" placeholder="Filter tools" aria-label="Filter tools" size="sm" class="pl-7" />
  </div>

  <div class="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-1">
    {#if groups.length === 0}
      <p class="px-2 py-4 text-sm text-muted-foreground">No tools match “{query}”.</p>
    {/if}

    {#each groups as group (group.id)}
      {@const expanded = isOpen(group.id)}
      <section class="pb-0.5" aria-labelledby={`panel-${group.id}`}>
        <h3 id={`panel-${group.id}`}>
          <button
            type="button"
            aria-expanded={expanded}
            onclick={() => toggle(group.id)}
            class="flex h-7 w-full items-center gap-1.5 rounded-md px-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors duration-(--duration-fast) hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <Chevron class={cn("size-3 shrink-0 transition-transform duration-(--duration-fast)", expanded && "rotate-90")} />
            <span class="truncate">{group.name}</span>
            <span class="ml-auto tabular-nums font-normal">{group.total}</span>
          </button>
        </h3>

        <div
          class={cn(
            "grid transition-[grid-template-rows] duration-(--duration-base) ease-(--ease-ui-out)",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
          inert={!expanded}
        >
          <ul class="min-h-0 overflow-hidden">
            {#each group.tools as tool (tool.slug)}
              {@const active = path === `/tools/${tool.slug}`}
              <li>
                <a
                  href={`/tools/${tool.slug}`}
                  onclick={onnavigate}
                  aria-current={active ? "page" : undefined}
                  class={cn(
                    "flex h-7 items-center gap-2 rounded-md px-2 text-[13px] outline-none transition-colors duration-(--duration-fast) focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    active
                      ? "bg-foreground/[0.06] font-medium text-foreground"
                      : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                  )}
                >
                  <tool.icon class={cn("size-3.5 shrink-0", active && "text-primary")} />
                  <span class="truncate">{tool.title}</span>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </section>
    {/each}
  </div>

  <div class="border-t border-border p-2">
    <a
      href="/explore"
      onclick={onnavigate}
      class="flex h-7 items-center justify-between rounded-md px-2 text-[13px] text-muted-foreground outline-none transition-colors hover:bg-foreground/[0.04] hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      Browse all tools
      <ArrowRight class="size-3.5" />
    </a>
  </div>
</div>
