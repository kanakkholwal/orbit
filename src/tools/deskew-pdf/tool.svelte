<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
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
    IconAlignLeft as AlignLeft,
    IconCircleCheck as CheckCircle2,
    IconLoader2 as LoaderCircle,
    IconCircleMinus as MinusCircle,
    IconPlus as Plus,
  } from "@tabler/icons-svelte";
  import { DeskewPdfState } from "./helper.svelte";

  const store = new DeskewPdfState();
  let uploadArea: ReturnType<typeof UploadArea>;

  const thresholdLabel: Record<string, string> = {
    "0.1": "0.1° · very sensitive",
    "0.5": "0.5° · default",
    "1.0": "1.0° · normal",
    "2.0": "2.0° · less sensitive",
  };
  const dpiLabel: Record<string, string> = {
    "100": "100 DPI · fast",
    "150": "150 DPI · default",
    "200": "200 DPI · better",
    "300": "300 DPI · best",
  };
</script>

<UploadArea
  bind:this={uploadArea}
  accept=".pdf"
  multiple={true}
  onFilesSelected={(files) => store.addFiles(files)}
  class={store.files.length > 0 ? "hidden" : ""}
/>

{#if store.files.length > 0}
  <div class="flex flex-col gap-8">
    <ToolBar
      label="Documents"
      count={store.files.length}
      onReset={() => store.reset()}
      resetLabel="Clear all"
    >
      {#snippet actions()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => uploadArea.click()}
          disabled={store.isProcessing}
          class="rounded-sm"
        >
          <Plus class="size-3.5" />
          <span class="hidden sm:inline">Add</span>
        </Button>
      {/snippet}
    </ToolBar>

    <ToolPanel title="Files" counter={store.files.length}>
      <ul class="flex flex-col gap-2">
        {#each store.files as file (file.id)}
          <li>
            <FileRow
              name={file.file.name}
              onRemove={!store.isProcessing
                ? () => store.removeFile(file.id)
                : undefined}
            >
              <span class="font-mono tabular-nums">
                {formatBytes(file.originalSize)}
              </span>
            </FileRow>
          </li>
        {/each}
      </ul>
    </ToolPanel>

    <ToolPanel title="Settings">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-2">
          <Label
            for="deskew-threshold"
            class="label-eyebrow text-muted-foreground"
          >
            Threshold · degrees
          </Label>
          <Select type="single" bind:value={store.threshold}>
            <SelectTrigger id="deskew-threshold" class="h-10 rounded-sm">
              {thresholdLabel[store.threshold] || "0.5° · default"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.1">0.1° · very sensitive</SelectItem>
              <SelectItem value="0.5">0.5° · default</SelectItem>
              <SelectItem value="1.0">1.0° · normal</SelectItem>
              <SelectItem value="2.0">2.0° · less sensitive</SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs leading-relaxed text-muted-foreground">
            Pages with skew below this angle are left untouched.
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <Label
            for="deskew-dpi"
            class="label-eyebrow text-muted-foreground"
          >
            Quality · DPI
          </Label>
          <Select type="single" bind:value={store.dpi}>
            <SelectTrigger id="deskew-dpi" class="h-10 rounded-sm">
              {dpiLabel[store.dpi] || "150 DPI · default"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100 DPI · fast</SelectItem>
              <SelectItem value="150">150 DPI · default</SelectItem>
              <SelectItem value="200">200 DPI · better</SelectItem>
              <SelectItem value="300">300 DPI · best</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </ToolPanel>

    {#if store.lastResult}
      <ToolPanel
        title="Last result"
        description={store.lastProcessedFileName}
      >
        <dl
          class="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border/60"
        >
          <div class="flex flex-col gap-1 bg-card px-4 py-3">
            <dt class="label-eyebrow text-muted-foreground">
              Total pages
            </dt>
            <dd class="font-mono text-2xl tabular-nums text-foreground">
              {String(store.lastResult.totalPages).padStart(2, "0")}
            </dd>
          </div>
          <div class="flex flex-col gap-1 bg-card px-4 py-3">
            <dt class="label-eyebrow text-muted-foreground">
              Corrected
            </dt>
            <dd class="font-mono text-2xl tabular-nums text-success">
              {String(store.lastResult.correctedPages).padStart(2, "0")}
            </dd>
          </div>
        </dl>

        <ul
          class="mt-4 max-h-56 overflow-y-auto rounded-sm border border-border bg-muted/20 divide-y divide-border"
        >
          {#each store.lastResult.angles as angle, idx}
            <li class="flex items-center justify-between px-4 py-2">
              <span
                class="label-eyebrow text-muted-foreground"
              >
                Page {String(idx + 1).padStart(2, "0")}
              </span>
              <div class="flex items-center gap-2">
                <span
                  class={cn(
                    "font-mono text-sm tabular-nums",
                    store.lastResult.corrected[idx]
                      ? "font-semibold text-success"
                      : "text-muted-foreground"
                  )}
                >
                  {angle > 0 ? "+" : ""}{angle.toFixed(2)}°
                </span>
                {#if store.lastResult.corrected[idx]}
                  <span
                    class="rounded-xs bg-success/15 px-1.5 py-0.5 label-eyebrow text-success"
                  >
                    Fixed
                  </span>
                {:else}
                  <MinusCircle class="size-3 text-muted-foreground" />
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      </ToolPanel>
    {/if}

    <ToolFooter
      hint={store.isProcessing
        ? store.progress.text || "Processing"
        : "Straighten skew"}
    >
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.process()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progress.text || "Processing"}
        {:else}
          <AlignLeft class="size-4" />
          Straighten PDF
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
