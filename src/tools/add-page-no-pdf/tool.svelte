<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    ArrowRight,
    FileText,
    Hash,
    LayoutTemplate,
    Loader2,
    Trash2,
    Type,
  } from "@lucide/svelte";
  import { PageNumberState, type Position } from "./helper.svelte";

  const store = new PageNumberState();

  const positions: Position[] = [
    "top-left",
    "top-center",
    "top-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ];
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files[0])}
  />
{:else}
  <div class="flex flex-col h-full">
    <div class="border-b border-border bg-background/50 p-6 backdrop-blur-sm">
      <div
        class="mx-auto flex max-w-2xl items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
      >
        <div class="flex items-center gap-4 overflow-hidden">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"
          >
            <FileText size={20} />
          </div>
          <div class="min-w-0">
            <h3 class="truncate text-sm font-medium">
              {store.state.file.name}
            </h3>
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatBytes(store.state.file.size)}</span>
              <span>•</span>
              <span>{store.state.pageCount} Pages</span>
            </div>
          </div>
        </div>
        <button
          onclick={() => store.reset()}
          class="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto bg-muted/10 p-6">
      <div class="mx-auto max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div
            class="rounded-xl border border-border bg-card p-6 shadow-sm h-full"
          >
            <div
              class="flex items-center gap-2 border-b border-border pb-4 mb-6"
            >
              <LayoutTemplate size={18} class="text-primary" />
              <h3 class="font-semibold">Position</h3>
            </div>

            <div
              class="aspect-3/4 max-h-75 w-full mx-auto bg-muted/30 border border-dashed border-border rounded-lg relative p-4"
            >
              <div
                class="absolute inset-4 bg-background shadow-sm border border-border rounded flex flex-col justify-between p-4"
              >
                <div class="flex justify-between">
                  <Button
                    variant={store.state.position === "top-left"
                      ? "default"
                      : "outline"}
                    size="icon-sm"
                    onclick={() => (store.state.position = "top-left")}
                    class="rounded-full border-2 transition-all hover:scale-110"
                  ></Button>
                  <Button
                    onclick={() => (store.state.position = "top-center")}
                    variant={store.state.position === "top-center"
                      ? "default"
                      : "outline"}
                    size="icon-sm"
                    class="rounded-full border-2 transition-all hover:scale-110"
                  ></Button>
                  <Button
                    onclick={() => (store.state.position = "top-right")}
                    variant={store.state.position === "top-right"
                      ? "default"
                      : "outline"}
                    size="icon-sm"
                    class="rounded-full border-2 transition-all hover:scale-110"
                  ></Button>
                </div>

                <div
                  class="text-center text-xs text-muted-foreground select-none"
                >
                  Select Page Position
                </div>

                <div class="flex justify-between">
                  <Button
                    onclick={() => (store.state.position = "bottom-left")}
                    variant={store.state.position === "bottom-left"
                      ? "default"
                      : "outline"}
                    size="icon-sm"
                    class="rounded-full border-2 transition-all hover:scale-110"
                  ></Button>
                  <Button
                    onclick={() => (store.state.position = "bottom-center")}
                    variant={store.state.position === "bottom-center"
                      ? "default"
                      : "outline"}
                    size="icon-sm"
                    class="rounded-full border-2 transition-all hover:scale-110"
                  ></Button>
                  <Button
                    onclick={() => (store.state.position = "bottom-right")}
                    variant={store.state.position === "bottom-right"
                      ? "default"
                      : "outline"}
                    size="icon-sm"
                    class="rounded-full border-2 transition-all hover:scale-110"
                  ></Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div
              class="flex items-center gap-2 border-b border-border pb-4 mb-4"
            >
              <Hash size={18} class="text-primary" />
              <h3 class="font-semibold">Format & Range</h3>
            </div>

            <div class="space-y-4">
              <div>
                <label
                  for="format"
                  class="text-xs font-medium text-muted-foreground mb-1 block"
                  >Style</label
                >
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    onclick={() => (store.state.format = "n")}
                    variant={store.state.format === "n"
                      ? "default_soft"
                      : "outline"}
                  >
                    1, 2, 3...
                  </Button>
                  <Button
                    onclick={() => (store.state.format = "n of x")}
                    variant={store.state.format === "n of x"
                      ? "default_soft"
                      : "outline"}
                  >
                    1 of N
                  </Button>
                </div>
              </div>

              <div>
                <Label for="start-page" class="text-xs mb-1 block"
                  >Start Numbering From Page</Label
                >
                <Input
                  id="start-page"
                  type="number"
                  min="1"
                  max={store.state.pageCount}
                  bind:value={store.state.startFromPage}
                  class="h-9 w-full"
                />
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div
              class="flex items-center gap-2 border-b border-border pb-4 mb-4"
            >
              <Type size={18} class="text-primary" />
              <h3 class="font-semibold">Typography</h3>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="font-size" class="text-xs mb-1">Size (pt)</Label>
                <Input
                  id="font-size"
                  type="number"
                  min="6"
                  max="72"
                  bind:value={store.state.fontSize}
                  class="h-9 w-full"
                />
              </div>
              <div>
                <Label for="margin" class="text-xs mb-1">Margin (px)</Label>
                <Input
                  id="margin"
                  type="number"
                  min="0"
                  max="100"
                  bind:value={store.state.margin}
                  class="h-9 w-full"
                />
              </div>
            </div>

            <div class="mt-4">
              <Label for="color" class="text-xs mb-1">Color</Label>
              <div class="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  bind:value={store.state.color}
                  class="h-9 w-16 p-1 cursor-pointer"
                />
                <span class="text-sm font-mono text-muted-foreground uppercase"
                  >{store.state.color}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-border bg-background p-4 text-center">
      <button
        onclick={() => store.process()}
        disabled={store.state.isProcessing}
        class="inline-flex h-11 min-w-50 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {#if store.state.isProcessing}
          <Loader2 class="animate-spin" /> {store.state.progress}
        {:else}
          Add Page Numbers <ArrowRight size={18} />
        {/if}
      </button>
    </div>
  </div>
{/if}
