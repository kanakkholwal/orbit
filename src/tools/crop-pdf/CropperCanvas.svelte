<script lang="ts">
  import { Loader2 } from "@lucide/svelte";
  import Cropper from "cropperjs";
  import "cropperjs/dist/cropper.css";
  import { onDestroy } from "svelte";
  import type { CropPdfState } from "./helper.svelte";

  let { store } = $props<{ store: CropPdfState }>();

  let imageEl: HTMLImageElement;
  let cropper: Cropper | null = null;
  let isLoading = $state(true);
  let currentBlobUrl: string | null = null;

  $effect(() => {
    const pageIndex = store.state.currentPage;
    if (store.state.file) {
      updateImageSource(pageIndex);
    }
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
      
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Failed to create image blob");
      
      currentBlobUrl = URL.createObjectURL(blob);

      if (cropper) {
        // v1.5.x supports replace() natively
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
      dragMode: 'move',
      autoCropArea: 0.8,
      responsive: true,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      
      ready() {
        isLoading = false;
        applySavedCrop();
      },
      
      cropend() {
        saveCurrentCrop();
      }
    });
  }

  function applySavedCrop() {
    if (!cropper) return;
    
    const saved = store.state.pageCrops[store.state.currentPage];
    const imgData = cropper.getImageData();

    if (saved) {
      cropper.setData({
        x: saved.x * imgData.naturalWidth,
        y: saved.y * imgData.naturalHeight,
        width: saved.width * imgData.naturalWidth,
        height: saved.height * imgData.naturalHeight,
        rotate: 0,
        scaleX: 1,
        scaleY: 1
      });
    }
  }

  function saveCurrentCrop() {
    if (!cropper) return;
    
    // In v1 types, getData(true) is standard and correctly typed
    const data = cropper.getData(true); 
    const imgData = cropper.getImageData();
    
    store.saveCrop(store.state.currentPage, {
      x: data.x / imgData.naturalWidth,
      y: data.y / imgData.naturalHeight,
      width: data.width / imgData.naturalWidth,
      height: data.height / imgData.naturalHeight
    });
  }
</script>

<div class="relative w-full h-150 bg-muted/10 rounded-xl overflow-hidden border border-border flex items-center justify-center p-4">
    {#if isLoading}
        <div class="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-20 backdrop-blur-sm transition-opacity duration-200">
            <Loader2 class="animate-spin h-10 w-10 text-primary mb-2" />
            <span class="text-sm text-muted-foreground font-medium">Rendering Page...</span>
        </div>
    {/if}

    <img 
        bind:this={imageEl} 
        onload={initCropper}
        alt="Page View" 
        class="max-w-full max-h-full block opacity-0"
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