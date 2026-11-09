<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  type Props = { delay?: number; class?: string; children: Snippet };

  let { delay = 0, class: className, children }: Props = $props();
</script>

<div class={cn("rise", className)} style:--i={delay / 60}>
  {@render children()}
</div>
