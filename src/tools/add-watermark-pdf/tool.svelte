<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import {
    ArrowRight,
    Image as ImageIcon,
    LoaderCircle,
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
  <div class="flex flex-col gap-8">
    <ToolBar
      label="Watermark"
      onReset={() => store.reset()}
      resetLabel="Clear"
    />

    <ToolPanel title="Source">
      <FileRow name={store.state.file.name} onRemove={() => store.reset()}>
        <span class="font-mono tabular-nums">
          {formatBytes(store.state.file.size)}
        </span>
      </FileRow>
    </ToolPanel>

    <ToolPanel title="Type">
      <div class="grid grid-cols-2 gap-1 rounded-sm bg-muted/40 p-1">
        {#each [
          { id: "text", label: "Text", icon: Type },
          { id: "image", label: "Image", icon: ImageIcon },
        ] as opt}
          <button
            type="button"
            onclick={() => (store.state.watermarkType = opt.id as any)}
            class={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
              store.state.watermarkType === opt.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <opt.icon class="size-3" />
            {opt.label}
          </button>
        {/each}
      </div>
    </ToolPanel>

    <ToolPanel title="Settings">
      {#if store.state.watermarkType === "text"}
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <Label
              for="wm-text"
              class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
            >
              Text
            </Label>
            <Input
              id="wm-text"
              type="text"
              bind:value={store.state.text}
              class="h-10 rounded-sm font-mono text-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <Label
                for="wm-size"
                class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                Size · pt
              </Label>
              <Input
                id="wm-size"
                type="number"
                bind:value={store.state.fontSize}
                min="10"
                max="200"
                class="h-10 rounded-sm font-mono text-sm tabular-nums"
              />
            </div>
            <div class="flex flex-col gap-2">
              <Label
                for="wm-color"
                class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                Color
              </Label>
              <div class="flex items-center gap-2">
                <Input
                  id="wm-color"
                  type="color"
                  bind:value={store.state.color}
                  class="h-10 w-16 cursor-pointer rounded-sm p-1"
                />
                <span class="font-mono text-xs uppercase tabular-nums text-muted-foreground">
                  {store.state.color}
                </span>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <Label
              for="input:watermark"
              class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
            >
              Watermark image
            </Label>
            <Input
              type="file"
              id="input:watermark"
              accept="image/png, image/jpeg"
              onchange={(e) => {
                const files = e.currentTarget.files;
                if (files && files.length > 0) store.state.imageFile = files[0];
              }}
              class="h-10 rounded-sm font-mono text-xs"
            />
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <Label
                for="wm-scale"
                class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                Scale
              </Label>
              <span class="font-mono text-sm tabular-nums text-primary">
                {store.state.imageScale}x
              </span>
            </div>
            <input
              id="wm-scale"
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              bind:value={store.state.imageScale}
              class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted/60 accent-primary"
            />
          </div>
        </div>
      {/if}

      <div class="mt-6 flex flex-col gap-5 border-t border-border/60 pt-5">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <Label
              for="wm-opacity"
              class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
            >
              Opacity
            </Label>
            <span class="font-mono text-sm tabular-nums text-primary">
              {Math.round(store.state.opacity * 100)}%
            </span>
          </div>
          <input
            id="wm-opacity"
            type="range"
            min="0"
            max="1"
            step="0.1"
            bind:value={store.state.opacity}
            class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted/60 accent-primary"
          />
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <Label
              for="wm-rotation"
              class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
            >
              Rotation
            </Label>
            <span class="font-mono text-sm tabular-nums text-primary">
              {store.state.rotation}°
            </span>
          </div>
          <input
            id="wm-rotation"
            type="range"
            min="-180"
            max="180"
            step="5"
            bind:value={store.state.rotation}
            class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted/60 accent-primary"
          />
        </div>
      </div>
    </ToolPanel>

    <ToolFooter hint={store.isProcessing ? store.progressLabel : "Add watermark"}>
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.process()}
        disabled={store.isProcessing ||
          (store.state.watermarkType === "image" && !store.state.imageFile)}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progressLabel}
        {:else}
          Add watermark
          <ArrowRight class="size-4" />
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
