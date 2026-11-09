<script lang="ts">
  import { cn } from "$lib/utils";
  import type { ToolConfig } from "$tools/list";
  import { IconArrowUpRight as ArrowUpRight } from "$lib/icons";

  type Props = {
    tool: Pick<ToolConfig, "slug" | "title" | "description" | "icon" | "color">;
    /** 0-based position; accepted for caller ergonomics, not rendered. */
    index?: number;
    /** Per-item enter-animation delay in ms. Set to null to disable. */
    delay?: number | null;
    /** "cell" drops the frame for use inside a gap-px hairline grid. */
    framing?: "card" | "cell";
    class?: string;
  };

  let { tool, delay = 0, framing = "card", class: className }: Props = $props();

  const Icon = $derived(tool.icon);
</script>

<a
  href={`/tools/${tool.slug}`}
  class={cn(
    "group block h-full outline-none transition-[border-color,transform,translate] duration-(--duration-base) ease-(--ease-ui-out) focus-visible:ring-2 focus-visible:ring-ring active:scale-(--press-scale-row) motion-reduce:active:scale-100",
    framing === "card"
      ? "rounded-2xl border border-border bg-background p-1 hover:border-border-strong"
      : "hover:bg-muted",
    delay !== null && "rise",
    className
  )}
  style:--i={delay === null ? undefined : delay / 60}
>
  <div class={cn("flex h-full flex-col gap-3 p-4", framing === "card" && "rounded-[11px] bg-card")}>
    <div class="flex items-start justify-between gap-3">
      <span
        class="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-background text-foreground shadow-(--surface-shadow) transition-colors duration-(--duration-base) group-hover:text-primary"
      >
        {#if Icon}<Icon class="size-5" />{/if}
      </span>
      <ArrowUpRight
        class="size-4 text-muted-foreground opacity-0 transition-[opacity,transform] duration-(--duration-base) ease-(--ease-ui-out) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
      />
    </div>

    <div class="flex flex-col gap-1">
      <h3 class="text-base font-medium text-foreground">{tool.title}</h3>
      <p class="line-clamp-2 text-pretty text-sm text-muted-foreground">{tool.description}</p>
    </div>
  </div>
</a>
