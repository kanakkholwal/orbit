<script lang="ts">
  import { config } from "$constants/app";
  import { cn } from "$lib/utils";
  import type { SVGAttributes } from "svelte/elements";

  const sizes = { xs: "h-5.5", sm: "h-7", md: "h-8", lg: "h-12", xl: "h-14" };

  interface Props extends SVGAttributes<SVGSVGElement> {
    draw?: boolean;
    size?: keyof typeof sizes;
    class?: string;
    containerClassName?: string;
    isLoader?: boolean;
    pathClassName?: string;
    textClassName?: string;
  }

  let {
    draw = false,
    size = "sm",
    class: className = "text-foreground",
    containerClassName = "",
    isLoader = false,
    pathClassName = "",
    textClassName = "",
    ...rest
  }: Props = $props();

  let textRef: SVGTextElement | undefined = $state();
  let textWidth = $state(2845.44);

  $effect(() => {
    if (textRef) {
      textWidth = textRef.getBBox().width;
    }
  });

  // Updated derived width to accommodate the wider 1080px icon
  // 1150 (text start X) + textWidth + 50 (right padding)
  let totalWidth = $derived(1200 + textWidth);

  let pathAnimationClass = $derived(
    draw ? (isLoader ? "animate-load-path" : "animate-draw-path") : "",
  );
  let textAnimationClass = $derived(
    draw ? (isLoader ? "animate-load-text" : "animate-draw-text") : "",
  );
</script>

<div class={cn("relative flex items-center", containerClassName)}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    viewBox={`0 0 ${totalWidth} 1080`}
    class={cn(sizes[size], "w-auto", className)}
    {...rest}
  >
    <g
      stroke="currentColor"
      stroke-width="10"
      class={cn("fill-dark", pathAnimationClass, pathClassName)}
    >
      <path
        pathLength="1"
        d="M417.43,339.15c-2-2-9.26-.15-15.43-2.15l-68.68-1a11,11,0,0,0-11,10.91V684L205.2,448.53V269.68c0-27.71,22.71-50.17,50.72-50.17H437"
      />
      <path
        pathLength="1"
        d="M322.06,767.24q.39-176.62.21-353.24H205.2c0,123.52,0,213.68.16,357.76,0,10.34-2.07,18.36-9.1,26.78-20.08,24-25.62,52.2-17.5,82.47a91.85,91.85,0,0,0,80.58,67.5c38,3.51,74.77-17.43,91.4-52,16.81-35,10.16-75-18.61-104.49C324.91,784.56,322,777.46,322.06,767.24Z"
      />
      <path
        pathLength="1"
        d="M626.3,396.92c-.06-5.19-4.19-11.3-8.13-15.32-49.85-51-100.13-101.52-149.95-152.53-6.86-7-13.87-9.6-23.56-9.56-17.35.09-31,.14-42.66.17V337.09c6.06,1.16,12.51,4.26,16.56,8.31l198.68,203a5.11,5.11,0,0,0,9.13-1.34,4.76,4.76,0,0,0,.18-1.36C626.63,496.08,626.89,446.49,626.3,396.92Z"
      />
      <path
        pathLength="1"
        d="M661.41,788.26c2,2,9.26.15,15.43,2.15l68.68,1a11,11,0,0,0,11-10.91V443.41L873.64,678.88V857.73c0,27.71-22.71,50.16-50.72,50.16H641.84"
      />
      <path
        pathLength="1"
        d="M756.78,360.17q-.39,176.61-.21,353.24H873.63c0-123.52,0-213.68-.15-357.76,0-10.34,2.07-18.36,9.1-26.79,20.08-24,25.62-52.2,17.5-82.47A91.86,91.86,0,0,0,819.5,178.9c-38-3.51-74.77,17.42-91.4,52-16.81,35-10.16,75,18.6,104.49C753.93,342.84,756.8,350,756.78,360.17Z"
      />
      <path
        pathLength="1"
        d="M452.54,730.49c.06,5.19,4.19,11.29,8.13,15.32,49.85,51,100.13,101.52,149.94,152.53,6.87,7,13.88,9.6,23.56,9.55,17.36-.08,31-.13,42.67-.16V790.32c-6.06-1.16-12.51-4.27-16.56-8.31l-198.68-203a5.11,5.11,0,0,0-9.13,1.34,4.72,4.72,0,0,0-.18,1.36C452.21,631.33,452,680.91,452.54,730.49Z"
      />
    </g>

    <text
      bind:this={textRef}
      x="1150"
      y="800"
      font-size="750"
      font-family="var(--font-logo)"
      font-weight="600"
      fill="currentColor"
      class={cn(textAnimationClass, textClassName)}
    >
      {config.appName.split(" ").at(0)}
    </text>
  </svg>
</div>

<style>
  .animate-draw-path {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    fill-opacity: 0;
    animation: drawPath 1.5s ease-in-out forwards;
  }

  @keyframes drawPath {
    to {
      stroke-dashoffset: 0;
      fill-opacity: 1;
    }
  }

  .animate-load-path {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    fill-opacity: 0;
    animation: loadPath 2s ease-in-out infinite;
  }

  @keyframes loadPath {
    0%,
    100% {
      stroke-dashoffset: 1;
      fill-opacity: 0;
    }
    50% {
      stroke-dashoffset: 0;
      fill-opacity: 1;
    }
  }

  .animate-draw-text {
    opacity: 0;
    letter-spacing: 0.3em;
    animation: drawText 1.5s ease-in-out forwards;
  }

  @keyframes drawText {
    to {
      opacity: 1;
      letter-spacing: 0em;
    }
  }

  .animate-load-text {
    opacity: 0.3;
    animation: loadText 2s ease-in-out infinite;
  }

  @keyframes loadText {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }
</style>
