<script lang="ts">
  import { page } from "$app/state";
  import { toolsCategories } from "$constants/tools";
  import { cn } from "$lib/utils";
  import { toolList } from "$tools/list";
  import { IconArrowRight as ArrowRight, IconSearch as Search, IconX as X } from "@tabler/icons-svelte";

  let { class: className, onnavigate }: { class?: string; onnavigate?: () => void } = $props();

  let query = $state("");
  const path = $derived(page.url.pathname);

  const groups = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return toolsCategories
      .map((c) => ({
        id: c.id,
        name: c.name,
        tools: (c.tools ?? []).filter(
          (t) => !q || t.title.toLowerCase().includes(q) || t.keywords?.some((k) => k.includes(q))
        ),
      }))
      .filter((g) => g.tools.length > 0);
  });
</script>

<div class={cn("flex h-full min-h-0 flex-col", className)}>
  <div class="flex flex-col gap-3 px-3 pb-3 pt-3">
    <div class="flex items-baseline justify-between px-1">
      <h2 class="text-body font-medium text-foreground">Tools</h2>
      <span class="text-caption tabular-nums text-muted-foreground">{toolList.length}</span>
    </div>
    <label
      class="flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-2.5 transition-colors duration-150 focus-within:border-ring"
    >
      <Search class="size-4 shrink-0 text-muted-foreground" />
      <span class="sr-only">Filter tools</span>
      <input
        bind:value={query}
        type="search"
        placeholder="Filter tools"
        id="tools-filter"
        class="h-full min-w-0 flex-1 bg-transparent text-body text-foreground placeholder:text-placeholder focus:outline-none"
      />
      {#if query}
        <button
          type="button"
          onclick={() => (query = "")}
          aria-label="Clear filter"
          class="grid size-6 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X class="size-3.5" />
        </button>
      {/if}
    </label>
  </div>

  <div class="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
    {#if groups.length === 0}
      <p class="px-1 py-6 text-body text-muted-foreground">No tools match “{query}”.</p>
    {/if}
    {#each groups as group (group.id)}
      <section class="flex flex-col gap-0.5 pb-4" aria-labelledby={`panel-${group.id}`}>
        <h3 id={`panel-${group.id}`} class="px-2 pb-1 text-caption font-medium text-muted-foreground">
          {group.name}
        </h3>
        <ul class="flex flex-col gap-0.5">
          {#each group.tools as tool (tool.slug)}
            {@const active = path === `/tools/${tool.slug}`}
            <li>
              <a
                href={`/tools/${tool.slug}`}
                onclick={onnavigate}
                aria-current={active ? "page" : undefined}
                class={cn(
                  "flex min-h-9 items-center gap-2.5 rounded-lg px-2 text-body outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <tool.icon class={cn("size-4 shrink-0", active && "text-primary")} />
                <span class="truncate">{tool.title}</span>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>

  <div class="border-t border-border p-3">
    <a
      href="/explore"
      onclick={onnavigate}
      class="flex h-9 items-center justify-between rounded-lg px-2 text-body text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      Browse all tools
      <ArrowRight class="size-4" />
    </a>
  </div>
</div>
