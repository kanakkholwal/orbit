<script lang="ts">
  import { Progress } from "$components/ui/progress";
  import { cn } from "$lib/utils";

  let {
    label,
    current,
    total,
    class: className,
  }: { label: string; current: number; total: number; class?: string } = $props();
</script>

<div class={cn("flex min-w-0 flex-col gap-1.5", className)}>
  <div class="flex items-baseline justify-between gap-3 text-sm">
    <span class="truncate text-foreground">{label}</span>
    {#if total > 0}
      <span class="shrink-0 text-xs tabular-nums text-muted-foreground">{current} of {total}</span>
    {/if}
  </div>
  <Progress value={current} max={total > 0 ? total : 100} {label} size="sm" />
</div>
