<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  type Props = {
    width?: "narrow" | "default" | "wide";
    class?: string;
    children: Snippet;
  };

  let { width = "default", class: className, children }: Props = $props();

  const widths = {
    narrow: "max-w-3xl",
    default: "max-w-5xl",
    wide: "max-w-page",
  } as const;
</script>

<div class={cn("mx-auto w-full px-5 md:px-8", widths[width], className)}>
  {@render children()}
</div>
