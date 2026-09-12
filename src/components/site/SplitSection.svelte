<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  type Props = {
    title: string;
    /** Second line of the title, set in the brand colour. */
    accent?: string;
    description?: string;
    /** Keeps the title column in view while the content scrolls. */
    sticky?: boolean;
    aside?: Snippet;
    class?: string;
    children: Snippet;
  };

  let { title, accent, description, sticky = false, aside, class: className, children }: Props = $props();
</script>

<div class={cn("relative w-full px-1 py-6 sm:px-4 sm:py-8 lg:px-16 lg:py-10", className)}>
  <div class="flex flex-col gap-10 lg:flex-row lg:gap-20">
    <div class="flex shrink-0 flex-col gap-2 lg:w-110">
      <div class={cn("flex flex-col gap-2", sticky && "lg:sticky lg:top-28")}>
        <h2 class="text-balance text-heading-lg font-medium text-foreground">
          {title}
          {#if accent}
            <br />
            <span class="text-primary">{accent}</span>
          {/if}
        </h2>
        {#if description}
          <p class="max-w-sm text-pretty text-body text-muted-foreground">{description}</p>
        {/if}
        {#if aside}
          <div class="mt-6">{@render aside()}</div>
        {/if}
      </div>
    </div>

    <div class="min-w-0 flex-1">
      {@render children()}
    </div>
  </div>
</div>
