<script lang="ts">
  import { cn } from "$lib/utils";
  import { rise } from "$lib/motion";
  import type { ToolConfig } from "$tools/list";
  import { IconArrowUpRight as ArrowUpRight } from "@tabler/icons-svelte";
  import { fly } from "svelte/transition";

  type Props = {
    tool: Pick<ToolConfig, "slug" | "title" | "description" | "icon" | "color">;
    /** 0-based position; accepted for caller ergonomics, not rendered. */
    index?: number;
    /** Per-item enter-animation delay in ms. Set to null to disable. */
    delay?: number | null;
    /** "cell" drops the border and radius for use inside a gap-px hairline grid. */
    framing?: "card" | "cell";
    class?: string;
  };

  let { tool, delay = 0, framing = "card", class: className }: Props = $props();

  const Icon = $derived(tool.icon);
</script>

<a
  href={`/tools/${tool.slug}`}
  class={cn(
    "group flex h-full flex-col gap-4 bg-card p-5 transition-[border-color,background-color,transform] duration-200 ease-craft active:scale-[0.99] motion-reduce:active:scale-100",
    framing === "card"
      ? "rounded-lg border border-border hover:border-border-strong"
      : "hover:bg-paper",
    className
  )}
  in:fly={delay === null ? undefined : rise(8, delay)}
>
  <span class={cn("glyph-duotone shrink-0", tool.color || "text-primary")}>
    {#if Icon}<Icon size={20} />{/if}
  </span>

  <div class="flex flex-1 flex-col gap-1.5">
    <h3 class="text-body font-semibold text-foreground">{tool.title}</h3>
    <p class="line-clamp-2 text-pretty text-body-sm leading-relaxed text-muted-foreground">
      {tool.description}
    </p>
  </div>

  <div class="flex items-center justify-between border-t border-border pt-3">
    <span
      class="label-eyebrow text-muted-foreground transition-colors duration-200 group-hover:text-foreground"
    >
      Open
    </span>
    <ArrowUpRight
      class="size-3.5 text-muted-foreground transition-transform duration-200 ease-craft group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
    />
  </div>
</a>
