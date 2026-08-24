<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  type Props = {
    id?: string;
    spacing?: "tight" | "default" | "loose" | "none";
    /** Tonal band. Full-bleed to the viewport, per the layout rule. */
    band?: boolean;
    class?: string;
    children: Snippet;
  };

  let {
    id,
    spacing = "default",
    band = false,
    class: className,
    children,
  }: Props = $props();

  const pad = {
    tight: "py-12 md:py-16",
    default: "py-16 md:py-24",
    loose: "py-24 md:py-32",
    none: "",
  } as const;
</script>

<section
  {id}
  class={cn(
    pad[spacing],
    band && "border-y border-border bg-background-muted",
    className
  )}
>
  {@render children()}
</section>
