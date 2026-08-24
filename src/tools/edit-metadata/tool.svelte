<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconLoader2 as LoaderCircle, IconPlus as Plus, IconDeviceFloppy as Save, IconTrash as Trash2 } from "@tabler/icons-svelte";
  import { EditMetadataState } from "./helper.svelte";

  const store = new EditMetadataState();

  const standardFields = [
    { key: "title", label: "Title", placeholder: "Document title" },
    { key: "author", label: "Author", placeholder: "Author name" },
    { key: "subject", label: "Subject", placeholder: "Document subject" },
    {
      key: "keywords",
      label: "Keywords",
      placeholder: "tag1, tag2, tag3",
    },
    {
      key: "creator",
      label: "Creator (app)",
      placeholder: "Source application",
    },
    {
      key: "producer",
      label: "Producer",
      placeholder: "PDF converter",
    },
  ] as const;
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
      count={store.pageCount}
      onReset={() => store.reset()}
      resetLabel="Clear"
    />

    <ToolPanel title="Source">
      <FileRow name={store.file.file.name}>
        <span class="font-mono tabular-nums">
          {formatBytes(store.file.originalSize)}
        </span>
        <span class="text-muted-foreground">·</span>
        <span class="font-mono tabular-nums">
          {store.pageCount} pages
        </span>
      </FileRow>
    </ToolPanel>

    {#if store.isProcessing}
      <div
        class="flex flex-col items-center gap-3 rounded-md border border-dashed border-border bg-muted/20 px-6 py-16"
      >
        <span class="inline-flex size-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
          <LoaderCircle class="size-4 animate-spin" />
        </span>
        <p class="label-eyebrow text-muted-foreground">
          Reading metadata
        </p>
      </div>
    {:else}
      <ToolPanel title="Standard fields">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          {#each standardFields as field}
            <div class="flex flex-col gap-2">
              <Label
                for={`meta-${field.key}`}
                class="label-eyebrow text-muted-foreground"
              >
                {field.label}
              </Label>
              <Input
                id={`meta-${field.key}`}
                bind:value={store[field.key]}
                placeholder={field.placeholder}
                class="h-10 rounded-sm font-mono text-sm"
              />
            </div>
          {/each}

          <div class="flex flex-col gap-2">
            <Label
              for="meta-creation"
              class="label-eyebrow text-muted-foreground"
            >
              Created
            </Label>
            <Input
              type="datetime-local"
              id="meta-creation"
              bind:value={store.creationDate}
              class="h-10 rounded-sm font-mono text-sm tabular-nums"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label
              for="meta-mod"
              class="label-eyebrow text-muted-foreground"
            >
              Modified
            </Label>
            <Input
              type="datetime-local"
              id="meta-mod"
              bind:value={store.modDate}
              class="h-10 rounded-sm font-mono text-sm tabular-nums"
            />
          </div>
        </div>
      </ToolPanel>

      <ToolPanel
        title="Custom fields"
        counter={store.customFields.length}
        description="Arbitrary key-value pairs in the document Info Dictionary."
      >
        <div class="flex flex-col gap-2">
          {#each store.customFields as field (field.id)}
            <div class="flex items-center gap-2">
              <Input
                placeholder="Key (e.g. Department)"
                bind:value={field.key}
                class="h-10 flex-1 rounded-sm font-mono text-sm"
              />
              <Input
                placeholder="Value (e.g. Marketing)"
                bind:value={field.value}
                class="h-10 flex-1 rounded-sm font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                class="rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onclick={() => store.removeCustomField(field.id)}
                aria-label="Remove field"
              >
                <Trash2 class="size-3.5" />
              </Button>
            </div>
          {/each}

          {#if store.customFields.length === 0}
            <div
              class="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-6 text-center"
            >
              <p
                class="label-eyebrow text-muted-foreground"
              >
                No custom fields
              </p>
            </div>
          {/if}
        </div>

        <Button
          variant="outline"
          class="mt-3 w-full rounded-sm border-dashed"
          onclick={() => store.addCustomField()}
        >
          <Plus class="size-3.5" />
          Add custom field
        </Button>
      </ToolPanel>
    {/if}

    <ToolFooter hint={store.isProcessing ? "Saving" : "Save metadata"}>
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.save()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          Saving
        {:else}
          <Save class="size-4" />
          Save metadata
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
