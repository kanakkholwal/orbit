<script lang="ts">
  import { IconCheck as Check, IconLoader2 as Loader } from "@tabler/icons-svelte";
  import type { SplitState } from "./helper.svelte";

  type Props = { store: SplitState; index: number; part?: number };

  let { store, index, part }: Props = $props();

  let canvas: HTMLCanvasElement;
  let isRendered = $state(false);

  const selectable = $derived(part === undefined);
  const selected = $derived(selectable && store.selectedPages.has(index));
  const pageNumber = $derived(index + 1);

  function lazy(node: HTMLElement) {
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (!isRendered && canvas) {
          store
            .renderThumbnail(canvas, index)
            .then(() => (isRendered = true))
            .catch(console.error);
        }
        obs.disconnect();
      },
      { rootMargin: "200px" }
    );
    obs.observe(node);
    return { destroy: () => obs.disconnect() };
  }
</script>

{#snippet preview()}
  <span class="relative grid aspect-3/4 place-items-center overflow-hidden rounded-lg bg-muted">
    {#if !isRendered}
      <Loader class="absolute size-4 animate-spin text-muted-foreground" />
    {/if}
    <canvas
      bind:this={canvas}
      class="pointer-events-none h-auto! max-h-full w-auto! max-w-full transition-opacity duration-300 {isRendered
        ? 'opacity-100'
        : 'opacity-0'}"
    ></canvas>
    <span
      class="absolute left-1.5 top-1.5 rounded-md bg-background/90 px-1.5 py-0.5 text-caption font-medium tabular-nums text-foreground shadow-xs"
      aria-hidden="true"
    >
      {pageNumber}
    </span>
    {#if selectable}
      <span
        aria-hidden="true"
        class="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full border-2 shadow-xs transition-colors duration-150 {selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border-strong bg-background/90 text-transparent group-hover:border-placeholder'}"
      >
        <Check class="size-3.5" stroke={3} />
      </span>
    {/if}
  </span>
  <span class="flex min-h-5 items-center justify-between gap-1 px-0.5 text-caption tabular-nums" aria-hidden="true">
    <span class="truncate text-muted-foreground">Page {pageNumber}</span>
    {#if part !== undefined}
      <span class="shrink-0 font-medium text-foreground">File {part}</span>
    {/if}
  </span>
{/snippet}

{#if selectable}
  <button
    type="button"
    use:lazy
    onclick={() => store.togglePageSelection(index)}
    aria-pressed={selected}
    aria-label={`Page ${pageNumber}`}
    class="group relative flex flex-col gap-1.5 rounded-xl border bg-card p-1.5 text-left outline-none transition-[border-color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background {selected
      ? 'border-primary shadow-[0_0_0_1px_var(--color-primary)]'
      : 'border-border hover:border-border-strong hover:shadow-sm'}"
  >
    {@render preview()}
  </button>
{:else}
  <div
    use:lazy
    role="group"
    aria-label={`Page ${pageNumber}, file ${part}`}
    class="relative flex flex-col gap-1.5 rounded-xl border border-border bg-card p-1.5"
  >
    {@render preview()}
  </div>
{/if}
