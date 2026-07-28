<script lang="ts">
  import { FileRow, ToolBar, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconCheck as Check, IconCopy as Copy, IconFileSearch as FileSearch, IconLoader2 as LoaderCircle } from "@tabler/icons-svelte";
  import { ViewMetadataState } from "./helper.svelte";

  const store = new ViewMetadataState();
  let copied = $state(false);

  function handleCopy() {
    store.copyAsJson();
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

    {#if store.isProcessing}
      <div
        class="flex flex-col items-center gap-3 rounded-md border border-dashed border-border/60 bg-muted/20 px-6 py-16"
      >
        <span class="inline-flex size-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
          <LoaderCircle class="size-4 animate-spin" />
        </span>
        <p
          class="label-eyebrow text-muted-foreground"
        >
          Reading metadata
        </p>
      </div>
    {:else}
      <ToolPanel title="Document properties">
        {#snippet actions()}
          <Button
            variant="outline"
            size="sm"
            onclick={handleCopy}
            disabled={Object.keys(store.flatMetadataRecord).length === 0}
            class="rounded-sm"
          >
            {#if copied}
              <Check class="size-3.5 text-success" />
              Copied
            {:else}
              <Copy class="size-3.5" />
              Copy as JSON
            {/if}
          </Button>
        {/snippet}

        <div class="flex flex-col gap-5">
          {#if store.infoDictionary}
            <section
              class="overflow-hidden rounded-sm border border-border/60 bg-card"
            >
              <header
                class="flex items-center gap-2 border-b border-border/60 bg-muted/20 px-4 py-2.5"
              >
                <FileSearch class="size-3.5 text-primary" />
                <h3
                  class="label-eyebrow text-foreground"
                >
                  {store.infoDictionary.title}
                </h3>
              </header>
              <ul class="divide-y divide-border/60 text-sm">
                {#if store.infoDictionary.items.length === 0}
                  <li class="px-4 py-3 text-center text-xs italic text-muted-foreground">
                    No info dictionary data found.
                  </li>
                {:else}
                  {#each store.infoDictionary.items as item}
                    <li
                      class="grid grid-cols-1 gap-1 px-4 py-3 transition-colors hover:bg-muted/20 sm:grid-cols-3"
                    >
                      <span
                        class="label-eyebrow text-muted-foreground"
                      >
                        {item.key}
                      </span>
                      <span class="break-all text-sm text-foreground sm:col-span-2">
                        {item.value}
                      </span>
                    </li>
                  {/each}
                {/if}
              </ul>
            </section>
          {/if}

          {#if store.xmpMetadata}
            <section
              class="overflow-hidden rounded-sm border border-border/60 bg-card"
            >
              <header
                class="flex items-center gap-2 border-b border-border/60 bg-muted/20 px-4 py-2.5"
              >
                <FileSearch class="size-3.5 text-primary" />
                <h3
                  class="label-eyebrow text-foreground"
                >
                  {store.xmpMetadata.title}
                </h3>
              </header>
              <ul class="divide-y divide-border/60 text-sm">
                {#if store.xmpMetadata.items.length === 0}
                  {#if store.xmpMetadata.rawString}
                    <li class="p-4">
                      <p class="mb-2 label-eyebrow text-destructive">
                        Could not parse XML — raw XMP
                      </p>
                      <pre
                        class="break-all whitespace-pre-wrap rounded-sm bg-muted/40 p-3 font-mono text-[10px] text-muted-foreground">{store.xmpMetadata.rawString}</pre>
                    </li>
                  {:else}
                    <li class="px-4 py-3 text-center text-xs italic text-muted-foreground">
                      No XMP metadata found.
                    </li>
                  {/if}
                {:else}
                  {#each store.xmpMetadata.items as item}
                    <li
                      class="grid grid-cols-1 gap-1 py-3 pr-4 transition-colors hover:bg-muted/20 sm:grid-cols-3"
                      style="padding-left: {1 + item.indentLevel * 1.5}rem"
                    >
                      {#if item.value === ""}
                        <span class="col-span-full text-sm font-medium text-foreground">
                          {item.key}
                        </span>
                      {:else}
                        <span
                          class="label-eyebrow text-muted-foreground"
                        >
                          {item.key}
                        </span>
                        <span class="break-all text-sm text-foreground sm:col-span-2">
                          {item.value}
                        </span>
                      {/if}
                    </li>
                  {/each}
                {/if}
              </ul>
            </section>
          {/if}

          {#if store.formFields && store.formFields.items.length > 0}
            <section
              class="overflow-hidden rounded-sm border border-border/60 bg-card"
            >
              <header
                class="flex items-center gap-2 border-b border-border/60 bg-muted/20 px-4 py-2.5"
              >
                <FileSearch class="size-3.5 text-primary" />
                <h3
                  class="label-eyebrow text-foreground"
                >
                  {store.formFields.title}
                </h3>
              </header>
              <ul class="divide-y divide-border/60 text-sm">
                {#each store.formFields.items as item}
                  <li
                    class="grid grid-cols-1 gap-1 px-4 py-3 transition-colors hover:bg-muted/20 sm:grid-cols-3"
                  >
                    <span class="label-eyebrow text-muted-foreground">
                      {item.key}
                    </span>
                    <span class="break-all text-sm text-foreground sm:col-span-2">
                      {item.value}
                    </span>
                  </li>
                {/each}
              </ul>
            </section>
          {/if}
        </div>
      </ToolPanel>
    {/if}
  </div>
{/if}
