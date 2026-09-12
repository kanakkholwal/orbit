<script lang="ts">
  import { rise } from "$lib/motion";
  import { cn } from "$lib/utils";
  import { IconCheck as Check } from "@tabler/icons-svelte";
  import type { Snippet } from "svelte";
  import { fly } from "svelte/transition";

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
    "grid grid-cols-1 gap-10 px-1 pb-6 pt-28 sm:px-4 sm:pb-10 sm:pt-32 lg:px-16",
    aside && "lg:grid-cols-2 lg:items-center",
    className
  )}
>
  <div class="flex flex-col" in:fly={rise(10)}>
    {#if badge}
      <span
        class="mb-4 flex w-fit -rotate-2 items-center gap-2 rounded-md border border-border p-0.5 pl-2.5 text-caption font-semibold text-foreground"
      >
        {badge}
        <span class="rounded-sm border border-border bg-background p-1">
          <Check class="size-3.5" />
        </span>
      </span>
    {/if}

    <h1 class="text-balance text-heading-lg font-medium text-foreground md:text-display">
      {title}
      {#if accent}
        <br />
        <span class="text-primary">{accent}</span>
      {/if}
    </h1>

    {#if lede}
      <p class="mt-4 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg">{lede}</p>
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
