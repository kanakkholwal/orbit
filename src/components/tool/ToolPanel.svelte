<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  interface Props {
    title?: string;
    counter?: string | number;
    description?: string;
    children: Snippet;
    actions?: Snippet;
    class?: string;
    contentClass?: string;
  }

  let { title, counter, description, children, actions, class: className = "", contentClass = "" }: Props = $props();
</script>

<section class={cn("flex flex-col gap-3", className)}>
  {#if title || counter !== undefined || actions}
    <div class="flex items-end justify-between gap-3">
      <div class="flex min-w-0 flex-col gap-0.5">
        {#if title}
          <h3 class="flex items-baseline gap-2 text-body font-medium text-foreground">
            {title}
            {#if counter !== undefined}
              <span class="text-caption font-normal tabular-nums text-muted-foreground">{counter}</span>
            {/if}
          </h3>
        {/if}
        {#if description}
          <p class="text-caption text-muted-foreground">{description}</p>
        {/if}
      </div>
      {#if actions}
        <div class="flex shrink-0 items-center gap-2">{@render actions()}</div>
      {/if}
    </div>
  {/if}

  <div class={contentClass}>
    {@render children()}
  </div>
</section>
