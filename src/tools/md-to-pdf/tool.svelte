<script lang="ts">
  import { ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { IconArrowRight as ArrowRight, IconFileUpload as FileUp, IconLoader2 as LoaderCircle, IconSparkles as Sparkles } from "@tabler/icons-svelte";
  import { MdToPdfState } from "./helper.svelte";

  const store = new MdToPdfState();

  let fileInput: HTMLInputElement;

  function onPick(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) store.loadFile(file);
    target.value = "";
  }
</script>

<div class="flex flex-col gap-6">
  <ToolBar label="Markdown → PDF" count={store.charCount} onReset={() => store.reset()}>
    {#snippet actions()}
      <input
        bind:this={fileInput}
        type="file"
        accept=".md,.markdown,.txt,text/markdown,text/plain"
        class="hidden"
        onchange={onPick}
      />
      <Button
        variant="outline"
        size="sm"
        class="rounded-md"
        onclick={() => fileInput.click()}
      >
        <FileUp class="size-3.5" />
        <span class="hidden sm:inline">Load .md</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="rounded-md"
        onclick={() => store.loadSample()}
      >
        <Sparkles class="size-3.5" />
        <span class="hidden sm:inline">Sample</span>
      </Button>
    {/snippet}
  </ToolBar>

  <div class="flex flex-col gap-2">
    <label
      for="md-input"
      class="label-eyebrow text-muted-foreground"
    >
      Markdown
    </label>
    <textarea
      id="md-input"
      bind:value={store.markdown}
      spellcheck="false"
      placeholder="# Start typing Markdown…&#10;&#10;Paste or load a .md file, then convert to a clean PDF — entirely on your device."
      class="min-h-105 w-full resize-y rounded-lg border border-border bg-card p-4 font-mono text-[13px] leading-relaxed text-foreground shadow-xs outline-none placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/30"
    ></textarea>
  </div>

  <ToolFooter
    hint={store.isProcessing
      ? store.progressLabel
      : store.isEmpty
        ? "Paste or load Markdown to begin"
        : `${store.charCount.toLocaleString()} characters · output: ${store.fileName}.pdf`}
  >
    <Button
      size="lg"
      class="rounded-md bg-primary px-6 text-primary-foreground hover:bg-primary-active"
      onclick={() => store.convert()}
      disabled={store.isProcessing || store.isEmpty}
    >
      {#if store.isProcessing}
        <LoaderCircle class="size-4 animate-spin" />
        {store.progressLabel}
      {:else}
        Convert to PDF
        <ArrowRight class="size-4" />
      {/if}
    </Button>
  </ToolFooter>
</div>
