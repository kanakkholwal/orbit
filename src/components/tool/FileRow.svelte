<script lang="ts">
  import { Button } from "$components/ui/button";
  import { cn } from "$lib/utils";
  import { IconFileTypePdf as FilePdf, IconX as X } from "$lib/icons";
  import type { Snippet } from "svelte";

  interface Props {
    name: string;
    meta?: string;
    icon?: typeof FilePdf;
    /** Image URL shown instead of the icon, for image tools. */
    thumb?: string;
    active?: boolean;
    onSelect?: () => void;
    onRemove?: () => void;
    children?: Snippet;
    trailing?: Snippet;
    class?: string;
  }

  let { name, meta, icon: Icon = FilePdf, thumb, active = false, onSelect, onRemove, children, trailing, class: className = "" }: Props = $props();
</script>

<div
  class={cn(
    "flex items-center gap-3 rounded-xl border bg-background p-1.5 pr-2 transition-colors duration-(--duration-fast) hover:bg-foreground/[0.03]",
    active ? "border-foreground/30" : "border-border hover:border-border-strong",
    className
  )}
>
  {#snippet lead()}
    {#if thumb}
      <img src={thumb} alt="" class="size-full object-cover" loading="lazy" decoding="async" />
    {:else}
      <Icon class="size-5" />
    {/if}
  {/snippet}
  {#if onSelect}
    <button
      type="button"
      onclick={onSelect}
      aria-label={`Select ${name}`}
      aria-pressed={active}
      class="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-card text-muted-foreground"
    >
      {@render lead()}
    </button>
  {:else}
    <span class="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-card text-muted-foreground">
      {@render lead()}
    </span>
  {/if}

  <div class="flex min-w-0 flex-1 flex-col gap-0.5">
    <span class="truncate text-sm font-medium text-foreground" title={name}>{name}</span>
    {#if children}
      <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums text-muted-foreground">
        {@render children()}
      </div>
    {:else if meta}
      <span class="text-xs tabular-nums text-muted-foreground">{meta}</span>
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
