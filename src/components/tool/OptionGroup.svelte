<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  type Props = {
    label: string;
    description?: string;
    class?: string;
    children: Snippet;
  };

  let { label, description, class: className, children }: Props = $props();

  const id = $props.id();
</script>

<div role="group" aria-labelledby={id} class={cn("flex flex-col gap-2.5", className)}>
  <div class="flex flex-col gap-0.5">
    <p {id} class="text-body font-medium text-foreground">{label}</p>
    {#if description}
      <p class="text-caption text-muted-foreground">{description}</p>
    {/if}
  </div>
  {@render children()}
</div>
