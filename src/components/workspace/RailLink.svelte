<script lang="ts">
  import * as Tooltip from "$components/ui/tooltip";
  import { cn } from "$lib/utils";
  import type { Icon } from "$lib/icons";

  type Props = {
    label: string;
    icon: Icon;
    href?: string;
    active?: boolean;
    onclick?: () => void;
  };

  let { label, icon: Glyph, href, active = false, onclick }: Props = $props();

  const base =
    "grid size-9 place-items-center rounded-lg outline-none transition-colors duration-(--duration-fast) focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      {#if href}
        <a
          {...props}
          {href}
          aria-label={label}
          aria-current={active ? "page" : undefined}
          class={cn(
            base,
            active
              ? "bg-foreground/[0.06] text-primary"
              : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
          )}
        >
          <Glyph class="size-[18px]" />
        </a>
      {:else}
        <button
          {...props}
          type="button"
          aria-label={label}
          {onclick}
          class={cn(base, "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground")}
        >
          <Glyph class="size-[18px]" />
        </button>
      {/if}
    {/snippet}
  </Tooltip.Trigger>
  <Tooltip.Content side="right" sideOffset={8}>{label}</Tooltip.Content>
</Tooltip.Root>
