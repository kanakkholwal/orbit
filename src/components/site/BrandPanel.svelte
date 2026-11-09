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

<section class={cn("relative w-full overflow-hidden rounded-2xl bg-primary px-6 py-16 text-primary-foreground sm:py-20", className)}>
  <div class="relative mx-auto flex max-w-3xl flex-col items-center text-center">
    <h2 class="text-balance text-3xl font-medium text-primary-foreground sm:text-4xl md:text-5xl">
      {title}
    </h2>
    {#if body}
      <p class="mt-4 max-w-md text-pretty text-sm text-primary-foreground/80">{body}</p>
    {/if}
    {#if actions}
      <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        {@render actions()}
      </div>
    {/if}
  </div>
</section>
