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

  let {
    title,
    counter,
    description,
    children,
    actions,
    class: className = "",
    contentClass = "",
  }: Props = $props();
</script>

<section class={cn("flex flex-col gap-4", className)}>
  {#if title || counter || actions}
    <div
      class="flex items-baseline justify-between gap-3 border-b border-border/60 pb-3"
    >
      <div class="flex flex-col gap-1">
        {#if title}
          <span class="label-eyebrow text-muted-foreground">
            {title}
          </span>
        {/if}
        {#if description}
          <p class="text-xs text-muted-foreground/80">{description}</p>
        {/if}
      </div>
      <div class="flex items-center gap-3">
        {@render actions?.()}
        {#if counter !== undefined}
          <span
            class="font-mono text-[11px] tabular-nums text-muted-foreground/50"
          >
            {typeof counter === "number"
              ? String(counter).padStart(2, "0")
              : counter}
          </span>
        {/if}
      </div>
    </div>
  {/if}

  <div class={contentClass}>
    {@render children()}
  </div>
</section>
