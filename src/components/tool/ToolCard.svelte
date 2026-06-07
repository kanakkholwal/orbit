<script lang="ts">
  import { cn } from "$lib/utils";
  import type { ToolConfig } from "$tools/list";
  import { ArrowUpRight } from "@lucide/svelte";
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  type Props = {
    tool: Pick<ToolConfig, "slug" | "title" | "description" | "icon" | "color">;
    /** 0-based position, shown as a monospace ordinal and used for stagger. */
    index?: number;
    /** Per-item enter-animation delay in ms. Set to null to disable. */
    delay?: number | null;
    class?: string;
  };

  let { tool, index, delay = 0, class: className }: Props = $props();

  const Icon = $derived(tool.icon);
  const ordinal = $derived(
    typeof index === "number" ? String(index + 1).padStart(2, "0") : null
  );
</script>

<a
  href={`/tools/${tool.slug}`}
  class={cn(
    "group flex h-full flex-col gap-4 bg-card p-5 transition-colors duration-300 hover:bg-muted/40 active:scale-[0.99]",
    className
  )}
  in:fly={delay === null
    ? undefined
    : { y: 8, duration: 340, delay, easing: cubicOut }}
>
  <div class="flex items-start justify-between gap-3">
    <span
      class={cn(
        "inline-flex size-8 items-center justify-center rounded-md bg-current/10 transition-transform duration-300 group-hover:scale-105",
        tool.color || "text-primary"
      )}
    >
      {#if Icon}<Icon size={16} />{/if}
    </span>
    {#if ordinal}
      <span class="font-mono text-[10px] tabular-nums text-muted-foreground/50">
        {ordinal}
      </span>
    {/if}
  </div>

  <div class="flex flex-1 flex-col gap-1.5">
    <h3 class="text-base font-medium tracking-tight text-foreground">
      {tool.title}
    </h3>
    <p class="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
      {tool.description}
    </p>
  </div>

  <div class="flex items-center justify-between border-t border-border/40 pt-3">
    <span
      class="label-eyebrow text-[10px] text-muted-foreground/60 transition-colors group-hover:text-primary"
    >
      Open
    </span>
    <ArrowUpRight
      class="size-3.5 text-muted-foreground/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
    />
  </div>
</a>
