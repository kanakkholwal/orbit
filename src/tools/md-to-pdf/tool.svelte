<script lang="ts">
  import { ResultCard, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import {
    IconDownload as Download,
    IconFileUpload as FileUp,
    IconLoader2 as Loader,
    IconRefresh as Refresh,
    IconSparkles as Sparkles,
  } from "@tabler/icons-svelte";
  import { MdToPdfState } from "./helper.svelte";

  const store = new MdToPdfState();
  const uid = $props.id();

  let fileInput = $state<HTMLInputElement | null>(null);

  const lineCount = $derived(store.isEmpty ? 0 : store.markdown.split("\n").length);
  const resultFiles = $derived(store.resultFiles);
  const showResult = $derived(!!store.result && !store.isProcessing && store.result.source === store.markdown);
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
      <FileSuggestions files={resultFiles} heading="Continue with" exclude="md-to-pdf" />
    </ResultCard>
  {/if}

  <ToolBar
    label="Markdown"
    meta={`${lineCount.toLocaleString()} ${lineCount === 1 ? "line" : "lines"} · ${store.charCount.toLocaleString()} characters`}
    onReset={store.isEmpty || store.isProcessing ? undefined : () => store.reset()}
    resetLabel="Clear"
  >
    {#snippet actions()}
      <Button variant="ghost" size="sm" onclick={() => store.loadSample()} disabled={store.isProcessing}>
        <Sparkles />
        Try a sample
      </Button>
      <Button variant="outline" size="sm" onclick={() => fileInput?.click()} disabled={store.isProcessing}>
        <FileUp />
        Open a file
      </Button>
    {/snippet}
  </ToolBar>

  <label for="{uid}-md" class="sr-only">Markdown</label>
  <textarea
    id="{uid}-md"
    bind:value={store.markdown}
    spellcheck="false"
    placeholder={"# Start writing\n\nType or paste Markdown here, or open a .md file."}
    class="scrollbar-subtle min-h-[max(24rem,calc(100svh-17rem))] w-full resize-y rounded-xl border border-border bg-background p-4 font-mono text-body leading-relaxed text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring"
  ></textarea>

  <input
    bind:this={fileInput}
    type="file"
    accept=".md,.markdown,.txt,text/markdown,text/plain"
    class="hidden"
    onchange={(e) => {
      const file = e.currentTarget.files?.[0];
      if (file) store.loadFile(file);
      e.currentTarget.value = "";
    }}
  />
</div>

<ToolFooter>
  {#snippet hint()}
    {#if store.isProcessing}
      <span class="flex items-center gap-2 text-foreground">
        <Loader class="size-4 animate-spin text-primary" />
        Creating {store.fileName}.pdf…
      </span>
    {:else if store.isEmpty}
      <span class="block truncate">Write or paste Markdown, or open a file.</span>
    {:else}
      <span class="block truncate">Saves as {store.fileName}.pdf</span>
    {/if}
  {/snippet}

  <Button variant="primary" onclick={() => store.convert()} disabled={store.isProcessing || store.isEmpty}>
    {store.isProcessing ? "Creating PDF…" : "Create PDF"}
  </Button>
</ToolFooter>
