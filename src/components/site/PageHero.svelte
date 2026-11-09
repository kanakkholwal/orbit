<script lang="ts">
  import { cn } from "$lib/utils";
  import { IconCheck as Check } from "$lib/icons";
  import type { Snippet } from "svelte";

  type Props = {
    /** Tilted chip above the title. */
    badge?: string;
    title: string;
    /** Second line of the title, set in the brand colour. */
    accent?: string;
    lede?: string;
    actions?: Snippet;
    aside?: Snippet;
    class?: string;
  };

  let { badge, title, accent, lede, actions, aside, class: className }: Props = $props();
</script>

<div
  class={cn(
    "grid grid-cols-1 gap-10 pb-6 pt-16 sm:pb-10 sm:pt-24",
    aside && "lg:grid-cols-2 lg:items-center",
    className
  )}
>
  <div class="rise flex flex-col">
    {#if badge}
      <span
        class="mb-4 flex w-fit items-center gap-2 rounded-md border border-border p-0.5 pl-2.5 text-xs font-semibold text-foreground"
      >
        {badge}
        <span class="rounded-sm border border-border bg-background p-1">
          <Check class="size-3.5" />
        </span>
      </span>
    {/if}

    <h1 class="text-balance text-4xl font-medium text-foreground md:text-5xl">
      {title}
      {#if accent}
        <br />
        <span class="text-primary">{accent}</span>
      {/if}
    </h1>

    {#if lede}
      <p class="mt-4 max-w-xl text-pretty text-sm text-muted-foreground md:text-base">{lede}</p>
    {/if}

    {#if actions}
      <div class="mt-8 flex flex-wrap items-center gap-2 sm:gap-4">
        {@render actions()}
      </div>
    {/if}
  </div>

  {#if aside}
    <div class="min-w-0">
      {@render aside()}
    </div>
  {/if}
</div>
