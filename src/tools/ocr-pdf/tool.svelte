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
  import { tesseractLanguages } from "$constants/tesseract-languages";
  import { formatBytes } from "$utils/helper";
  import {
    IconCheck as Check,
    IconChevronDown as ChevronDown,
    IconChevronUp as ChevronUp,
    IconClipboardCopy as ClipboardCopy,
    IconDownload as Download,
    IconLoader2 as LoaderCircle,
    IconScan as ScanText,
    IconSettings2 as Settings2,
  } from "@tabler/icons-svelte";
  import { slide } from "svelte/transition";
  import { OcrPdfState } from "./helper.svelte";

  const store = new OcrPdfState();

  let showAdvanced = $state(false);
  let langSearch = $state("");
  let copied = $state(false);

  const filteredLangs = $derived(
    Object.entries(tesseractLanguages).filter(
      ([code, name]) =>
        name.toLowerCase().includes(langSearch.toLowerCase()) ||
        code.toLowerCase().includes(langSearch.toLowerCase())
    )
  );

  function handleCopy() {
    store.copyText();
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
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

    {#if !store.isProcessing && !store.searchablePdfBytes}
      <ToolPanel
        title="Languages"
        counter={store.selectedLangs.length}
      >
        <div class="flex flex-col gap-3">
          <Input
            type="text"
            placeholder="Search languages…"
            bind:value={langSearch}
            class="h-10 rounded-sm font-mono text-sm"
          />
          <div
            class="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto rounded-sm border border-border bg-muted/20 p-2 sm:grid-cols-2 md:grid-cols-3"
          >
            {#each filteredLangs as [code, name]}
              <label
                class="flex cursor-pointer items-center gap-2 rounded-xs px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  value={code}
                  checked={store.selectedLangs.includes(code)}
                  onchange={() => store.toggleLanguage(code)}
                  class="size-3.5 rounded-xs border-border accent-primary"
                />
                <span class="truncate">{name}</span>
              </label>
            {/each}
          </div>
          <p
            class="label-eyebrow text-muted-foreground"
          >
            Selected ·
            <span class="text-foreground">
              {store.selectedLangs
                .map((code) => tesseractLanguages[code])
                .join(", ") || "None"}
            </span>
          </p>
        </div>
      </ToolPanel>

      <ToolPanel title="Advanced">
        <button
          type="button"
          onclick={() => (showAdvanced = !showAdvanced)}
          aria-expanded={showAdvanced}
          class="flex w-full items-center justify-between gap-2"
        >
          <span class="inline-flex items-center gap-2">
            <Settings2 class="size-3.5 text-primary" />
            <span
              class="label-eyebrow text-foreground"
            >
              Tuning options
            </span>
            <span class="label-eyebrow hidden text-muted-foreground sm:inline">
              · Recommended
            </span>
          </span>
          {#if showAdvanced}
            <ChevronUp class="size-3.5 text-muted-foreground" />
          {:else}
            <ChevronDown class="size-3.5 text-muted-foreground" />
          {/if}
        </button>

        {#if showAdvanced}
          <div
            transition:slide={{ duration: 220 }}
            class="mt-5 flex flex-col gap-5 border-t border-border pt-5"
          >
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <Label
                  for="ocr-resolution"
                  class="label-eyebrow text-muted-foreground"
                >
                  Resolution
                </Label>
                <Select type="single" bind:value={store.resolution}>
                  <SelectTrigger
                    id="ocr-resolution"
                    class="h-10 rounded-sm"
                  >
                    {#if store.resolution === "2.0"}
                      Standard · 192 DPI
                    {:else if store.resolution === "3.0"}
                      High · 288 DPI
                    {:else}
                      Ultra · 384 DPI
                    {/if}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2.0">Standard · 192 DPI</SelectItem>
                    <SelectItem value="3.0">High · 288 DPI</SelectItem>
                    <SelectItem value="4.0">Ultra · 384 DPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <label
                class="mt-auto flex cursor-pointer items-start gap-3 rounded-sm border border-border bg-muted/20 px-4 py-3 text-sm transition-colors hover:bg-muted/30"
              >
                <input
                  type="checkbox"
                  bind:checked={store.binarize}
                  class="mt-0.5 size-3.5 rounded-xs border-border accent-primary"
                />
                <span class="flex flex-col gap-0.5">
                  <span class="font-medium text-foreground">Binarize image</span>
                  <span class="text-xs text-muted-foreground">
                    Enhances contrast for clean scans.
                  </span>
                </span>
              </label>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <Label
                  for="whitelist-preset"
                  class="label-eyebrow text-muted-foreground"
                >
                  Character preset
                </Label>
                <Select
                  type="single"
                  value={store.whitelistPreset}
                  onValueChange={(v) => store.handlePresetChange(v as string)}
                >
                  <SelectTrigger
                    id="whitelist-preset"
                    class="h-10 rounded-sm"
                  >
                    {store.whitelistPreset === "none"
                      ? "None · all characters"
                      : store.whitelistPreset === "custom"
                        ? "Custom"
                        : store.whitelistPreset}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None · all characters</SelectItem>
                    <SelectItem value="alphanumeric">
                      Alphanumeric + basic
                    </SelectItem>
                    <SelectItem value="numbers-currency">
                      Numbers + currency
                    </SelectItem>
                    <SelectItem value="letters-only">Letters only</SelectItem>
                    <SelectItem value="numbers-only">Numbers only</SelectItem>
                    <SelectItem value="invoice">Invoice / receipt</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="flex flex-col gap-2">
                <Label
                  for="ocr-whitelist"
                  class="label-eyebrow text-muted-foreground"
                >
                  Custom whitelist
                </Label>
                <Input
                  id="ocr-whitelist"
                  type="text"
                  bind:value={store.customWhitelist}
                  disabled={store.whitelistPreset !== "custom" &&
                    store.whitelistPreset !== "none"}
                  placeholder="e.g. abc123$.,-"
                  class="h-10 rounded-sm font-mono text-sm"
                />
                <p
                  class="label-eyebrow text-muted-foreground"
                >
                  Only listed characters will be recognized.
                </p>
              </div>
            </div>
          </div>
        {/if}
      </ToolPanel>
    {/if}

    {#if store.isProcessing}
      <ToolPanel title="Processing">
        <div class="flex flex-col items-center gap-5">
          <span
            class="inline-flex size-10 items-center justify-center rounded-sm bg-primary/10 text-primary"
          >
            <LoaderCircle class="size-4 animate-spin" />
          </span>
          <div class="flex w-full max-w-md flex-col gap-2">
            <div class="flex items-center justify-between label-eyebrow text-muted-foreground">
              <span class="text-muted-foreground">{store.progressStatus}</span>
              <span class="tabular-nums text-primary">
                {store.progressPercent.toFixed(0)}%
              </span>
            </div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                class="h-full bg-primary transition-all duration-300"
                style="width: {store.progressPercent}%"
              ></div>
            </div>
          </div>

          <div
            class="h-32 w-full max-w-md overflow-y-auto rounded-sm border border-border bg-foreground/95 p-3 text-left font-mono text-caption text-success"
          >
            {#each store.progressLog as log}
              <div>{log}</div>
            {/each}
          </div>
        </div>
      </ToolPanel>
    {/if}

    {#if store.searchablePdfBytes && !store.isProcessing}
      <ToolPanel title="Result">
        <div
          class="flex items-center gap-3 rounded-sm border border-success/30 bg-success/5 px-4 py-3"
        >
          <span
            class="inline-flex size-8 shrink-0 items-center justify-center rounded-sm bg-success/15 text-success"
          >
            <Check class="size-4" />
          </span>
          <div class="flex flex-col gap-0.5">
            <h3
              class="label-eyebrow text-success"
            >
              OCR complete
            </h3>
            <p class="text-xs text-muted-foreground">
              Searchable PDF and extracted text are ready.
            </p>
          </div>
        </div>

        <div class="mt-5 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <Label
              class="label-eyebrow text-muted-foreground"
            >
              Extracted text
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onclick={handleCopy}
              class="rounded-sm text-muted-foreground hover:text-foreground"
            >
              {#if copied}
                <Check class="size-3.5 text-success" />
                Copied
              {:else}
                <ClipboardCopy class="size-3.5" />
                Copy
              {/if}
            </Button>
          </div>
          <textarea
            readonly
            class="h-48 w-full resize-y rounded-sm border border-border bg-muted/20 p-3 font-mono text-xs focus:outline-none"
            value={store.extractedText}
          ></textarea>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            onclick={() => store.downloadTxt()}
            class="rounded-sm"
          >
            <Download class="size-3.5" />
            Download .txt
          </Button>
          <Button
            onclick={() => store.downloadPdf()}
            class="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download class="size-3.5" />
            Download searchable PDF
          </Button>
        </div>
      </ToolPanel>
    {/if}

    {#if !store.isProcessing && !store.searchablePdfBytes}
      <ToolFooter
        hint={store.selectedLangs.length === 0
          ? "Select at least one language"
          : `Run OCR · ${store.selectedLangs.length} language${store.selectedLangs.length === 1 ? "" : "s"}`}
      >
        <Button
          size="lg"
          class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
          onclick={() => store.process()}
          disabled={store.selectedLangs.length === 0}
        >
          <ScanText class="size-4" />
          Start OCR
        </Button>
      </ToolFooter>
    {/if}
  </div>
{/if}
