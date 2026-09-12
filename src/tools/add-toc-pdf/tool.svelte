<script lang="ts">
  import { FileRow, OptionGroup, OptionToggle, ResultCard, SegmentedControl, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { TableOfContentsState } from "./helper.svelte";

  const store = new TableOfContentsState();
  const uid = $props.id();

  const sizes: { value: string; label: string }[] = [
    { value: "10", label: "Small" },
    { value: "12", label: "Medium" },
    { value: "16", label: "Large" },
  ];

  const showResult = $derived(!store.isProcessing && store.result !== null);
  const titleMissing = $derived(store.state.title.trim() === "");
</script>

{#if !store.state.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files[0])}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to add a contents page</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Turn the bookmarks in your PDF into a clickable contents page at the start.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult && store.result}
      <ResultCard title="Contents page added" description={`${store.result.name} is downloaded with a new first page.`}>
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="add-toc-pdf" />
      </ResultCard>
    {/if}

    <FileRow
      name={store.state.file.name}
      meta={formatBytes(store.state.file.size)}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    <section class="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h2 class="text-body-lg font-medium text-foreground">How the contents page is made</h2>
      <ol class="flex list-decimal flex-col gap-1.5 pl-5 text-body text-muted-foreground marker:text-muted-foreground">
        <li>Orbit reads the bookmarks already saved in your PDF.</li>
        <li>It lists them on a new page at the very start, each one linking to its page.</li>
        <li>Everything else in the file stays the same.</li>
      </ol>
      <p class="border-t border-border pt-3 text-caption text-muted-foreground">
        No bookmarks yet? Add them first with
        <a href="/tools/bookmark-pdf" class="text-primary underline-offset-2 hover:underline">Bookmarks</a>,
        or the contents page will be empty.
      </p>
    </section>
  </div>

  <WorkspaceInspector title="Contents page">
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-2.5">
        <div class="flex flex-col gap-0.5">
          <label for="{uid}-title" class="text-body font-medium text-foreground">Heading</label>
          <p id="{uid}-title-hint" class="text-caption text-muted-foreground">Shown at the top of the new page</p>
        </div>
        <input
          id="{uid}-title"
          type="text"
          bind:value={store.state.title}
          oninput={() => (store.result = null)}
          aria-describedby="{uid}-title-hint"
          aria-invalid={titleMissing}
          class="h-10 w-full rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring aria-invalid:border-destructive"
        />
      </div>

      <OptionGroup label="Text size">
        <SegmentedControl name="{uid}-size" options={sizes} bind:value={store.state.fontSize} />
      </OptionGroup>

      <OptionGroup label="Extras">
        <div class="-my-2.5 flex flex-col">
          <OptionToggle
            label="Bookmark the contents page"
            description="Adds it to the bookmark list so readers can jump back"
            bind:checked={store.state.addBookmark}
          />
        </div>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <span class="block truncate">{store.progress.text || "Working…"}</span>
      {:else if showResult}
        <span class="block truncate">Contents page added and downloaded</span>
      {:else if titleMissing}
        <span class="block truncate">Give the contents page a heading to continue</span>
      {:else}
        <span class="block truncate">
          Adds one page at the start · {sizes.find((s) => s.value === store.state.fontSize)?.label ?? "Custom"} text
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.generateTOC()} disabled={store.isProcessing || titleMissing}>
      {store.isProcessing ? "Adding…" : "Add contents page"}
    </Button>
  </ToolFooter>
{/if}
