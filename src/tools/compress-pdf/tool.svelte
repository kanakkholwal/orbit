<script lang="ts">
  import { Button } from "$components/ui/button";
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

<div class="h-full w-full">
  {#if store.files.length === 0}
    <UploadArea
      accept=".pdf"
      onFilesSelected={(files) => store.addFiles(files)}
    />
  {:else}
    <div class="flex flex-col h-full">
      <div
        class="sticky top-0 z-20 border-b border-border bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/60"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h2 class="text-sm font-semibold flex items-center gap-2">
            <FileText size={18} class="text-primary" />
            {store.files.length} File{store.files.length > 1 ? "s" : ""} Selected
          </h2>
          <div class="flex items-center gap-2">
            <button
              class="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              onclick={() => store.reset()}
            >
              <Trash2 size={16} /> Clear All
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto bg-muted/10 p-6 space-y-8">
        <div class="grid gap-3">
          {#each store.files as file (file.id)}
            <div
              class="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm"
            >
              <div class="min-w-0 flex-1">
                <div class="truncate font-medium">{file.file.name}</div>
                <div
                  class="flex items-center gap-2 text-xs text-muted-foreground"
                >
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
                <button
                  onclick={() => store.removeFile(file.id)}
                  class="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              {/if}
            </div>
          {/each}
        </div>

        <div class="max-w-2xl mx-auto space-y-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm font-medium" for="settings.algorithm"
                >Algorithm</label
              >
              <div class="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
                <button
                  class="rounded-md px-3 py-1.5 text-sm font-medium transition-all {store
                    .settings.algorithm === 'condense'
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'}"
                  onclick={() => (store.settings.algorithm = "condense")}
                >
                  Condense
                </button>
                <button
                  class="rounded-md px-3 py-1.5 text-sm font-medium transition-all {store
                    .settings.algorithm === 'photon'
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'}"
                  onclick={() => (store.settings.algorithm = "photon")}
                >
                  Photon
                </button>
              </div>
              <p class="text-xs text-muted-foreground">
                {store.settings.algorithm === "condense"
                  ? "Best for most PDFs. Removes hidden data and optimizes assets."
                  : "Converts pages to images. Best for scanned docs or strict flattening."}
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium" for="settings.level"
                >Compression Level</label
              >
              <select
                id="settings.level"
                bind:value={store.settings.level}
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="light">Light (High Quality)</option>
                <option value="balanced">Balanced (Recommended)</option>
                <option value="aggressive">Aggressive</option>
                <option value="extreme">Extreme (Low Quality)</option>
              </select>
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

      <div class="border-t border-border bg-background p-4 text-center">
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
    </div>
  {/if}
</div>
