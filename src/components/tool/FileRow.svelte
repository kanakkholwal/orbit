<script lang="ts">
  import { Button } from "$components/ui/button";
  import { cn } from "$lib/utils";
  import { IconFileTypePdf as FilePdf, IconX as X } from "@tabler/icons-svelte";
  import type { Snippet } from "svelte";

  interface Props {
    name: string;
    meta?: string;
    icon?: typeof FilePdf;
    onRemove?: () => void;
    children?: Snippet;
    trailing?: Snippet;
    class?: string;
  }

  let { name, meta, icon: Icon = FilePdf, onRemove, children, trailing, class: className = "" }: Props = $props();
</script>

<div
  class={cn(
    "flex items-center gap-3 rounded-xl border border-border bg-card py-2 pl-2 pr-2 transition-colors duration-150",
    className
  )}
>
  <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
    <Icon class="size-5" stroke={1.75} />
  </span>

  <div class="flex min-w-0 flex-1 flex-col gap-0.5">
    <span class="truncate text-body font-medium text-foreground" title={name}>{name}</span>
    {#if children}
      <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-caption tabular-nums text-muted-foreground">
        {@render children()}
      </div>
    {:else if meta}
      <span class="text-caption tabular-nums text-muted-foreground">{meta}</span>
    {/if}
  </div>

  <div class="flex shrink-0 items-center gap-1">
    {@render trailing?.()}
    {#if onRemove}
      <Button
        variant="ghost"
        size="icon-sm"
        onclick={onRemove}
        class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label={`Remove ${name}`}
      >
        <X class="size-4" />
      </Button>
    {/if}
  </div>
</div>
