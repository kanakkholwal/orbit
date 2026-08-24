<script lang="ts">
  import { cn } from "$lib/utils";
  import { prefersReducedMotion } from "$lib/motion";
  import type { Snippet } from "svelte";

  type Props = { delay?: number; class?: string; children: Snippet };

  let { delay = 0, class: className, children }: Props = $props();

  let node = $state<HTMLElement | null>(null);
  // Starts visible: with no JS and no IntersectionObserver the content must
  // still render rather than stay stuck at opacity 0.
  let shown = $state(true);

  $effect(() => {
    if (!node || typeof IntersectionObserver === "undefined") return;
    if (prefersReducedMotion()) return;

    shown = false;
    const el = node;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        shown = true;
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  });
</script>

<div
  bind:this={node}
  class={cn(
    "transition-[opacity,transform] duration-[400ms] ease-snappy motion-reduce:transition-none",
    shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
    className
  )}
  style:transition-delay={shown ? `${delay}ms` : "0ms"}
>
  {@render children()}
</div>
