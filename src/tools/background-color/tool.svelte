<script lang="ts">
  import { FileRow, OptionGroup, ResultCard, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconLoader2 as Loader, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { BackgroundColorState } from "./helper.svelte";

  const store = new BackgroundColorState();
  const uid = $props.id();

  const field =
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring";

  const swatches = [
    { value: "#ffffcc", label: "Cream" },
    { value: "#e6f4ea", label: "Mint" },
    { value: "#e3f0ff", label: "Sky" },
    { value: "#fde8ec", label: "Rose" },
    { value: "#eeeeee", label: "Light grey" },
  ];
  const lines = [60, 0, 100, 92, 96, 70, 0, 100, 88, 94, 60, 0, 100, 90, 82, 76];

  const s = $derived(store.state);
  const targets = $derived(store.targetPages(s.pageRange));
  const blocker = $derived(
    targets.length === 0 ? `Those pages are not in this file. It has ${s.pageCount} pages.` : null
  );
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
</script>

{#if !s.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to change its page colour</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Give white pages a soft tint that is easier on the eyes or matches your brand.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard title="Page colour changed" description={`${store.result.name} is downloaded.`}>
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="background-color" />
      </ResultCard>
    {/if}

    <FileRow
      name={s.file.name}
      meta={`${formatBytes(s.originalSize)} · ${pageLabel(s.pageCount)}`}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    <section aria-label="Preview" class="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-6 sm:py-10">
      <div
        class="@container relative aspect-[1/1.414] w-full max-w-sm overflow-hidden rounded-sm shadow-sm transition-colors duration-200"
        style:background-color={s.colorHex}
        aria-hidden="true"
      >
        <div class="absolute inset-[10%] flex flex-col gap-[2.4cqw]">
          <span class="mb-[2cqw] h-[4cqw] w-1/2 rounded-full" style:background-color="#3a3a3a"></span>
          {#each lines as width, i (i)}
            <span class="h-[1.6cqw] rounded-full" style:width="{width}%" style:background-color="#8a8a8a"></span>
          {/each}
        </div>
      </div>
      <p class="max-w-sm text-center text-caption text-muted-foreground">
        The colour goes behind the text. If a page has a white picture behind its text, the picture will cover it.
      </p>
    </section>
  </div>

  <WorkspaceInspector title="Page colour">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Colour">
        <div class="flex flex-wrap items-center gap-2">
          {#each swatches as swatch (swatch.value)}
            {@const active = s.colorHex.toLowerCase() === swatch.value}
            <button
              type="button"
              aria-label={swatch.label}
              aria-pressed={active}
              onclick={() => (store.state.colorHex = swatch.value)}
              class={cn(
                "size-10 rounded-full border border-border-strong outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
              style:background-color={swatch.value}
            ></button>
          {/each}
        </div>
        <label
          class="relative flex h-10 cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-2 text-body text-foreground has-focus-visible:border-ring"
        >
          <span class="size-6 rounded-md border border-border-strong" style:background-color={s.colorHex}></span>
          <span class="flex-1">Custom colour</span>
          <span class="uppercase tabular-nums text-muted-foreground">{s.colorHex}</span>
          <input type="color" bind:value={store.state.colorHex} class="absolute inset-0 size-full cursor-pointer opacity-0" />
        </label>
      </OptionGroup>

      <OptionGroup label="Pages" description="Leave empty for every page, or type pages like 1-3, 5.">
        <label for="{uid}-range" class="sr-only">Pages</label>
        <input
          id="{uid}-range"
          type="text"
          bind:value={store.state.pageRange}
          placeholder={`All ${s.pageCount} pages`}
          aria-invalid={blocker !== null}
          class={cn(field, blocker && "border-destructive")}
        />
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Colouring pages…
        </span>
      {:else if blocker}
        <span class="block truncate text-destructive">{blocker}</span>
      {:else}
        <span class="block truncate">Applies to {pageLabel(targets.length)} of {s.pageCount}</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || blocker !== null}>
      {store.isProcessing ? "Colouring…" : `Colour ${pageLabel(targets.length)}`}
    </Button>
  </ToolFooter>
{/if}
