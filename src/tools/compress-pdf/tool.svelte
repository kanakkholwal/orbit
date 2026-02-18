<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Label } from "$components/ui/label";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$components/ui/select";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    FileText,
    Loader2,
    Settings2,
    Trash2,
    Zap,
  } from "@lucide/svelte";
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
  <div
    class="sticky top-0 z-20 border-b border-border bg-accent/50 p-4 rounded-lg"
  >
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-sm font-semibold flex items-center gap-2">
        <FileText size={18} class="text-primary" />
        {store.files.length} File{store.files.length > 1 ? "s" : ""} Selected
      </h2>
      <div class="flex items-center gap-2">
        <Button variant="ghost" onclick={() => store.reset()}>
          <Trash2 size={16} /> Clear All
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-6 space-y-8">
    <div class="grid gap-3">
      {#each store.files as file (file.id)}
        <div
          class="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-xs"
        >
          <div class="min-w-0 flex-1">
            <div class="truncate font-medium">{file.file.name}</div>
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatBytes(file.originalSize)}</span>
              {#if file.status === "done" && file.compressedSize}
                <ArrowRight size={12} />
                <span class="text-green-600 font-bold"
                  >{formatBytes(file.compressedSize)}</span
                >
                <span
                  class="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700"
                >
                  -{Math.round(
                    (1 - file.compressedSize / file.originalSize) * 100,
                  )}%
                </span>
              {/if}
            </div>
          </div>

          {#if file.status === "processing"}
            <Loader2 size={18} class="animate-spin text-primary" />
          {:else if file.status === "done"}
            <CheckCircle2 size={18} class="text-green-500" />
          {:else if file.status === "error"}
            <div class="text-destructive" title={file.error}>
              <AlertTriangle size={18} />
            </div>
          {:else}
            <Button
              variant="destructive_soft"
              size="icon-sm"
              onclick={() => store.removeFile(file.id)}
            >
              <Trash2 size={18} />
            </Button>
          {/if}
        </div>
      {/each}
    </div>

    <div class="max-w-2xl mx-auto space-y-6">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label class="text-sm font-medium" for="settings.algorithm"
            >Algorithm</Label
          >
          <div class="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <Button
              variant={store.settings.algorithm === "condense"
                ? "outline"
                : "ghost"}
              onclick={() => (store.settings.algorithm = "condense")}
            >
              Condense
            </Button>
            <Button
              variant={store.settings.algorithm === "photon"
                ? "outline"
                : "ghost"}
              onclick={() => (store.settings.algorithm = "photon")}
            >
              Photon
            </Button>
          </div>
          <p class="text-xs text-muted-foreground">
            {store.settings.algorithm === "condense"
              ? "Best for most PDFs. Removes hidden data and optimizes assets."
              : "Converts pages to images. Best for scanned docs or strict flattening."}
          </p>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium" for="settings.level"
            >Compression Level</Label
          >
          <Select type="single" bind:value={store.settings.level}>
            <SelectTrigger class="w-45 h-10" id="settings.level">
              {store.settings.level}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light (High Quality)</SelectItem>
              <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
              <SelectItem value="extreme">Extreme (Low Quality)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <button
          onclick={() => (showAdvanced = !showAdvanced)}
          class="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Settings2 size={16} />
          {showAdvanced ? "Hide" : "Show"} Advanced Settings
        </button>

        {#if showAdvanced}
          <div
            transition:slide
            class="mt-4 grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <label class="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                bind:checked={store.settings.convertToGrayscale}
                class="rounded border-primary text-primary focus:ring-primary"
              />
              Convert to Grayscale
            </label>
            <label class="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                bind:checked={store.settings.removeMetadata}
                class="rounded border-primary text-primary focus:ring-primary"
              />
              Remove Metadata
            </label>
            <label class="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                bind:checked={store.settings.subsetFonts}
                class="rounded border-primary text-primary focus:ring-primary"
              />
              Subset Fonts
            </label>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="border-t border-border p-4 text-center">
    <Button
      size="lg"
      variant="dark"
      class="px-8 h-11 min-w-50"
      onclick={() => store.process()}
      disabled={store.isProcessing}
    >
      {#if store.isProcessing}
        <Loader2 class="animate-spin" /> {store.progress.text}
      {:else}
        Compress Files <Zap size={18} class="fill-current" />
      {/if}
    </Button>
  </div>
{/if}
