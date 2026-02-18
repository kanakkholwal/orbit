<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    ArrowRight,
    FileText,
    Image as ImageIcon,
    Loader2,
    Settings2,
    Trash2,
    Type,
  } from "@lucide/svelte";
  import { AddWatermarkState } from "./helper.svelte";

  const store = new AddWatermarkState();
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files[0])}
  />
{:else}
  <div
    class="mx-auto flex max-w-2xl items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
  >
    <div class="flex items-center gap-4 overflow-hidden">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600"
      >
        <FileText size={20} />
      </div>
      <div class="min-w-0">
        <h3 class="truncate text-sm font-medium">{store.state.file.name}</h3>
        <p class="text-xs text-muted-foreground">
          {formatBytes(store.state.file.size)}
        </p>
      </div>
    </div>
    <button
      onclick={() => store.reset()}
      class="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
    >
      <Trash2 size={18} />
    </button>
  </div>

  <div class="flex-1 overflow-y-auto py-6">
    <div class="mx-auto max-w-lg space-y-8">
      <div
        class="flex rounded-lg bg-card p-1 border border-border shadow-sm flex-wrap gap-2"
      >
        <Button
          variant={store.state.watermarkType === "text"
            ? "outline"
            : "secondary"}
          onclick={() => (store.state.watermarkType = "text")}
          class="flex-1"
        >
          <Type size={16} /> Text
        </Button>
        <Button
          onclick={() => (store.state.watermarkType = "image")}
          variant={store.state.watermarkType === "image"
            ? "outline"
            : "secondary"}
          class="flex-1"
        >
          <ImageIcon size={16} /> Image
        </Button>
      </div>

      <div
        class="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div class="flex items-center gap-2 border-b border-border pb-4 mb-4">
          <Settings2 size={18} class="text-primary" />
          <h3 class="font-semibold">Watermark Settings</h3>
        </div>

        {#if store.state.watermarkType === "text"}
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="wm-text" class="text-sm font-medium">Text</Label>
              <Input
                id="wm-text"
                type="text"
                bind:value={store.state.text}
                class="h-10 w-full rounded-md"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="wm-size" class="text-sm font-medium"
                  >Size (pt)</Label
                >
                <Input
                  id="wm-size"
                  type="number"
                  bind:value={store.state.fontSize}
                  min="10"
                  max="200"
                  class="flex h-10 w-full rounded-md"
                />
              </div>
              <div class="space-y-2">
                <Label for="wm-color" class="text-sm font-medium">Color</Label>
                <div class="flex items-center gap-2">
                  <Input
                    id="wm-color"
                    type="color"
                    bind:value={store.state.color}
                    class="h-10 w-16 p-1 rounded-md border border-input cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        {:else}
          <div class="space-y-4">
            <div class="space-y-2">
              <Label class="text-sm font-medium" for="input:watermark"
                >Watermark Image</Label
              >
              <div class="flex items-center gap-2">
                <Input
                  type="file"
                  id="input:watermark"
                  accept="image/png, image/jpeg"
                  onchange={(e) => {
                    const files = e.currentTarget.files;
                    if (files && files.length > 0)
                      store.state.imageFile = files[0];
                  }}
                  class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label for="wm-scale" class="text-sm font-medium"
                >Scale ({store.state.imageScale}x)</label
              >
              <input
                id="wm-scale"
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                bind:value={store.state.imageScale}
                class="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        {/if}

        <div class="border-t border-border pt-4 mt-4 space-y-4">
          <div class="space-y-2">
            <div class="flex justify-between">
              <label for="wm-opacity" class="text-sm font-medium">Opacity</label
              >
              <span class="text-xs text-muted-foreground"
                >{store.state.opacity}</span
              >
            </div>
            <input
              id="wm-opacity"
              type="range"
              min="0"
              max="1"
              step="0.1"
              bind:value={store.state.opacity}
              class="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div class="space-y-2">
            <div class="flex justify-between">
              <label for="wm-rotation" class="text-sm font-medium"
                >Rotation</label
              >
              <span class="text-xs text-muted-foreground"
                >{store.state.rotation}°</span
              >
            </div>
            <input
              id="wm-rotation"
              type="range"
              min="-180"
              max="180"
              step="5"
              bind:value={store.state.rotation}
              class="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="border-t border-border p-4 text-center">
    <Button
      onclick={() => store.process()}
      disabled={store.state.isProcessing ||
        (store.state.watermarkType === "image" && !store.state.imageFile)}
      class="inline-flex h-11 min-w-50 px-8"
      variant="dark"
    >
      {#if store.state.isProcessing}
        <Loader2 class="animate-spin" /> {store.state.progress}
      {:else}
        Add Watermark <ArrowRight size={18} />
      {/if}
    </Button>
  </div>
{/if}
