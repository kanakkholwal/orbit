<script lang="ts">
  import {
    ChoiceList,
    FileRow,
    OptionGroup,
    ResultCard,
    SegmentedControl,
    ToolBar,
    ToolFooter,
  } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconDownload as Download,
    IconFileText as FileText,
    IconFileUpload as FileUp,
    IconLoader2 as Loader,
    IconPlus as Plus,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { TxtToPdfState } from "./helper.svelte";

  const store = new TxtToPdfState();
  const uid = $props.id();

  let addInput = $state<HTMLInputElement | null>(null);
  let openInput = $state<HTMLInputElement | null>(null);

  const modes = [
    { value: "upload" as const, label: "Text files" },
    { value: "text" as const, label: "Type text" },
  ];

  const fonts = [
    { value: "helv", label: "Helvetica", hint: "Clean and modern" },
    { value: "times", label: "Times", hint: "Classic, good for long reading" },
    { value: "tiro", label: "Tiro", hint: "Serif with wide language coverage" },
    { value: "cour", label: "Courier", hint: "Even spacing, keeps columns lined up" },
  ];

  const pageSizes = ["A4", "Letter", "Legal", "A5", "A3"];

  const lineCount = $derived(store.textContent ? store.textContent.split("\n").length : 0);
  const totalSize = $derived(store.files.reduce((sum, f) => sum + f.originalSize, 0));
  const canConvert = $derived(
    !store.isProcessing && (store.mode === "upload" ? store.files.length > 0 : store.textContent.trim().length > 0)
  );
  const showResult = $derived(
    !!store.result &&
      !store.isProcessing &&
      store.result.mode === store.mode &&
      (store.mode === "upload" || store.result.source === store.textContent)
  );
  const resultFiles = $derived(store.resultFiles);

  function pick(e: Event & { currentTarget: HTMLInputElement }, handler: (files: File[]) => void) {
    const picked = Array.from(e.currentTarget.files ?? []);
    if (picked.length > 0) handler(picked);
    e.currentTarget.value = "";
  }
</script>

<div class="flex flex-col gap-4">
  {#if showResult && store.result}
    <ResultCard title="Your PDF is ready" description={`${store.result.name} is downloaded.`}>
      {#snippet actions()}
        <Button variant="outline" onclick={() => store.downloadResult()}>
          <Download />
          Download again
        </Button>
        <Button variant="ghost" onclick={() => store.reset()}>
          <Refresh />
          Start over
        </Button>
      {/snippet}
      <FileSuggestions files={resultFiles} heading="Continue with" exclude="txt-to-pdf" />
    </ResultCard>
  {/if}

  {#if store.mode === "upload"}
    <ToolBar
      label="Text files"
      count={store.files.length > 0 ? store.files.length : undefined}
      meta={store.files.length > 0 ? formatBytes(totalSize) : undefined}
      onReset={store.files.length > 0 && !store.isProcessing ? () => store.reset() : undefined}
      resetLabel="Clear all"
    >
      {#snippet actions()}
        <SegmentedControl name="{uid}-mode" options={modes} bind:value={store.mode} size="sm" class="w-52" />
        {#if store.files.length > 0}
          <Button variant="outline" size="sm" disabled={store.isProcessing} onclick={() => addInput?.click()}>
            <Plus />
            <span class="hidden sm:inline">Add files</span>
            <span class="sr-only sm:hidden">Add files</span>
          </Button>
        {/if}
      {/snippet}
    </ToolBar>

    {#if store.files.length === 0}
      <UploadArea accept=".txt,text/plain" onFilesSelected={(files) => store.addFiles(files)}>
        {#snippet icon()}
          <FileText class="size-6" stroke={1.75} />
        {/snippet}
        {#snippet title()}
          <h3 class="text-heading-sm font-medium text-foreground">Drop text files to turn into a PDF</h3>
        {/snippet}
        {#snippet description()}
          <p class="max-w-sm text-pretty text-body text-muted-foreground">
            Add one or more .txt files. They are joined in order into a single PDF.
          </p>
        {/snippet}
      </UploadArea>
    {:else}
      <ul class="flex flex-col gap-2">
        {#each store.files as file (file.id)}
          <li>
            <FileRow
              name={file.file.name}
              icon={FileText}
              meta={formatBytes(file.originalSize)}
              onRemove={store.isProcessing ? undefined : () => store.removeFile(file.id)}
            />
          </li>
        {/each}
      </ul>
    {/if}
  {:else}
    <ToolBar
      label="Text"
      meta={`${lineCount.toLocaleString()} ${lineCount === 1 ? "line" : "lines"} · ${store.textContent.length.toLocaleString()} characters`}
      onReset={store.textContent && !store.isProcessing ? () => store.reset() : undefined}
      resetLabel="Clear"
    >
      {#snippet actions()}
        <SegmentedControl name="{uid}-mode" options={modes} bind:value={store.mode} size="sm" class="w-52" />
        <Button variant="outline" size="sm" disabled={store.isProcessing} onclick={() => openInput?.click()}>
          <FileUp />
          <span class="hidden sm:inline">Open a file</span>
          <span class="sr-only sm:hidden">Open a file</span>
        </Button>
      {/snippet}
    </ToolBar>

    <label for="{uid}-text" class="sr-only">Text</label>
    <textarea
      id="{uid}-text"
      bind:value={store.textContent}
      dir={store.textDirection}
      placeholder="Type or paste text here. Right-to-left scripts such as Arabic and Hebrew are detected automatically."
      class="scrollbar-subtle min-h-[max(24rem,calc(100svh-17rem))] w-full resize-y rounded-xl border border-border bg-background p-4 font-mono text-body leading-relaxed text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring"
    ></textarea>
  {/if}

  <input
    bind:this={addInput}
    type="file"
    accept=".txt,text/plain"
    multiple
    class="hidden"
    onchange={(e) => pick(e, (files) => store.addFiles(files))}
  />
  <input
    bind:this={openInput}
    type="file"
    accept=".txt,text/plain"
    multiple
    class="hidden"
    onchange={(e) => pick(e, (files) => store.openInEditor(files))}
  />
</div>

<WorkspaceInspector title="Page and text">
  <div class="flex flex-col gap-6">
    <OptionGroup label="Font">
      <ChoiceList name="{uid}-font" choices={fonts} bind:value={store.settings.fontFamily} />
    </OptionGroup>

    <div class="grid grid-cols-2 gap-3">
      <OptionGroup label="Size">
        <label for="{uid}-size" class="sr-only">Font size in points</label>
        <div class="relative">
          <input
            id="{uid}-size"
            type="number"
            min="6"
            max="72"
            bind:value={store.settings.fontSize}
            class="h-10 w-full rounded-lg border border-border bg-background pl-3 pr-9 text-body tabular-nums text-foreground outline-none transition-colors focus:border-ring"
          />
          <span class="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-caption text-muted-foreground">pt</span>
        </div>
      </OptionGroup>

      <OptionGroup label="Colour">
        <label for="{uid}-color" class="sr-only">Text colour</label>
        <div class="flex h-10 items-center gap-2 rounded-lg border border-border bg-background pl-1 pr-3 transition-colors focus-within:border-ring">
          <input
            id="{uid}-color"
            type="color"
            bind:value={store.settings.textColor}
            class="h-8 w-9 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
          />
          <span class="truncate font-mono text-caption tabular-nums text-muted-foreground">{store.settings.textColor}</span>
        </div>
      </OptionGroup>
    </div>

    <OptionGroup label="Page size" description="Text wraps to fit, with a 2.5 cm margin on every side.">
      <label for="{uid}-page" class="sr-only">Page size</label>
      <select
        id="{uid}-page"
        bind:value={store.settings.pageSize}
        class="h-10 w-full rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors focus:border-ring"
      >
        {#each pageSizes as size (size)}
          <option value={size}>{size}</option>
        {/each}
      </select>
    </OptionGroup>
  </div>
</WorkspaceInspector>

<ToolFooter>
  {#snippet hint()}
    {#if store.isProcessing}
      <span class="flex items-center gap-2 text-foreground">
        <Loader class="size-4 animate-spin text-primary" />
        {store.progress.text || "Creating PDF"}
      </span>
    {:else if store.mode === "upload"}
      <span class="block truncate">
        {store.files.length === 0
          ? "Add text files to continue."
          : `${store.files.length} ${store.files.length === 1 ? "file" : "files"} · ${store.settings.pageSize}`}
      </span>
    {:else}
      <span class="block truncate">
        {store.textContent.trim() ? `${store.settings.pageSize} · ${store.settings.fontSize} pt` : "Type or paste text to continue."}
      </span>
    {/if}
  {/snippet}

  <Button variant="primary" onclick={() => store.process()} disabled={!canConvert}>
    {store.isProcessing ? "Creating PDF…" : "Create PDF"}
  </Button>
</ToolFooter>
