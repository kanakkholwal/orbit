<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  type Props = {
    id?: string;
    divider?: boolean;
    label?: string;
    class?: string;
    children: Snippet;
  };

  let { id, divider = true, label, class: className, children }: Props = $props();
</script>

<section
  {id}
  aria-label={label}
  class={cn(
    "mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col px-5 py-12 md:px-8 md:py-16",
    divider && "border-t border-border",
    className
  )}
>
  {@render children()}
</section>
