<script lang="ts">
  import { config } from "$constants/app";
  import { MARK_PATHS } from "$lib/brand-mark";
  import { cn } from "$lib/utils";

  const sizes = {
    xs: { mark: "size-5.5", text: "text-[18px]" },
    sm: { mark: "size-7", text: "text-[22px]" },
    md: { mark: "size-8", text: "text-[25px]" },
    lg: { mark: "size-12", text: "text-[36px]" },
    xl: { mark: "size-14", text: "text-[42px]" },
  };

  type Props = {
    size?: keyof typeof sizes;
    class?: string;
    /** Renders the aperture mark without the wordmark. */
    markOnly?: boolean;
    /** Turns the pieces into place on mount. */
    draw?: boolean;
  };

  let { size = "sm", class: className = "text-foreground", markOnly = false, draw = false }: Props = $props();
</script>

<span class={cn("inline-flex items-center gap-[0.32em]", sizes[size].text, className)}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    class={cn("shrink-0", sizes[size].mark, markOnly && "h-full w-auto")}
    class:draw
    role={markOnly ? "img" : undefined}
    aria-label={markOnly ? config.appName : undefined}
    aria-hidden={markOnly ? undefined : "true"}
  >
    {#each MARK_PATHS as d, i (i)}
      <path {d} fill="currentColor" style:animation-delay={`${i * 90}ms`} />
    {/each}
  </svg>
  {#if !markOnly}
    <span class="font-heading font-semibold leading-none tracking-[-0.01em]">{config.appName.split(" ")[0]}</span>
  {/if}
</span>

<style>
  .draw path {
    opacity: 0;
    transform-origin: 24px 24px;
    animation: turn-in 700ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
  }

  @keyframes turn-in {
    from {
      opacity: 0;
      transform: rotate(-40deg) scale(0.85);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .draw path {
      animation: none;
      opacity: 1;
    }
  }
</style>
