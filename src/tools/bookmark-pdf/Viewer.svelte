<script lang="ts">
  import { Button } from "$components/ui/button";
  import type { BookmarkPdfState } from "./helper.svelte";

  let { store } = $props<{ store: BookmarkPdfState }>();
  let canvasEl: HTMLCanvasElement;
  let wrapperEl: HTMLDivElement;

  $effect(() => {
    // Re-render when page changes
    if (canvasEl && store.state.file) {
      store.renderCurrentPage(canvasEl);
    }
  });

  function handleCanvasClick(e: MouseEvent) {
    if (!store.state.isPicking) return;

    const rect = canvasEl.getBoundingClientRect();
    // Calculate Normalized PDF Coordinates (0-1 range usually safer, but using PDF points approx)
    // PDF origin is bottom-left, Canvas is top-left.
    // Basic implementation: pass raw pixel % for relative positioning or handle in helper logic

    // Let's assume helper handles coordinate translation if needed.
    // For now, passing Canvas visual coordinates for UI feedback.

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Dispatch event back to tool to fill modal
    const event = new CustomEvent("destination-picked", {
      detail: {
        page: store.state.currentPage,
        // Convert to PDF coordinate system approximation (72 DPI vs Display DPI)
        // Simplified: just passing relative % might be better for responsive logic
        x: x,
        y: rect.height - y, // Invert Y
      },
    });
    document.dispatchEvent(event);

    store.state.isPicking = false; // Turn off picking mode
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center justify-between p-2 border-b bg-muted/20">
    <div class="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={store.state.currentPage <= 1}
        onclick={() => store.state.currentPage--}
      >
        Prev
      </Button>
      <span class="text-sm font-mono"
        >{store.state.currentPage} / {store.state.pageCount}</span
      >
      <Button
        size="sm"
        variant="outline"
        disabled={store.state.currentPage >= store.state.pageCount}
        onclick={() => store.state.currentPage++}
      >
        Next</Button
      >
    </div>
    {#if store.state.isPicking}
      <div
        class="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold animate-pulse"
      >
        Click on page to set destination
      </div>
    {/if}
  </div>

  <div
    bind:this={wrapperEl}
    class="flex-1 overflow-auto bg-muted p-4 flex justify-center relative {store
      .state.isPicking
      ? 'cursor-crosshair'
      : ''}"
  >
    <canvas
      bind:this={canvasEl}
      onclick={handleCanvasClick}
      class="shadow-lg max-w-full"
    ></canvas>
  </div>
</div>
