<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    hint?: Snippet | string;
    class?: string;
  }

  let { children, hint, class: className = "" }: Props = $props();
</script>

<div
  class={cn(
    "sticky bottom-0 z-10 -mx-1 flex flex-col items-stretch gap-3 border-t border-border/60 bg-card/70 px-3 py-3 backdrop-blur-lg backdrop-saturate-150 supports-backdrop-filter:bg-card/55 sm:-mx-2 sm:flex-row sm:items-center sm:justify-between",
    "pb-[max(env(safe-area-inset-bottom),0.75rem)]",
    className
  )}
>
  {#if hint}
    <div class="label-eyebrow text-muted-foreground">
      {#if typeof hint === "string"}
        {hint}
      {:else}
        {@render hint()}
      {/if}
    </div>
  {:else}
    <span></span>
  {/if}

  <div class="flex flex-wrap items-center justify-end gap-2">
    {@render children()}
  </div>
</div>
