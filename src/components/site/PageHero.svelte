<script lang="ts">
  import Container from "./Container.svelte";
  import { rise } from "$lib/motion";
  import { IconChevronLeft as ChevronLeft } from "@tabler/icons-svelte";
  import type { Snippet } from "svelte";
  import { fly } from "svelte/transition";

  type Props = {
    eyebrow?: string;
    title: string;
    accent?: string;
    lede?: string;
    back?: { label: string; href: string };
    /** One-line facts on the rule under the hero. */
    facts?: string[];
    actions?: Snippet;
  };

  let { eyebrow, title, accent, lede, back, facts, actions }: Props = $props();
</script>

<header class="pb-10 pt-14 md:pt-20">
  <Container width="wide">
    {#if back}
      <a
        href={back.href}
        class="mb-8 inline-flex items-center gap-1 text-caption text-muted-foreground transition-colors duration-200 hover:text-foreground"
      >
        <ChevronLeft class="size-3.5" />
        {back.label}
      </a>
    {/if}

    <div class="flex flex-col gap-5" in:fly={rise(10)}>
      {#if eyebrow}
        <span class="label-eyebrow text-primary">{eyebrow}</span>
      {/if}

      <h1 class="max-w-3xl text-balance text-heading-lg text-foreground md:text-display">
        {title}{#if accent}&nbsp;<span class="text-primary">{accent}</span>{/if}
      </h1>

      {#if lede}
        <p class="max-w-2xl text-pretty text-body-lg leading-relaxed text-muted-foreground">
          {lede}
        </p>
      {/if}

      {#if actions}
        <div class="mt-2 flex flex-wrap items-center gap-2">
          {@render actions()}
        </div>
      {/if}
    </div>

    {#if facts?.length}
      <ul
        class="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5 text-caption text-muted-foreground"
      >
        {#each facts as fact (fact)}
          <li>{fact}</li>
        {/each}
      </ul>
    {/if}
  </Container>
</header>
