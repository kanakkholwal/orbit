<script lang="ts">
  import {
    FileRow,
    StatusPill,
    ToolBar,
    ToolFooter,
    ToolPanel,
  } from "$components/tool";
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
    IconArrowRight as ArrowRight,
    IconLoader2 as LoaderCircle,
    IconSettings2 as Settings2,
    IconBolt as Zap,
  } from "@tabler/icons-svelte";
  import { slide } from "svelte/transition";
  import { CompressState } from "./helper.svelte";

  const store = new CompressState();
  let showAdvanced = $state(false);
</script>

{#if store.files.length === 0}
  <UploadArea
    accept=".pdf"
    onFilesSelected={(files) => store.addFiles(files)}
  />
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar
      label="Selected"
      count={store.files.length}
      onReset={() => store.reset()}
      resetLabel="Clear all"
    />

    <ToolPanel title="Files" counter={store.files.length}>
      <ul class="flex flex-col gap-2">
        {#each store.files as file (file.id)}
          <li>
            <FileRow
              name={file.file.name}
              onRemove={file.status === "pending"
                ? () => store.removeFile(file.id)
                : undefined}
            >
              <span class="font-mono tabular-nums">
                {formatBytes(file.originalSize)}
              </span>
              {#if file.status === "done" && file.compressedSize}
                <ArrowRight class="size-3 text-muted-foreground/60" />
                <span class="font-mono tabular-nums text-success">
                  {formatBytes(file.compressedSize)}
                </span>
                <span
                  class="rounded-xs bg-success/10 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-success"
                >
                  -{Math.round(
                    (1 - file.compressedSize / file.originalSize) * 100
                  )}%
                </span>
              {/if}

              {#snippet trailing()}
                {#if file.status === "processing"}
                  <StatusPill status="processing" label="Compressing" />
                {:else if file.status === "done"}
                  <StatusPill status="done" />
                {:else if file.status === "error"}
                  <StatusPill status="error" label={file.error || "Error"} />
                {/if}
              {/snippet}
            </FileRow>
          </li>
        {/each}
      </ul>
    </ToolPanel>

    <ToolPanel title="Settings">
      <div class="grid gap-5 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <Label
            class="label-eyebrow text-muted-foreground"
            for="settings.algorithm">Algorithm</Label
          >
          <div class="grid grid-cols-2 gap-1 rounded-sm bg-muted/40 p-1">
            {#each [
              { id: "condense", label: "Condense" },
              { id: "photon", label: "Photon" },
            ] as opt}
              <button
                type="button"
                onclick={() => (store.settings.algorithm = opt.id as any)}
                class={cn(
                  "rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
                  store.settings.algorithm === opt.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            {/each}
          </div>
          <p class="text-xs leading-relaxed text-muted-foreground">
            {store.settings.algorithm === "condense"
              ? "Best for most PDFs. Removes hidden data and optimizes assets."
              : "Converts pages to images. Best for scanned docs or strict flattening."}
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <Label
            class="label-eyebrow text-muted-foreground"
            for="settings.level">Compression level</Label
          >
          <Select type="single" bind:value={store.settings.level}>
            <SelectTrigger class="h-9 w-full rounded-sm" id="settings.level">
              {store.settings.level}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light · highest quality</SelectItem>
              <SelectItem value="balanced">Balanced · recommended</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
              <SelectItem value="extreme">Extreme · lowest quality</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="mt-6">
        <button
          type="button"
          onclick={() => (showAdvanced = !showAdvanced)}
          class="inline-flex items-center gap-1.5 label-eyebrow text-primary transition-colors hover:text-primary/80"
          aria-expanded={showAdvanced}
        >
          <Settings2 class="size-3" />
          {showAdvanced ? "Hide" : "Show"} advanced
        </button>

        {#if showAdvanced}
          <ul
            transition:slide={{ duration: 220 }}
            class="mt-4 flex flex-col divide-y divide-border/60 overflow-hidden rounded-sm border border-border/60 bg-muted/20"
          >
            {#each [
              { key: "convertToGrayscale" as const, label: "Convert to grayscale", body: "Drops color channels for smaller output." },
              { key: "removeMetadata" as const, label: "Remove metadata", body: "Strips author, title, and editing history." },
              { key: "subsetFonts" as const, label: "Subset fonts", body: "Embed only the glyphs the document uses." },
            ] as opt}
              <li>
                <label
                  class="flex cursor-pointer items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/30"
                >
                  <input
                    type="checkbox"
                    bind:checked={store.settings[opt.key]}
                    class="mt-1 size-3.5 rounded-xs border-border accent-primary"
                  />
                  <span class="flex flex-col gap-0.5">
                    <span class="font-medium text-foreground">{opt.label}</span>
                    <span class="text-xs text-muted-foreground">{opt.body}</span>
                  </span>
                </label>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </ToolPanel>

    <ToolFooter
      hint={store.isProcessing
        ? store.progress.text
        : `Compress ${store.files.length} file${store.files.length === 1 ? "" : "s"}`}
    >
      <Button
        size="lg"
        class="rounded-sm px-6"
        onclick={() => store.process()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progress.text}
        {:else}
          <Zap class="size-4" />
          Compress
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
