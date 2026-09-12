<script lang="ts">
  import {
    ChoiceList,
    FileRow,
    OptionGroup,
    OptionToggle,
    ProgressLine,
    ResultCard,
    StatusPill,
    ToolBar,
    ToolFooter,
  } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { tesseractLanguages } from "$constants/tesseract-languages";
  import { formatBytes } from "$utils/helper";
  import {
    IconCheck as Check,
    IconCopy as Copy,
    IconDownload as Download,
    IconRefresh as Refresh,
    IconX as X,
  } from "@tabler/icons-svelte";
  import { OcrPdfState } from "./helper.svelte";

  const store = new OcrPdfState();
  const uid = $props.id();

  let langSearch = $state("");
  let copied = $state(false);
  let logEl = $state<HTMLElement | null>(null);

  const resolutions = [
    { value: "2.0", label: "Standard", hint: "Faster, fine for clear printed pages" },
    { value: "3.0", label: "High", hint: "Recommended for most scans" },
    { value: "4.0", label: "Very high", hint: "Slower, helps with small or faint text" },
  ];

  const presets = [
    { value: "none", label: "Any character" },
    { value: "alphanumeric", label: "Letters, numbers and punctuation" },
    { value: "numbers-currency", label: "Numbers and currency" },
    { value: "letters-only", label: "Letters only" },
    { value: "numbers-only", label: "Numbers only" },
    { value: "invoice", label: "Invoices and receipts" },
    { value: "custom", label: "Custom" },
  ];

  const filteredLangs = $derived.by(() => {
    const q = langSearch.trim().toLowerCase();
    return Object.entries(tesseractLanguages).filter(
      ([code, name]) => !q || name.toLowerCase().includes(q) || code.toLowerCase().includes(q)
    );
  });

  const done = $derived(!!store.searchablePdfBytes && !store.isProcessing);
  const langCount = $derived(store.selectedLangs.length);
  const resultFiles = $derived(store.resultFiles);
  const wordCount = $derived(store.extractedText ? store.extractedText.split(/\s+/).filter(Boolean).length : 0);

  $effect(() => {
    void store.progressLog.length;
    if (logEl) logEl.scrollTop = logEl.scrollHeight;
  });

  function handleCopy() {
    store.copyText();
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a scanned PDF</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Turn scanned pages into text you can search, select and copy. Everything runs on this device.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if done}
      <ResultCard
        title="Your PDF is now searchable"
        description={wordCount > 0
          ? `Found about ${wordCount.toLocaleString()} words. Download the PDF, the plain text, or both.`
          : "No text was recognised. Try another language or a higher detail level."}
      >
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadPdf()}>
            <Download />
            Download PDF
          </Button>
          <Button variant="outline" onclick={() => store.downloadTxt()} disabled={!store.extractedText}>
            <Download />
            Download text
          </Button>
          <Button variant="ghost" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <FileSuggestions files={resultFiles} heading="Continue with" exclude="ocr-pdf" />
      </ResultCard>
    {/if}

    <ToolBar label="File" onReset={store.isProcessing ? undefined : () => store.reset()} resetLabel="Clear" />

    <FileRow
      name={store.file.file.name}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    >
      <span>{formatBytes(store.file.originalSize)}</span>
      {#snippet trailing()}
        {#if store.isProcessing}
          <StatusPill status="processing" label="Reading text" />
        {:else if done}
          <StatusPill status="done" />
        {/if}
      {/snippet}
    </FileRow>

    {#if store.progressLog.length > 0 && (store.isProcessing || !done)}
      <section class="flex flex-col gap-2" aria-labelledby="{uid}-log">
        <h2 id="{uid}-log" class="text-body font-medium text-foreground">Progress</h2>
        <div
          bind:this={logEl}
          class="scrollbar-subtle max-h-64 overflow-y-auto rounded-xl border border-border bg-muted p-3 font-mono text-caption text-muted-foreground"
          role="log"
          aria-live="polite"
        >
          {#each store.progressLog as line, i (i)}
            <p>{line.replace(/^Status: /, "")}</p>
          {/each}
        </div>
      </section>
    {/if}

    {#if done && store.extractedText}
      <ToolBar label="Recognised text" meta={`${wordCount.toLocaleString()} words`}>
        {#snippet actions()}
          <Button variant="outline" size="sm" onclick={handleCopy}>
            {#if copied}
              <Check />
              Copied
            {:else}
              <Copy />
              Copy
            {/if}
          </Button>
        {/snippet}
      </ToolBar>
      <label for="{uid}-text" class="sr-only">Recognised text</label>
      <textarea
        id="{uid}-text"
        readonly
        value={store.extractedText}
        class="scrollbar-subtle min-h-96 w-full resize-y rounded-xl border border-border bg-background p-4 text-body leading-relaxed text-foreground outline-none transition-colors focus:border-ring"
      ></textarea>
    {/if}
  </div>

  <WorkspaceInspector title="Text recognition">
    <div class="flex flex-col gap-6">
      <OptionGroup
        label="Languages"
        description="Pick every language that appears in the document."
      >
        {#if langCount > 0}
          <ul class="flex flex-wrap gap-1.5">
            {#each store.selectedLangs as code (code)}
              <li>
                <button
                  type="button"
                  onclick={() => store.toggleLanguage(code)}
                  aria-label={`Remove ${tesseractLanguages[code]}`}
                  class="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary/10 pl-3 pr-2 text-body text-primary outline-none transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {tesseractLanguages[code]}
                  <X class="size-4" />
                </button>
              </li>
            {/each}
          </ul>
        {/if}
        <label for="{uid}-lang-search" class="sr-only">Search languages</label>
        <input
          id="{uid}-lang-search"
          type="search"
          bind:value={langSearch}
          placeholder="Search languages"
          class="h-10 w-full rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring"
        />
        <div class="scrollbar-subtle flex max-h-60 flex-col overflow-y-auto rounded-xl border border-border p-1">
          {#each filteredLangs as [code, name] (code)}
            <label
              class="flex min-h-9 cursor-pointer items-center gap-3 rounded-lg px-2.5 text-body text-foreground transition-colors hover:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-inset has-focus-visible:ring-ring"
            >
              <input
                type="checkbox"
                checked={store.selectedLangs.includes(code)}
                onchange={() => store.toggleLanguage(code)}
                class="size-4 shrink-0 accent-primary"
              />
              <span class="truncate">{name}</span>
            </label>
          {:else}
            <p class="px-2.5 py-2 text-body text-muted-foreground">No language matches "{langSearch}".</p>
          {/each}
        </div>
      </OptionGroup>

      <OptionGroup label="Detail" description="Higher detail reads small text better but takes longer.">
        <ChoiceList name="{uid}-resolution" choices={resolutions} bind:value={store.resolution} />
      </OptionGroup>

      <OptionGroup label="Clean-up">
        <div class="-my-2.5">
          <OptionToggle
            label="Boost contrast"
            description="Turns pages black and white first. Helps with grey or uneven scans."
            bind:checked={store.binarize}
          />
        </div>
      </OptionGroup>

      <OptionGroup
        label="Characters to look for"
        description="Limiting characters can improve accuracy on forms and receipts."
      >
        <label for="{uid}-preset" class="sr-only">Characters to look for</label>
        <select
          id="{uid}-preset"
          value={store.whitelistPreset}
          onchange={(e) => store.handlePresetChange(e.currentTarget.value)}
          class="h-10 w-full rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors focus:border-ring"
        >
          {#each presets as preset (preset.value)}
            <option value={preset.value}>{preset.label}</option>
          {/each}
        </select>
        <label for="{uid}-whitelist" class="text-caption text-muted-foreground">Only these characters</label>
        <input
          id="{uid}-whitelist"
          type="text"
          bind:value={store.customWhitelist}
          disabled={store.whitelistPreset !== "custom" && store.whitelistPreset !== "none"}
          placeholder="For example abc123$.,-"
          class="h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring disabled:opacity-50"
        />
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine
          label={store.progressStatus || "Starting"}
          current={Math.round(store.progressPercent)}
          total={100}
          class="max-w-md"
        />
      {:else if langCount === 0}
        <span class="block truncate text-destructive">Choose a language to continue.</span>
      {:else if done}
        <span class="block truncate">Change the settings to scan again.</span>
      {:else}
        <span class="block truncate">
          Reading in {langCount === 1 ? tesseractLanguages[store.selectedLangs[0]] : `${langCount} languages`}
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || langCount === 0}>
      {store.isProcessing ? "Reading text…" : done ? "Scan again" : "Make text searchable"}
    </Button>
  </ToolFooter>
{/if}
