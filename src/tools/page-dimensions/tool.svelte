<script lang="ts">
  import { FileRow, ToolBar, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Label } from "$components/ui/label";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$components/ui/select";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import {
    IconAlertTriangle as AlertTriangle,
    IconDownload as Download,
    IconPhoto as FileImage,
    IconLoader2 as LoaderCircle,
  } from "@tabler/icons-svelte";
  import { slide } from "svelte/transition";
  import { PageDimensionsState } from "./helper.svelte";

  const store = new PageDimensionsState();

  const unitLabel: Record<string, string> = {
    pt: "Points · pt",
    in: "Inches · in",
    mm: "Millimeters · mm",
    px: "Pixels · px",
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
      <FileRow name={store.file.file.name}>
        <span class="font-mono tabular-nums">
          {formatBytes(store.file.originalSize)}
        </span>
      </FileRow>
    </ToolPanel>

    {#if store.isProcessing}
      <div
        class="flex flex-col items-center gap-3 rounded-md border border-dashed border-border/60 bg-muted/20 px-6 py-16"
      >
        <span class="inline-flex size-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
          <LoaderCircle class="size-4 animate-spin" />
        </span>
        <p
          class="label-eyebrow text-muted-foreground"
        >
          Analyzing dimensions
        </p>
      </div>
    {:else if store.analyzedPagesData.length > 0}
      <ToolPanel title="Summary">
        <dl
          class="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 sm:grid-cols-3"
        >
          <div class="flex flex-col gap-1 bg-card px-4 py-3">
            <dt class="label-eyebrow text-muted-foreground">
              Total pages
            </dt>
            <dd class="font-mono text-2xl tabular-nums text-foreground">
              {String(store.summaryStats.totalPages).padStart(2, "0")}
            </dd>
          </div>
          <div class="flex flex-col gap-1 bg-card px-4 py-3">
            <dt class="label-eyebrow text-muted-foreground">
              Unique sizes
            </dt>
            <dd class="font-mono text-2xl tabular-nums text-foreground">
              {String(store.summaryStats.uniqueSizesCount).padStart(2, "0")}
            </dd>
          </div>
          <div class="flex flex-col gap-1 bg-card px-4 py-3">
            <dt class="label-eyebrow text-muted-foreground">
              Document
            </dt>
            <dd
              class={cn(
                "font-mono text-lg uppercase tabular-nums",
                store.summaryStats.hasMixedSizes
                  ? "text-warning"
                  : "text-success"
              )}
            >
              {store.summaryStats.hasMixedSizes ? "Mixed" : "Uniform"}
            </dd>
          </div>
        </dl>
      </ToolPanel>

      {#if store.summaryStats.hasMixedSizes}
        <div transition:slide={{ duration: 220 }}>
          <ToolPanel title="Warning">
            <div
              class="flex items-start gap-3 rounded-sm border border-warning/30 bg-warning/5 px-4 py-3"
            >
              <span
                class="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-warning/15 text-warning"
              >
                <AlertTriangle class="size-3.5" />
              </span>
              <div class="flex flex-col gap-2">
                <span
                  class="label-eyebrow text-warning"
                >
                  Mixed page sizes
                </span>
                <p class="text-xs leading-relaxed text-muted-foreground">
                  This document contains pages with varying dimensions. May
                  affect printing.
                </p>
                <ul class="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                  {#each store.summaryStats.uniqueSizes as size}
                    <li class="flex items-center gap-2">
                      <span
                        class="font-mono text-[10px] tabular-nums text-muted-foreground/70"
                      >
                        {String(size.count).padStart(2, "0")}
                      </span>
                      <span>·</span>
                      <span>{size.label}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          </ToolPanel>
        </div>
      {/if}

      <ToolPanel title="Pages" counter={store.analyzedPagesData.length}>
        {#snippet actions()}
          <div class="flex items-center gap-2">
            <Label
              for="units-select"
              class="label-eyebrow text-muted-foreground"
            >
              Units
            </Label>
            <Select type="single" bind:value={store.selectedUnit}>
              <SelectTrigger
                id="units-select"
                class="h-8 w-32 rounded-sm font-mono text-[11px]"
              >
                {unitLabel[store.selectedUnit] || "Inches · in"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Inches · in</SelectItem>
                <SelectItem value="mm">Millimeters · mm</SelectItem>
                <SelectItem value="pt">Points · pt</SelectItem>
                <SelectItem value="px">Pixels · px</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onclick={() => store.exportToCSV()}
              class="rounded-sm"
            >
              <Download class="size-3.5" />
              <span class="hidden sm:inline">CSV</span>
            </Button>
          </div>
        {/snippet}

        <div
          class="overflow-x-auto rounded-sm border border-border/60 bg-card"
        >
          <table class="w-full text-left text-sm">
            <thead
              class="border-b border-border/60 bg-muted/30 label-eyebrow text-muted-foreground"
            >
              <tr>
                <th class="px-4 py-2.5 font-medium">Page</th>
                <th class="px-4 py-2.5 font-medium">Dimensions</th>
                <th class="px-4 py-2.5 font-medium">Standard</th>
                <th class="px-4 py-2.5 font-medium">Orientation</th>
                <th class="px-4 py-2.5 font-medium">Aspect</th>
                <th class="px-4 py-2.5 font-medium">Area</th>
                <th class="px-4 py-2.5 font-medium">Rotation</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/60">
              {#each store.analyzedPagesData as page}
                <tr class="transition-colors hover:bg-muted/30">
                  <td class="px-4 py-2.5 font-mono tabular-nums text-foreground">
                    {String(page.pageNum).padStart(2, "0")}
                  </td>
                  <td class="px-4 py-2.5 font-mono text-xs tabular-nums">
                    {store.convertPoints(page.width, store.selectedUnit)} ×
                    {store.convertPoints(page.height, store.selectedUnit)}
                    <span class="text-muted-foreground/60">{store.selectedUnit}</span>
                  </td>
                  <td class="px-4 py-2.5">
                    <span
                      class={cn(
                        "inline-flex items-center rounded-xs px-1.5 py-0.5 label-eyebrow",
                        page.standardSize === "Custom"
                          ? "bg-muted/60 text-muted-foreground"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {page.standardSize}
                    </span>
                  </td>
                  <td class="px-4 py-2.5 text-xs">
                    <span class="inline-flex items-center gap-1.5 text-muted-foreground">
                      <FileImage
                        class={cn(
                          "size-3 opacity-60",
                          page.orientation === "Landscape" && "rotate-90"
                        )}
                      />
                      {page.orientation}
                    </span>
                  </td>
                  <td class="px-4 py-2.5 font-mono text-xs tabular-nums">
                    {store.getAspectRatio(page.width, page.height)}
                  </td>
                  <td class="px-4 py-2.5 font-mono text-xs tabular-nums">
                    {store.calculateArea(page.width, page.height, store.selectedUnit)}
                  </td>
                  <td class="px-4 py-2.5 font-mono text-xs tabular-nums">
                    {page.rotation}°
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </ToolPanel>
    {/if}
  </div>
{/if}
