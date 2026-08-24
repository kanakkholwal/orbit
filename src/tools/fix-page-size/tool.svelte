<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$components/ui/select";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconLoader2 as LoaderCircle, IconBolt as Zap } from "@tabler/icons-svelte";
  import { slide } from "svelte/transition";
  import { FixPageSizeState } from "./helper.svelte";

  const store = new FixPageSizeState();

  const sizeLabel: Record<string, string> = {
    A4: "A4 · 210 × 297 mm",
    Letter: "Letter · 8.5 × 11 in",
    Legal: "Legal · 8.5 × 14 in",
    A3: "A3 · 297 × 420 mm",
    A5: "A5 · 148 × 210 mm",
    Tabloid: "Tabloid · 11 × 17 in",
    Custom: "Custom",
  };
</script>

{#if !store.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files)}
  />
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar
      label={store.file.file.name}
      onReset={() => store.reset()}
      resetLabel="Clear"
    />

    <ToolPanel title="Source">
      <FileRow name={store.file.file.name} onRemove={() => store.reset()}>
        <span class="font-mono tabular-nums">
          {formatBytes(store.file.originalSize)}
        </span>
      </FileRow>
    </ToolPanel>

    <ToolPanel title="Resize">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <Label
            for="target-size"
            class="label-eyebrow text-muted-foreground"
          >
            Target size
          </Label>
          <Select type="single" bind:value={store.targetSize}>
            <SelectTrigger id="target-size" class="h-10 rounded-sm">
              {sizeLabel[store.targetSize] || "A4"}
            </SelectTrigger>
            <SelectContent>
              {#each Object.entries(sizeLabel) as [k, v]}
                <SelectItem value={k}>{v}</SelectItem>
              {/each}
            </SelectContent>
          </Select>

          {#if store.targetSize === "Custom"}
            <div
              transition:slide={{ duration: 220 }}
              class="mt-2 grid grid-cols-3 gap-2 rounded-sm border border-border bg-muted/20 p-2.5"
            >
              <div class="flex flex-col gap-1.5">
                <Label
                  for="custom-width"
                  class="label-eyebrow text-muted-foreground"
                >
                  Width
                </Label>
                <Input
                  type="number"
                  id="custom-width"
                  step="0.01"
                  min="0.1"
                  bind:value={store.customWidth}
                  class="h-9 rounded-sm font-mono text-sm tabular-nums"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <Label
                  for="custom-height"
                  class="label-eyebrow text-muted-foreground"
                >
                  Height
                </Label>
                <Input
                  type="number"
                  id="custom-height"
                  step="0.01"
                  min="0.1"
                  bind:value={store.customHeight}
                  class="h-9 rounded-sm font-mono text-sm tabular-nums"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <Label
                  for="custom-units"
                  class="label-eyebrow text-muted-foreground"
                >
                  Units
                </Label>
                <Select type="single" bind:value={store.customUnits}>
                  <SelectTrigger id="custom-units" class="h-9 rounded-sm">
                    {store.customUnits === "in" ? "Inches" : "mm"}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Inches</SelectItem>
                    <SelectItem value="mm">mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          {/if}
        </div>

        <div class="flex flex-col gap-2">
          <Label
            for="orientation"
            class="label-eyebrow text-muted-foreground"
          >
            Orientation
          </Label>
          <Select type="single" bind:value={store.orientation}>
            <SelectTrigger id="orientation" class="h-10 rounded-sm">
              {store.orientation === "auto"
                ? "Auto · keep original"
                : store.orientation === "portrait"
                  ? "Portrait"
                  : "Landscape"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto · keep original</SelectItem>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex flex-col gap-2 sm:col-span-2">
          <Label
            class="label-eyebrow text-muted-foreground"
          >
            Content scaling
          </Label>
          <div class="flex flex-col gap-2 sm:flex-row">
            {#each [
              {
                value: "fit",
                title: "Fit content",
                body: "Preserves all original content. May add blank margins if aspect ratios differ.",
              },
              {
                value: "fill",
                title: "Fill page",
                body: "Scales content to fill the entire target page. May crop edges if aspect ratios differ.",
              },
            ] as opt}
              <label
                class="group flex flex-1 cursor-pointer items-start gap-3 rounded-sm border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/30 has-checked:border-primary/40 has-checked:bg-primary/5"
              >
                <input
                  type="radio"
                  name="scaling-mode"
                  value={opt.value}
                  bind:group={store.scalingMode}
                  class="mt-1 size-3.5 rounded-full border-border accent-primary"
                />
                <span class="flex flex-col gap-0.5">
                  <span class="text-sm font-medium text-foreground">
                    {opt.title}
                  </span>
                  <span class="text-xs leading-relaxed text-muted-foreground">
                    {opt.body}
                  </span>
                </span>
              </label>
            {/each}
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:col-span-2">
          <Label
            for="bg-color"
            class="label-eyebrow text-muted-foreground"
          >
            Background color
          </Label>
          <div class="flex items-center gap-3">
            <Input
              id="bg-color"
              type="color"
              class="h-10 w-20 cursor-pointer rounded-sm p-1"
              bind:value={store.backgroundColor}
            />
            <div class="flex flex-col">
              <span
                class="font-mono text-sm uppercase tabular-nums text-foreground"
              >
                {store.backgroundColor}
              </span>
              <span
                class="label-eyebrow text-muted-foreground"
              >
                Applied to empty margins when fitting
              </span>
            </div>
          </div>
        </div>
      </div>
    </ToolPanel>

    <ToolFooter
      hint={store.isProcessing ? "Standardizing pages" : "Fix page size"}
    >
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.process()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          Standardizing
        {:else}
          <Zap class="size-4" />
          Fix page size
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
