<script lang="ts">
  import { Button } from "$components/ui/button";
  import { cn } from "$lib/utils";
  import { IconTrash as Trash2 } from "@tabler/icons-svelte";
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    count?: number;
    /** Secondary line after the count, e.g. total size. */
    meta?: string;
    onReset?: () => void;
    resetLabel?: string;
    actions?: Snippet;
    class?: string;
  }

  let { label, count, meta, onReset, resetLabel = "Clear", actions, class: className = "" }: Props = $props();
</script>

<div
  class={cn(
    "sticky top-0 z-20 -mx-3 flex flex-wrap items-center justify-between gap-3 bg-background/90 px-3 py-2 backdrop-blur-xl sm:-mx-6 sm:px-6",
    className
  )}
>
  <div class="flex min-w-0 items-baseline gap-2">
    <h2 class="truncate text-body font-medium text-foreground">{label}</h2>
    {#if count !== undefined}
      <span class="text-caption tabular-nums text-muted-foreground">{count}</span>
    {/if}
    {#if meta}
      <span class="hidden truncate text-caption tabular-nums text-muted-foreground sm:inline">· {meta}</span>
    {/if}
  </div>

  <div class="flex flex-wrap items-center gap-1.5">
    {@render actions?.()}
    {#if onReset}
      <Button variant="ghost" size="sm" onclick={onReset} class="text-muted-foreground hover:text-foreground">
        <Trash2 class="size-4" />
        <span class="hidden sm:inline">{resetLabel}</span>
        <span class="sr-only sm:hidden">{resetLabel}</span>
      </Button>
    {/if}
  </div>
</div>
