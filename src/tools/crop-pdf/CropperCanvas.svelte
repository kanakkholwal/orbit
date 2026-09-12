<script lang="ts">
  import { cn } from "$lib/utils";
  import { IconLoader2 as Loader } from "@tabler/icons-svelte";
  import Cropper from "cropperjs";
  import "cropperjs/dist/cropper.css";
  import { onDestroy, untrack } from "svelte";
  import type { CropData, CropPdfState } from "./helper.svelte";

  let { store, class: className }: { store: CropPdfState; class?: string } = $props();

  let imageEl: HTMLImageElement;
  let cropper: Cropper | null = null;
  let isLoading = $state(true);
  let currentBlobUrl: string | null = null;

  $effect(() => {
    const pageIndex = store.state.currentPage;
    if (store.state.file) untrack(() => updateImageSource(pageIndex));
  });

  $effect(() => {
    const saved = store.state.pageCrops[store.state.currentPage];
    const target: CropData | null = saved ? { x: saved.x, y: saved.y, width: saved.width, height: saved.height } : null;
    if (isLoading) return;
    untrack(() => syncCropper(target));
  });

  onDestroy(() => {
    if (cropper) cropper.destroy();
    if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
  });

  async function updateImageSource(pageNum: number) {
    isLoading = true;

    try {
      const canvas = document.createElement("canvas");
      await store.renderPageForCropper(canvas, pageNum);

      if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Failed to create image blob");

      currentBlobUrl = URL.createObjectURL(blob);

      if (cropper) {
        cropper.replace(currentBlobUrl);
      } else {
        imageEl.src = currentBlobUrl;
      }
    } catch (e) {
      console.error("Cropper render error:", e);
      isLoading = false;
    }
  }

  function initCropper() {
    if (cropper) return;

    cropper = new Cropper(imageEl, {
      viewMode: 1,
      dragMode: "crop",
      autoCropArea: 1,
      responsive: true,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      zoomOnWheel: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,

      ready() {
        applySavedCrop();
        isLoading = false;
      },

      cropend() {
        saveCurrentCrop();
      },
    });
  }

  function applySavedCrop() {
    const saved = store.state.pageCrops[store.state.currentPage];
    syncCropper(saved ?? null);
  }

  function syncCropper(target: CropData | null) {
    if (!cropper) return;
    const img = cropper.getImageData();
    if (!img.naturalWidth) return;
    const want = target
      ? {
          x: target.x * img.naturalWidth,
          y: target.y * img.naturalHeight,
          width: target.width * img.naturalWidth,
          height: target.height * img.naturalHeight,
        }
      : { x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight };
    const have = cropper.getData();
    const close =
      Math.abs(have.x - want.x) < 1 &&
      Math.abs(have.y - want.y) < 1 &&
      Math.abs(have.width - want.width) < 1 &&
      Math.abs(have.height - want.height) < 1;
    if (!close) cropper.setData({ ...want, rotate: 0, scaleX: 1, scaleY: 1 });
  }

  function saveCurrentCrop() {
    if (!cropper) return;
    const data = cropper.getData(true);
    const imgData = cropper.getImageData();

    store.saveCrop(store.state.currentPage, {
      x: data.x / imgData.naturalWidth,
      y: data.y / imgData.naturalHeight,
      width: data.width / imgData.naturalWidth,
      height: data.height / imgData.naturalHeight,
    });
  }
</script>

<div class={cn("relative w-full overflow-hidden rounded-xl border border-border bg-muted", className)}>
  {#if isLoading}
    <div class="absolute inset-0 z-20 flex items-center justify-center gap-2 bg-muted" aria-live="polite">
      <Loader class="size-4 animate-spin text-primary" />
      <span class="text-body text-muted-foreground">Loading page {store.state.currentPage}</span>
    </div>
  {/if}

  <img
    bind:this={imageEl}
    onload={initCropper}
    alt={`Page ${store.state.currentPage} of ${store.state.file?.name ?? "the PDF"}`}
    class="block max-h-full max-w-full opacity-0"
  />
</div>

<style>
  :global(.cropper-view-box) {
    outline: 2px solid var(--color-primary);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5);
  }
  :global(.cropper-point) {
    background-color: var(--color-primary);
    width: 8px;
    height: 8px;
  }
  :global(.cropper-line) {
    background-color: var(--color-primary);
  }
  :global(.cropper-modal) {
    opacity: 0.5;
    background-color: var(--color-background);
  }
</style>
