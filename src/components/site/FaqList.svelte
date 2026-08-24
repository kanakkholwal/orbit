<script lang="ts">
  import { prefersReducedMotion } from "$lib/motion";
  import { IconPlus as Plus } from "@tabler/icons-svelte";
  import { slide } from "svelte/transition";

  type Item = { q: string; a: string };

  let { items }: { items: Item[] } = $props();

  // One row open at a time; the first row opens on load so the section never
  // reads as an empty stack of rules.
  let open = $state(0);

  function toggle(i: number) {
    open = open === i ? -1 : i;
  }

  const duration = $derived(prefersReducedMotion() ? 0 : 260);
</script>

<div class="border-t border-border">
  {#each items as item, i (item.q)}
    <div class="border-b border-border">
      <h3>
        <button
          type="button"
          onclick={() => toggle(i)}
          aria-expanded={open === i}
          aria-controls={`faq-panel-${i}`}
          class="group flex w-full items-center justify-between gap-6 py-5 text-left"
        >
          <span class="text-body font-medium text-foreground">{item.q}</span>
          <Plus
            class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-craft group-hover:text-foreground"
            style={open === i ? "transform: rotate(45deg)" : ""}
          />
        </button>
      </h3>

      {#if open === i}
        <div id={`faq-panel-${i}`} transition:slide={{ duration }}>
          <p class="max-w-2xl text-pretty pb-5 text-body-sm leading-relaxed text-muted-foreground">
            {item.a}
          </p>
        </div>
      {/if}
    </div>
  {/each}
</div>
