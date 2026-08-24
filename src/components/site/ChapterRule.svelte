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
    <span class="font-display text-heading-sm font-bold tabular-nums text-foreground">
      {index}
    </span>
    <span class="label-eyebrow text-muted-foreground">{label}</span>
  </div>
  {#if action}
    {@render action()}
  {/if}
</div>
