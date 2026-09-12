<script lang="ts">
  import { rise } from "$lib/motion";
  import { cn } from "$lib/utils";
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
    "group flex h-full flex-col gap-3 bg-card p-4 outline-none transition-[border-color,box-shadow,transform] duration-200 ease-craft focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99] motion-reduce:active:scale-100",
    framing === "card"
      ? "rounded-2xl border border-border hover:border-border-strong hover:shadow-sm"
      : "hover:bg-muted",
    className
  )}
  in:fly={delay === null ? undefined : rise(8, delay)}
>
  <div class="flex items-start justify-between gap-3">
    <span
      class="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-background text-foreground transition-colors duration-200 group-hover:text-primary"
    >
      {#if Icon}<Icon class="size-5" stroke={1.75} />{/if}
    </span>
    <ArrowUpRight
      class="size-4 text-muted-foreground opacity-0 transition-[opacity,transform] duration-200 ease-craft group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
    />
  </div>

  <div class="flex flex-col gap-1">
    <h3 class="text-body-lg font-medium text-foreground">{tool.title}</h3>
    <p class="line-clamp-2 text-pretty text-body text-muted-foreground">{tool.description}</p>
  </div>
</a>
