<script lang="ts">
  import { FileRow, ResultCard, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconDownload as Download,
    IconHighlight as Highlight,
    IconLink as Link,
    IconMessage as Message,
    IconForms as Forms,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { RemoveAnnotationsState } from "./helper.svelte";

  const store = new RemoveAnnotationsState();

  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const count = $derived(store.state.annotationCount);
  const showResult = $derived(!store.isProcessing && store.result !== null);

  const removes = [
    { icon: Message, label: "Comments and sticky notes" },
    { icon: Highlight, label: "Highlights, drawings and stamps" },
    { icon: Link, label: "Clickable links" },
    { icon: Forms, label: "Fillable form fields" },
  ];
</script>

{#if !store.state.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to clean up</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Remove comments, highlights and other marks, and keep the pages themselves. The file never leaves this device.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult && store.result}
      <ResultCard
        title={`Removed ${plural(store.result.removed, "mark", "marks")}`}
        description={`${store.result.name} is downloaded with clean pages.`}
      >
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="remove-annotations" />
      </ResultCard>
    {/if}

    <FileRow name={store.state.file.name} onRemove={store.isProcessing ? undefined : () => store.reset()}>
      <span>{formatBytes(store.state.originalSize)}</span>
      <span aria-hidden="true">·</span>
      <span>{plural(store.state.pageCount, "page", "pages")}</span>
      {#if !showResult}
        <span aria-hidden="true">·</span>
        <span class={count > 0 ? "font-medium text-foreground" : ""}>
          {count > 0 ? `${plural(count, "mark", "marks")} found` : "No marks found"}
        </span>
      {/if}
    </FileRow>

    <section class="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div class="flex flex-col gap-0.5">
        <h2 class="text-body-lg font-medium text-foreground">What gets removed</h2>
        <p class="text-body text-muted-foreground">
          Everything added on top of the pages. Text and images on the pages stay as they are.
        </p>
      </div>
      <ul class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {#each removes as item (item.label)}
          <li class="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5 text-body text-foreground">
            <item.icon class="size-4 shrink-0 text-muted-foreground" />
            {item.label}
          </li>
        {/each}
      </ul>
      <p class="border-t border-border pt-4 text-caption text-muted-foreground">
        This cannot be undone in the new copy. Your original file stays unchanged.
      </p>
    </section>
  </div>

  <ToolFooter>
    {#snippet hint()}
      <span class="block truncate">
        {#if store.isProcessing}
          Removing marks…
        {:else if showResult}
          All marks removed
        {:else if count === 0}
          This PDF has no comments or marks to remove
        {:else}
          {plural(count, "mark", "marks")} on {plural(store.state.pageCount, "page", "pages")} will be removed
        {/if}
      </span>
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={store.isProcessing || count === 0}>
      {store.isProcessing ? "Removing…" : "Remove annotations"}
    </Button>
  </ToolFooter>
{/if}
