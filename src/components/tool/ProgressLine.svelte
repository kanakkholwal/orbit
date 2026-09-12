<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    label,
    current,
    total,
    class: className,
  }: { label: string; current: number; total: number; class?: string } = $props();

  const percent = $derived(total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0);
</script>

<div class={cn("flex min-w-0 flex-col gap-1.5", className)}>
  <div class="flex items-baseline justify-between gap-3 text-body">
    <span class="truncate text-foreground">{label}</span>
    {#if total > 0}
      <span class="shrink-0 text-caption tabular-nums text-muted-foreground">{current} of {total}</span>
    {/if}
  </div>
  <div
    class="h-1.5 overflow-hidden rounded-full bg-muted"
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={percent}
  >
    <div class="h-full rounded-full bg-primary transition-[width] duration-300 ease-craft" style:width={`${percent}%`}></div>
  </div>
</div>
