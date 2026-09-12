<script lang="ts">
  import { cn } from "$lib/utils";
  import { IconCircleCheck as CircleCheck } from "@tabler/icons-svelte";
  import type { Snippet } from "svelte";

  type Props = {
    title: string;
    description?: string;
    actions?: Snippet;
    children?: Snippet;
    class?: string;
  };

  let { title, description, actions, children, class: className }: Props = $props();
</script>

<section aria-live="polite" class={cn("flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5", className)}>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-start gap-3">
      <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <CircleCheck class="size-5" />
      </span>
      <div class="flex flex-col gap-0.5">
        <h2 class="text-body-lg font-medium text-foreground">{title}</h2>
        {#if description}
          <p class="text-body text-muted-foreground">{description}</p>
        {/if}
      </div>
    </div>
    {#if actions}
      <div class="flex flex-wrap gap-2">{@render actions()}</div>
    {/if}
  </div>
  {#if children}
    <div class="border-t border-border pt-4">{@render children()}</div>
  {/if}
</section>
