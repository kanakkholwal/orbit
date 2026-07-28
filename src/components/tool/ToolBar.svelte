<script lang="ts">
  import { Button } from "$components/ui/button";
  import { cn } from "$lib/utils";
  import { IconTrash as Trash2 } from "@tabler/icons-svelte";
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    count?: number;
    onReset?: () => void;
    resetLabel?: string;
    actions?: Snippet;
    class?: string;
  }

  let {
    label,
    count,
    onReset,
    resetLabel = "Clear",
    actions,
    class: className = "",
  }: Props = $props();
</script>

<div
  class={cn(
    "sticky top-0 z-20 -mx-1 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-card/70 px-3 py-2 backdrop-blur-lg backdrop-saturate-150 supports-backdrop-filter:bg-card/55 sm:-mx-2",
    className
  )}
>
  <div class="flex items-baseline gap-3">
    <span class="label-eyebrow text-primary">
      {label}
    </span>
    {#if count !== undefined}
      <span class="font-mono text-[11px] tabular-nums text-muted-foreground/60">
        {String(count).padStart(2, "0")}
      </span>
    {/if}
  </div>

  <div class="flex flex-wrap items-center gap-1.5">
    {@render actions?.()}
    {#if onReset}
      <Button
        variant="ghost"
        size="sm"
        onclick={onReset}
        class="rounded-sm text-muted-foreground hover:text-foreground"
      >
        <Trash2 class="size-3.5" />
        <span class="hidden sm:inline">{resetLabel}</span>
      </Button>
    {/if}
  </div>
</div>
