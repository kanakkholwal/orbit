<script lang="ts">
  import type { InsertBlankPagesState } from "./helper.svelte";

  let { store, pageIndex, position }: { store: InsertBlankPagesState; pageIndex: number; position: number } = $props();

  let canvas: HTMLCanvasElement;
  let rendered = $state(false);

  function lazy(node: HTMLElement) {
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        store
          .renderThumbnail(canvas, pageIndex)
          .then(() => (rendered = true))
          .catch(console.error);
      },
      { rootMargin: "200px" }
    );
    obs.observe(node);
    return { destroy: () => obs.disconnect() };
  }
</script>

<figure use:lazy class="flex w-16 flex-col items-center gap-1" title={`Page ${pageIndex + 1}`}>
  <div class="grid min-h-20 w-full place-items-center overflow-hidden rounded-md border border-border bg-muted">
    <canvas
      bind:this={canvas}
      aria-label={`Page ${pageIndex + 1}`}
      class="h-auto! w-full! transition-opacity duration-300 {rendered ? 'opacity-100' : 'opacity-0'}"
    ></canvas>
  </div>
  <figcaption class="text-caption tabular-nums text-muted-foreground">{position}</figcaption>
</figure>
