<script lang="ts">
  import { prefersReducedMotion } from "$lib/motion";
  import { cn } from "$lib/utils";
  import { IconChevronDown as ChevronDown, IconPlus as Plus } from "@tabler/icons-svelte";
  import { slide } from "svelte/transition";

  type Item = { q: string; a: string };

  let {
    items,
    variant = "rules",
  }: {
    items: Item[];
    /** `cards`: numbered card per row. `rules`: hairline-divided rows. */
    variant?: "rules" | "cards";
  } = $props();

  let open = $state(0);

  function toggle(i: number) {
    open = open === i ? -1 : i;
  }

  const duration = $derived(prefersReducedMotion() ? 0 : 260);
  const cards = $derived(variant === "cards");
</script>

<div class={cards ? "flex flex-col gap-3" : "border-t border-border"}>
  {#each items as item, i (item.q)}
    <div
      class={cards
        ? "rounded-2xl border border-border bg-card px-6 dark:bg-background"
        : "border-b border-border"}
    >
      <h3>
        <button
          type="button"
          onclick={() => toggle(i)}
          aria-expanded={open === i}
          aria-controls={`faq-panel-${i}`}
          id={`faq-trigger-${i}`}
          class="group flex w-full items-center justify-between gap-6 py-5 text-left rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <span class="flex items-center gap-4">
            {#if cards}
              <span class="text-body font-semibold tabular-nums text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
            {/if}
            <span class={cn("font-medium text-foreground", cards ? "text-body-lg" : "text-body")}>{item.q}</span>
          </span>
          {#if cards}
            <ChevronDown
              class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-craft"
              style={open === i ? "transform: rotate(180deg)" : ""}
            />
          {:else}
            <Plus
              class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-craft group-hover:text-foreground"
              style={open === i ? "transform: rotate(45deg)" : ""}
            />
          {/if}
        </button>
      </h3>

      {#if open === i}
        <div
          id={`faq-panel-${i}`}
          role="region"
          aria-labelledby={`faq-trigger-${i}`}
          transition:slide={{ duration }}
        >
          <p
            class={cn(
              "max-w-2xl text-pretty pb-5 text-body leading-relaxed text-muted-foreground",
              cards && "pl-10"
            )}
          >
            {item.a}
          </p>
        </div>
      {/if}
    </div>
  {/each}
</div>
