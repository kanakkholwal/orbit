<script lang="ts">
  import { cn } from "$lib/utils";
  import type { ToolConfig } from "$tools/list";
  import { IconArrowUpRight as ArrowUpRight } from "@tabler/icons-svelte";
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  type Props = {
    tool: Pick<ToolConfig, "slug" | "title" | "description" | "icon" | "color">;
    /** 0-based position; accepted for caller ergonomics, not rendered. */
    index?: number;
    /** Per-item enter-animation delay in ms. Set to null to disable. */
    delay?: number | null;
    class?: string;
  };

  let { tool, delay = 0, class: className }: Props = $props();

  const Icon = $derived(tool.icon);
</script>

<a
  href={`/tools/${tool.slug}`}
  class={cn(
    "group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-[transform,box-shadow] duration-300 ease-snappy hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm",
    className
  )}
  in:fly={delay === null
    ? undefined
    : { y: 8, duration: 340, delay, easing: cubicOut }}
>
  <div class="flex items-start gap-3">
    <span
      class={cn(
        "inline-flex size-8 items-center justify-center rounded-md bg-current/10 transition-transform duration-300 group-hover:scale-105",
        tool.color || "text-primary"
      )}
    >
      {#if Icon}<Icon size={16} />{/if}
    </span>
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
      class="label-eyebrow text-muted-foreground transition-colors group-hover:text-primary"
    >
      Open
    </span>
    <ArrowUpRight
      class="size-3.5 text-muted-foreground/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
    />
  </div>
</a>
