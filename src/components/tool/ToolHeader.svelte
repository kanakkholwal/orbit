<script lang="ts">
  import { Button } from "$components/ui/button";
  import { IconArrowLeft as Left, IconArrowRight as Right } from "$lib/icons";
  import { getToolsByCategory, type ToolConfig } from "$tools/list";

  let { tool }: { tool: Pick<ToolConfig, "slug" | "title" | "description" | "icon" | "category"> } = $props();

  // Neighbours within the same menu group; preset pages are not in the group, so they show none.
  const siblings = $derived(getToolsByCategory(tool.category));
  const at = $derived(siblings.findIndex((t) => t.slug === tool.slug));
  const prev = $derived(at > 0 ? siblings[at - 1] : undefined);
  const next = $derived(at >= 0 && at < siblings.length - 1 ? siblings[at + 1] : undefined);
</script>

<header class="rise flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
  <div class="flex min-w-0 items-start gap-4">
    <span class="grid size-12 shrink-0 place-items-center rounded-2xl border border-border bg-background p-1 shadow-(--surface-shadow)">
      <span class="grid size-full place-items-center rounded-xl bg-card text-primary">
        <tool.icon class="size-5" />
      </span>
    </span>
    <div class="flex min-w-0 flex-col gap-1.5">
      <h1 class="text-balance text-2xl font-medium text-foreground sm:text-3xl">{tool.title}</h1>
      <p class="max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">{tool.description}</p>
    </div>
  </div>

  {#if prev || next}
    <nav aria-label="More tools in this group" class="hidden shrink-0 gap-2 sm:flex">
      <Button
        variant="outline"
        size="icon"
        class="max-sm:size-11"
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
        class="max-sm:size-11"
        href={next ? `/tools/${next.slug}` : undefined}
        disabled={!next}
        aria-label={next ? `Next tool: ${next.title}` : "No next tool"}
        title={next?.title}
      >
        <Right />
      </Button>
    </nav>
  {/if}
</header>
