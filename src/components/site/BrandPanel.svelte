<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  type Props = {
    title: string;
    body?: string;
    actions?: Snippet;
    class?: string;
  };

  let { title, body, actions, class: className }: Props = $props();
</script>

<section class={cn("panel-brand relative w-full overflow-hidden rounded-3xl px-6 py-16 sm:py-20", className)}>
  <div class="relative mx-auto flex max-w-3xl flex-col items-center text-center">
    <h2 class="text-balance text-heading font-medium text-white sm:text-heading-lg md:text-display">
      {title}
    </h2>
    {#if body}
      <p class="mt-4 max-w-md text-pretty text-body text-white/80">{body}</p>
    {/if}
    {#if actions}
      <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        {@render actions()}
      </div>
    {/if}
  </div>
</section>
