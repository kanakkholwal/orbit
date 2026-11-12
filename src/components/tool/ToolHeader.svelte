<script lang="ts">
  import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "$components/ui/breadcrumb";
  import { Button } from "$components/ui/button";
  import { toolsCategories } from "$constants/tools";
  import { IconArrowLeft as Left, IconArrowRight as Right } from "$lib/icons";
  import { workspace } from "$stores/workspace.svelte";
  import { getToolsByCategory, type ToolConfig } from "$tools/list";
  import { onMount } from "svelte";

  let { tool }: { tool: Pick<ToolConfig, "slug" | "title" | "description" | "icon" | "category" | "keywords"> } = $props();

  let root = $state<HTMLElement>();

  const category = $derived(toolsCategories.find((c) => c.id === tool.category)?.name);
  // Neighbours within the same menu group; preset pages are not in the group, so they show none.
  const siblings = $derived(getToolsByCategory(tool.category));
  const at = $derived(siblings.findIndex((t) => t.slug === tool.slug));
  const prev = $derived(at > 0 ? siblings[at - 1] : undefined);
  const next = $derived(at >= 0 && at < siblings.length - 1 ? siblings[at + 1] : undefined);

  const GENERIC = new Set(["free", "no upload", "offline"]);
  const tags = $derived((tool.keywords ?? []).filter((k) => !GENERIC.has(k)).slice(0, 4));

  // Tells the top bar when this header has scrolled out of view.
  onMount(() => {
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => (workspace.headerInView = entry.isIntersecting), {
      root: document.getElementById("workspace"),
      threshold: 0.1,
    });
    observer.observe(root);
    return () => {
      observer.disconnect();
      workspace.headerInView = true;
    };
  });
</script>

<header bind:this={root} class="rise flex max-w-5xl flex-col gap-4 pb-6">
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem><BreadcrumbLink href="/explore">Tools</BreadcrumbLink></BreadcrumbItem>
      {#if category}
        <BreadcrumbSeparator />
        <BreadcrumbItem class="min-w-0">
          <BreadcrumbLink href={`/explore?category=${tool.category}`}>{category}</BreadcrumbLink>
        </BreadcrumbItem>
      {/if}
      <BreadcrumbSeparator />
      <BreadcrumbItem class="min-w-0"><BreadcrumbPage class="truncate">{tool.title}</BreadcrumbPage></BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>

  <div class="flex items-start justify-between gap-4">
    <div class="flex min-w-0 items-center gap-3.5">
      <span class="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-card text-primary sm:size-12">
        <tool.icon class="size-5" />
      </span>
      <h1 class="text-balance text-2xl font-medium text-foreground sm:text-4xl">{tool.title}</h1>
    </div>

    {#if prev || next}
      <nav aria-label="More tools in this group" class="hidden shrink-0 gap-2 sm:flex">
        <Button
          variant="outline"
          size="icon"
          class="rounded-full"
          href={prev ? `/tools/${prev.slug}` : undefined}
          disabled={!prev}
          aria-label={prev ? `Previous tool: ${prev.title}` : "No previous tool"}
          title={prev?.title}
        >
          <Left />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="rounded-full"
          href={next ? `/tools/${next.slug}` : undefined}
          disabled={!next}
          aria-label={next ? `Next tool: ${next.title}` : "No next tool"}
          title={next?.title}
        >
          <Right />
        </Button>
      </nav>
    {/if}
  </div>

  <p class="line-clamp-2 max-w-2xl text-pretty text-sm text-muted-foreground sm:line-clamp-none sm:text-base">{tool.description}</p>

  {#if tags.length > 0}
    <ul class="hidden flex-wrap gap-2 sm:flex" aria-label="Related searches">
      {#each tags as tag (tag)}
        <li class="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">{tag}</li>
      {/each}
    </ul>
  {/if}
</header>
