<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  type Props = {
    eyebrow?: string;
    title: string;
    /** Second clause of the headline, set in the brand teal. */
    accent?: string;
    /** Chapter numeral on the rule, e.g. "01". */
    index?: string;
    class?: string;
    action?: Snippet;
  };

  let {
    eyebrow,
    title,
    accent,
    index,
    class: className,
    action,
  }: Props = $props();
</script>

<div
  class={cn(
    "flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-border pb-5",
    className
  )}
>
  <div class="flex max-w-2xl flex-col gap-2">
    {#if eyebrow}
      <span class="label-eyebrow text-primary">{eyebrow}</span>
    {/if}
    <h2 class="text-balance text-heading text-foreground sm:text-heading-lg">
      {title}{#if accent}&nbsp;<span class="text-primary">{accent}</span>{/if}
    </h2>
  </div>

  {#if action}
    {@render action()}
  {:else if index}
    <span
      class="hidden shrink-0 tabular-nums text-caption text-muted-foreground sm:inline"
      aria-hidden="true"
    >
      {index}
    </span>
  {/if}
</div>
