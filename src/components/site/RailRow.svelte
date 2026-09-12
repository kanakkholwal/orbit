<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  type Props = {
    id?: string;
    /** Full-bleed dashed rule above the row. */
    divider?: boolean;
    label?: string;
    class?: string;
    children: Snippet;
  };

  let { id, divider = true, label, class: className, children }: Props = $props();
</script>

{#if divider}
  <div aria-hidden="true" class="rail-dash w-full border-t-2"></div>
{/if}

<section
  {id}
  aria-label={label}
  class={cn("rail-column mx-auto flex scroll-mt-24 flex-col p-3 sm:p-6", className)}
>
  {@render children()}
</section>
