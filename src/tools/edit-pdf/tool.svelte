<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import {
    Download,
    FilePenLine,
    FileText,
    Loader2,
    Trash2,
  } from "@lucide/svelte";
  import { EditPdfState } from "./helper.svelte";

  const store = new EditPdfState();

  // Svelte Action: Guarantees 'node' exists before we try to use it
  function setupEditor(node: HTMLElement) {
    store.initEditor(node);
    return {
      destroy() {
        // Optional cleanup
      },
    };
  }
</script>

{#if store.state.pendingFiles.length === 0 && store.state.files.length === 0 && !store.state.isLoading}
  <UploadArea
    accept=".pdf"
    multiple={true}
    onFilesSelected={(files) => store.queueFiles(files)}
  />
{:else}
    <div
      class="border-b border-border p-3 flex items-center justify-between gap-4"
    >
      <div class="flex items-center gap-2">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600"
        >
          <FilePenLine size={18} />
        </div>
        <h3 class="font-medium hidden sm:block">PDF Editor</h3>
      </div>

      <div class="flex items-center gap-2">
        <Button
          onclick={() => store.downloadActivePdf()}
          disabled={store.state.isLoading}
          variant="dark"
          size="sm"
        >
          {#if store.state.isLoading}
            <Loader2 size={16} class="animate-spin" />
          {:else}
            <Download size={16} /> Save
          {/if}
        </Button>
      </div>
    </div>

    <div class="flex-1 relative bg-muted min-h-96 h-full max-h-screen">
      <div
        use:setupEditor
        class="absolute inset-0 w-full h-full"
        style="display: block; width: 100%; height: 100%;"
      ></div>

      {#if store.state.isLoading}
        <div
          class="absolute inset-0 z-50 flex items-center justify-center bg-white/80"
        >
          <Loader2 class="animate-spin" /> Initializing...
        </div>
      {/if}
    </div>

    <div class="border-t border-border bg-background p-4">
      <div class="flex items-center gap-4 overflow-x-auto pb-2">
        {#each store.state.files as file (file.id)}
          <div
            class="flex items-center gap-3 rounded-lg border bg-card p-2 pr-3 min-w-50 shadow-sm cursor-pointer hover:border-primary/50 transition-colors {store
              .state.activeDocId === file.id
              ? 'border-primary ring-1 ring-primary'
              : 'border-border'}"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
            >
              <FileText size={16} />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-xs font-medium">{file.name}</p>
              <p class="text-[10px] text-muted-foreground">{file.size}</p>
            </div>
            <button
              onclick={(e) => {
                e.stopPropagation();
                store.closeDocument(file.id);
              }}
              class="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted"
              title="Close"
            >
              <Trash2 size={14} />
            </button>
          </div>
        {/each}

        <Label
          class="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-2 min-w-35 cursor-pointer hover:bg-muted transition-colors"
        >
          <input
            type="file"
            accept=".pdf"
            multiple
            class="hidden"
            onchange={(e) =>
              store.addFiles(Array.from(e.currentTarget.files || []))}
          />
          <span class="text-xs font-medium text-muted-foreground"
            >+ Add PDF</span
          >
        </Label>
      </div>
    </div>
{/if}
