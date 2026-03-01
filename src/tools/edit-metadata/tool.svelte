<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    FileEdit,
    FileText,
    Loader2,
    Plus,
    Save,
    Trash2
  } from "@lucide/svelte";
  import { EditMetadataState } from "./helper.svelte";

  const store = new EditMetadataState();
</script>

{#if !store.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files)}
  />
{:else}
  <div class="sticky top-0 z-20 border-b border-border bg-accent/50 p-4 rounded-lg">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-sm font-semibold flex items-center gap-2">
        <FileText size={18} class="text-primary" />
        {store.file.file.name}
        <span class="text-xs font-normal text-muted-foreground ml-2">
          {formatBytes(store.file.originalSize)} • {store.pageCount} Pages
        </span>
      </h2>
      <div class="flex items-center gap-2">
        <Button variant="ghost" onclick={() => store.reset()} disabled={store.isProcessing}>
          <Trash2 size={16} /> Clear
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6 space-y-8">
    <div class="max-w-3xl mx-auto space-y-8">
      
      {#if store.isProcessing}
          <div class="flex flex-col items-center justify-center py-20 text-muted-foreground">
             <Loader2 class="animate-spin mb-4 text-primary" size={32} />
             <p>Reading metadata...</p>
          </div>
      {:else}
          <div class="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <h3 class="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                <FileEdit size={20} class="text-primary"/> Standard Metadata
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="space-y-2">
                <Label for="meta-title">Title</Label>
                <Input id="meta-title" bind:value={store.title} placeholder="Document Title" />
              </div>
              <div class="space-y-2">
                <Label for="meta-author">Author</Label>
                <Input id="meta-author" bind:value={store.author} placeholder="Author Name" />
              </div>
              <div class="space-y-2">
                <Label for="meta-subject">Subject</Label>
                <Input id="meta-subject" bind:value={store.subject} placeholder="Document Subject" />
              </div>
              <div class="space-y-2">
                <Label for="meta-keywords">Keywords (comma-separated)</Label>
                <Input id="meta-keywords" bind:value={store.keywords} placeholder="tag1, tag2, tag3" />
              </div>
              <div class="space-y-2">
                <Label for="meta-creator">Creator (Application)</Label>
                <Input id="meta-creator" bind:value={store.creator} placeholder="App that created the original doc" />
              </div>
              <div class="space-y-2">
                <Label for="meta-producer">Producer (PDF Converter)</Label>
                <Input id="meta-producer" bind:value={store.producer} placeholder="Tool that produced the PDF" />
              </div>
              <div class="space-y-2">
                <Label for="meta-creation">Creation Date</Label>
                <Input type="datetime-local" id="meta-creation" bind:value={store.creationDate} />
              </div>
              <div class="space-y-2">
                <Label for="meta-mod">Modification Date</Label>
                <Input type="datetime-local" id="meta-mod" bind:value={store.modDate} />
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
                <h3 class="text-lg font-bold text-foreground">Custom Fields</h3>
                <p class="text-sm text-muted-foreground mt-1">Add arbitrary key-value pairs to the document's Info Dictionary.</p>
            </div>

            <div class="space-y-3">
                {#each store.customFields as field (field.id)}
                    <div class="flex items-center gap-3">
                        <Input placeholder="Key (e.g. Department)" bind:value={field.key} class="flex-1 font-mono text-sm" />
                        <Input placeholder="Value (e.g. Marketing)" bind:value={field.value} class="flex-1" />
                        <Button variant="ghost" size="icon" class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0" onclick={() => store.removeCustomField(field.id)}>
                            <Trash2 size={16} />
                        </Button>
                    </div>
                {/each}
                
                {#if store.customFields.length === 0}
                    <div class="py-6 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg bg-muted/30">
                        No custom fields set.
                    </div>
                {/if}
            </div>

            <Button variant="outline" class="w-full border-dashed" onclick={() => store.addCustomField()}>
                <Plus size={16} class="mr-2" /> Add Custom Field
            </Button>
          </div>
      {/if}
    </div>
  </div>

  <div class="border-t border-border p-4 text-center">
    <Button
      size="lg"
      variant="dark"
      class="px-8 h-11 min-w-50"
      onclick={() => store.save()}
      disabled={store.isProcessing}
    >
      {#if store.isProcessing}
        <Loader2 class="animate-spin mr-2" size={18} /> Saving...
      {:else}
        Save Metadata <Save size={18} class="ml-2" />
      {/if}
    </Button>
  </div>
{/if}