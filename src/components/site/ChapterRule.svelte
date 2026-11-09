<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  type Props = {
    /** Chapter numeral, e.g. "01". Set in the display face. */
    index: string;
    label: string;
    class?: string;
    action?: Snippet;
  };

  let { index, label, class: className, action }: Props = $props();
</script>

<div
  class={cn(
    "flex items-center justify-between gap-6 border-b border-border pb-4",
    className
  )}
>
  <div class="flex items-baseline gap-4">
    <span class="text-2xl font-medium tabular-nums text-foreground">
      {index}
    </span>
    <span class="text-xs font-medium text-muted-foreground">{label}</span>
  </div>
  {#if action}
    {@render action()}
  {/if}
</div>
