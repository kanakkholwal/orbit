<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import { IconArrowRight as ArrowRight, IconLoader2 as LoaderCircle } from "@tabler/icons-svelte";
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
  <div class="flex flex-col gap-8">
    <ToolBar
      label={store.state.file.name}
      count={store.state.pageCount}
      onReset={() => store.reset()}
      resetLabel="Clear"
    />

    <ToolPanel title="Source">
      <FileRow name={store.state.file.name} onRemove={() => store.reset()}>
        <span class="font-mono tabular-nums">
          {formatBytes(store.state.file.size)}
        </span>
        <span class="text-muted-foreground/40">·</span>
        <span class="font-mono tabular-nums">
          {store.state.pageCount} pages
        </span>
      </FileRow>
    </ToolPanel>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ToolPanel title="Position">
        <div
          class="relative aspect-3/4 max-h-72 w-full rounded-sm border border-dashed border-border/60 bg-muted/20 p-3"
        >
          <div
            class="absolute inset-3 flex flex-col justify-between rounded-sm border border-border/60 bg-card p-3"
          >
            <div class="flex justify-between">
              {#each ["top-left", "top-center", "top-right"] as p}
                <button
                  type="button"
                  onclick={() => (store.state.position = p as Position)}
                  aria-label={p}
                  aria-pressed={store.state.position === p}
                  class={cn(
                    "size-3 rounded-full border-2 transition-all hover:scale-110",
                    store.state.position === p
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  )}
                ></button>
              {/each}
            </div>

            <div
              class="text-center label-eyebrow text-muted-foreground"
            >
              Select position
            </div>

            <div class="flex justify-between">
              {#each ["bottom-left", "bottom-center", "bottom-right"] as p}
                <button
                  type="button"
                  onclick={() => (store.state.position = p as Position)}
                  aria-label={p}
                  aria-pressed={store.state.position === p}
                  class={cn(
                    "size-3 rounded-full border-2 transition-all hover:scale-110",
                    store.state.position === p
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  )}
                ></button>
              {/each}
            </div>
          </div>
        </div>
        <p
          class="mt-3 label-eyebrow text-muted-foreground"
        >
          Active · {store.state.position.replace("-", " ")}
        </p>
      </ToolPanel>

      <div class="flex flex-col gap-6">
        <ToolPanel title="Format">
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-1 rounded-sm bg-muted/40 p-1">
              {#each [
                { id: "n", label: "1, 2, 3…" },
                { id: "n of x", label: "1 of N" },
              ] as opt}
                <button
                  type="button"
                  onclick={() => (store.state.format = opt.id as any)}
                  class={cn(
                    "rounded-sm px-3 py-1.5 label-eyebrow transition-colors",
                    store.state.format === opt.id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              {/each}
            </div>

            <div class="flex flex-col gap-2">
              <Label
                for="start-page"
                class="label-eyebrow text-muted-foreground"
              >
                Start from page
              </Label>
              <Input
                id="start-page"
                type="number"
                min="1"
                max={store.state.pageCount}
                bind:value={store.state.startFromPage}
                class="h-10 rounded-sm font-mono text-sm tabular-nums"
              />
            </div>
          </div>
        </ToolPanel>

        <ToolPanel title="Typography">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <Label
                for="font-size"
                class="label-eyebrow text-muted-foreground"
              >
                Size · pt
              </Label>
              <Input
                id="font-size"
                type="number"
                min="6"
                max="72"
                bind:value={store.state.fontSize}
                class="h-10 rounded-sm font-mono text-sm tabular-nums"
              />
            </div>
            <div class="flex flex-col gap-2">
              <Label
                for="margin"
                class="label-eyebrow text-muted-foreground"
              >
                Margin · px
              </Label>
              <Input
                id="margin"
                type="number"
                min="0"
                max="100"
                bind:value={store.state.margin}
                class="h-10 rounded-sm font-mono text-sm tabular-nums"
              />
            </div>
          </div>

          <div class="mt-4 flex flex-col gap-2">
            <Label
              for="color"
              class="label-eyebrow text-muted-foreground"
            >
              Color
            </Label>
            <div class="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                bind:value={store.state.color}
                class="h-10 w-16 cursor-pointer rounded-sm p-1"
              />
              <span
                class="font-mono text-xs uppercase tabular-nums text-muted-foreground"
              >
                {store.state.color}
              </span>
            </div>
          </div>
        </ToolPanel>
      </div>
    </div>

    <ToolFooter
      hint={store.isProcessing ? store.progressLabel : "Add page numbers"}
    >
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.process()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progressLabel}
        {:else}
          Add page numbers
          <ArrowRight class="size-4" />
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
