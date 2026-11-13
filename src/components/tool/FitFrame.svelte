<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  type Props = {
    width: number;
    height: number;
    /** Tallest the frame may get, as a CSS length. */
    maxHeight?: string;
    class?: string;
    children: Snippet<[string]>;
  };

  let { width, height, maxHeight = "60vh", class: className, children }: Props = $props();

  const ratio = $derived(`${width} / ${height}`);
</script>

<!-- Width follows the height cap, so a tall photo stays narrow instead of stretching to full width. -->
<div class={cn("mx-auto w-full", className)} style="max-width: min(100%, calc({maxHeight} * {width / height}));">
  {@render children(ratio)}
</div>
