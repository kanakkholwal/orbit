<script lang="ts">
  import { FileRow, OptionGroup, ResultCard, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconDownload as Download,
    IconPlus as Plus,
    IconRefresh as Refresh,
    IconX as X,
  } from "@tabler/icons-svelte";
  import { EditMetadataState } from "./helper.svelte";

  const store = new EditMetadataState();
  const uid = $props.id();

  const inputClass =
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring";

  const mainFields = [
    { key: "title", label: "Title", placeholder: "Quarterly report", hint: "" },
    { key: "author", label: "Author", placeholder: "Your name", hint: "" },
    { key: "subject", label: "Subject", placeholder: "What the document is about", hint: "" },
    { key: "keywords", label: "Keywords", placeholder: "finance, 2026, draft", hint: "Separate with commas" },
  ] as const;

  const appFields = [
    { key: "creator", label: "Made with", placeholder: "The app the document was written in" },
    { key: "producer", label: "Saved as PDF by", placeholder: "The app that created the PDF" },
  ] as const;

  const showResult = $derived(!store.isProcessing && store.result !== null);
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;

  function clearResult() {
    store.result = null;
  }
</script>

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to edit its details</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Change the title, author and other hidden details that apps show about a file.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult && store.result}
      <ResultCard title="Details saved" description={`${store.result.name} is downloaded with the new details.`}>
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="edit-metadata" />
      </ResultCard>
    {/if}

    <FileRow
      name={store.file.file.name}
      meta={`${formatBytes(store.file.originalSize)} · ${pageLabel(store.pageCount)}`}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    <section class="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 sm:p-5" oninput={clearResult}>
      <div class="flex flex-col gap-0.5">
        <h2 class="text-body-lg font-medium text-foreground">Document details</h2>
        <p class="text-body text-muted-foreground">
          Apps and search tools show these instead of the file name. Leave a box empty to clear it.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        {#each mainFields as field (field.key)}
          <div class="flex flex-col gap-2">
            <label for="{uid}-{field.key}" class="text-body font-medium text-foreground">{field.label}</label>
            <input
              id="{uid}-{field.key}"
              type="text"
              bind:value={store[field.key]}
              placeholder={field.placeholder}
              aria-describedby={field.hint ? `${uid}-${field.key}-hint` : undefined}
              class={inputClass}
            />
            {#if field.hint}
              <p id="{uid}-{field.key}-hint" class="text-caption text-muted-foreground">{field.hint}</p>
            {/if}
          </div>
        {/each}

        <div class="flex flex-col gap-2">
          <label for="{uid}-created" class="text-body font-medium text-foreground">Created</label>
          <input id="{uid}-created" type="datetime-local" bind:value={store.creationDate} class="{inputClass} tabular-nums" />
        </div>
        <div class="flex flex-col gap-2">
          <label for="{uid}-modified" class="text-body font-medium text-foreground">Last changed</label>
          <input id="{uid}-modified" type="datetime-local" bind:value={store.modDate} class="{inputClass} tabular-nums" />
          <p class="text-caption text-muted-foreground">Leave empty to use the time you save</p>
        </div>
      </div>
    </section>
  </div>

  <WorkspaceInspector title="More details">
    <div class="flex flex-col gap-6" oninput={clearResult}>
      <OptionGroup label="Apps" description="Which programs made this file">
        <div class="flex flex-col gap-3">
          {#each appFields as field (field.key)}
            <div class="flex flex-col gap-1.5">
              <label for="{uid}-{field.key}" class="text-caption text-muted-foreground">{field.label}</label>
              <input
                id="{uid}-{field.key}"
                type="text"
                bind:value={store[field.key]}
                placeholder={field.placeholder}
                class={inputClass}
              />
            </div>
          {/each}
        </div>
      </OptionGroup>

      <OptionGroup
        label="Custom details"
        description="Your own labels, like Department or Project. Details with an empty name or value are left out."
      >
        <div class="flex flex-col gap-3">
          {#each store.customFields as field, i (field.id)}
            <div class="flex items-start gap-1">
              <div class="flex min-w-0 flex-1 flex-col gap-1.5">
                <label for="{uid}-custom-key-{field.id}" class="sr-only">Name of custom detail {i + 1}</label>
                <input
                  id="{uid}-custom-key-{field.id}"
                  type="text"
                  bind:value={field.key}
                  placeholder="Name, like Department"
                  class={inputClass}
                />
                <label for="{uid}-custom-value-{field.id}" class="sr-only">Value of custom detail {i + 1}</label>
                <input
                  id="{uid}-custom-value-{field.id}"
                  type="text"
                  bind:value={field.value}
                  placeholder="Value, like Marketing"
                  class={inputClass}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove custom detail ${i + 1}`}
                onclick={() => {
                  store.removeCustomField(field.id);
                  clearResult();
                }}
              >
                <X class="size-4" />
              </Button>
            </div>
          {/each}

          <Button
            variant="outline"
            class="w-full"
            onclick={() => {
              store.addCustomField();
              clearResult();
            }}
          >
            <Plus />
            Add a detail
          </Button>
        </div>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      <span class="block truncate">
        {#if store.isProcessing}
          Saving the new details…
        {:else if showResult}
          Details saved and downloaded
        {:else}
          Saves a copy with your changes
        {/if}
      </span>
    {/snippet}

    <Button variant="primary" onclick={() => store.save()} disabled={store.isProcessing}>
      {store.isProcessing ? "Saving…" : "Save details"}
    </Button>
  </ToolFooter>
{/if}
