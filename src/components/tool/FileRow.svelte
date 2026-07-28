<script lang="ts">
  import { Button } from "$components/ui/button";
  import { cn } from "$lib/utils";
  import { IconFileText as FileText, IconTrash as Trash2 } from "@tabler/icons-svelte";
  import type { Snippet } from "svelte";

  interface Props {
    name: string;
    meta?: string;
    icon?: typeof FileText;
    onRemove?: () => void;
    children?: Snippet;
    trailing?: Snippet;
    class?: string;
  }

  let {
    name,
    meta,
    icon: Icon = FileText,
    onRemove,
    children,
    trailing,
    class: className = "",
  }: Props = $props();
</script>

<div
  class={cn(
    "group flex items-center gap-3 rounded-sm border border-border/60 bg-card px-3 py-2.5 transition-colors hover:bg-muted/40",
    className
  )}
>
  <span
    class="inline-flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary"
  >
    <Icon class="size-4" />
  </span>

  <div class="flex min-w-0 flex-1 flex-col gap-0.5">
    <div class="truncate text-sm font-medium text-foreground">
      {name}
    </div>
    {#if children}
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        {@render children()}
      </div>
    {:else if meta}
      <div class="text-xs text-muted-foreground">{meta}</div>
    {/if}
  </div>

  <div class="flex shrink-0 items-center gap-1.5">
    {@render trailing?.()}
    {#if onRemove}
      <Button
        variant="ghost"
        size="icon-sm"
        onclick={onRemove}
        class="rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label="Remove file"
      >
        <Trash2 class="size-3.5" />
      </Button>
    {/if}
  </div>
</div>
