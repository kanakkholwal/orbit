<script lang="ts">
  import { IconCheck as Check, IconLoader2 as Loader } from "$lib/icons";
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  interface Props {
    /** Draws the page into the canvas. Called once, when the card scrolls into view. */
    render: (canvas: HTMLCanvasElement) => Promise<void>;
    number: number;
    ariaLabel?: string;
    /** Makes the whole card a toggle button with a check badge. */
    onToggle?: () => void;
    selected?: boolean;
    /** Fades the thumbnail while selected, for pages that will be removed. */
    dimWhenSelected?: boolean;
    /** Primary border without a check, for example a turned page. */
    highlight?: boolean;
    /** Degrees the thumbnail is shown turned. */
    rotation?: number;
    /** Shows a grab cursor, for tools where cards are dragged into order. */
    draggable?: boolean;
    /** Top right of the preview, in place of the check badge. */
    badge?: Snippet;
    /** Buttons stacked at the top right of the preview. */
    actions?: Snippet;
    /** Replaces the default footer. */
    footer?: Snippet;
    footerLabel?: string;
    footerNote?: string;
    footerNoteStrong?: boolean;
    class?: string;
  }

  let {
    render,
    number,
    ariaLabel,
    onToggle,
    selected = false,
    dimWhenSelected = false,
    highlight = false,
    rotation = 0,
    draggable = false,
    badge,
    actions,
    footer,
    footerLabel,
    footerNote,
    footerNoteStrong = false,
    class: className,
  }: Props = $props();

  let canvas: HTMLCanvasElement;
  let isRendered = $state(false);

  const turn = $derived(((rotation % 360) + 360) % 360);
  const sideways = $derived(turn === 90 || turn === 270);

  function lazy(node: HTMLElement) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (!isRendered && canvas) {
          render(canvas)
            .then(() => (isRendered = true))
            .catch(console.error);
        }
        observer.disconnect();
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }

  const frame = $derived(
    cn(
      "group relative flex flex-col gap-1.5 rounded-xl border bg-card p-1.5 text-left outline-none transition-[border-color,box-shadow] duration-(--duration-fast)",
      selected || highlight ? "border-primary" : "border-border hover:border-border-strong hover:shadow-sm",
      selected && "shadow-[0_0_0_1px_var(--color-primary)]",
      onToggle && "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      draggable && "cursor-grab active:cursor-grabbing",
      className
    )
  );
</script>

{#snippet body()}
  <span class="relative grid aspect-3/4 place-items-center overflow-hidden rounded-lg bg-muted">
    {#if !isRendered}
      <Loader class="absolute size-4 animate-spin text-muted-foreground" />
    {/if}
    <canvas
      bind:this={canvas}
      class={cn(
        "pointer-events-none h-auto! max-h-full w-auto! max-w-full transition-[opacity,transform] duration-(--duration-slow) ease-out",
        !isRendered ? "opacity-0" : selected && dimWhenSelected ? "opacity-50" : "opacity-100"
      )}
      style:transform={rotation ? `rotate(${rotation}deg) scale(${sideways ? 0.75 : 1})` : undefined}
    ></canvas>
    <span
      class="absolute left-1.5 top-1.5 rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium tabular-nums text-foreground shadow-xs"
      aria-hidden="true"
    >
      {number}
    </span>
    {#if badge}
      <span class="absolute right-1.5 top-1.5">{@render badge()}</span>
    {:else if onToggle}
      <span
        aria-hidden="true"
        class={cn(
          "absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full border-2 shadow-xs transition-colors duration-(--duration-fast)",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border-strong bg-background/90 text-transparent group-hover:border-placeholder"
        )}
      >
        <Check class="size-3.5" />
      </span>
    {/if}
    {#if actions}
      <span class="absolute right-1.5 top-1.5 flex flex-col gap-1 rounded-lg">{@render actions()}</span>
    {/if}
  </span>

  {#if footer}
    {@render footer()}
  {:else}
    <span class="flex min-h-5 items-center justify-between gap-1 px-0.5 text-xs tabular-nums" aria-hidden="true">
      <span class="truncate text-muted-foreground">{footerLabel ?? `Page ${number}`}</span>
      {#if footerNote}
        <span class={cn("shrink-0", footerNoteStrong ? "font-medium text-foreground" : "text-muted-foreground")}>{footerNote}</span>
      {/if}
    </span>
  {/if}
{/snippet}

{#if onToggle}
  <button type="button" use:lazy onclick={onToggle} aria-pressed={selected} aria-label={ariaLabel ?? `Page ${number}`} class={frame}>
    {@render body()}
  </button>
{:else}
  <div use:lazy role="group" aria-label={ariaLabel ?? `Page ${number}`} class={frame}>
    {@render body()}
  </div>
{/if}
