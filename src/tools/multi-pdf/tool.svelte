<script lang="ts">
  import Button from "$components/ui/button/button.svelte";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { cn } from "$lib/utils";
  import {
    CheckSquare,
    Download,
    FilePlus,
    Loader2,
    Redo2,
    RotateCcw,
    RotateCw,
    Square,
    Trash2,
    Undo2,
    UploadCloud,
  } from "@lucide/svelte";
  import Sortable from "sortablejs";
  import { setContext } from "svelte";
  import { slide } from "svelte/transition";
  import { PDF_STATE_KEY, PdfEditorState } from "./helper.svelte";
  import PdfPage from "./PdfPage.svelte";

  const pdfState = new PdfEditorState();
  setContext(PDF_STATE_KEY, pdfState);

  function sortable(node: HTMLElement) {
    const sortableInstance = new Sortable(node, {
      animation: 150,
      ghostClass: "opacity-50",
      onEnd: (evt) => {
        if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
          const pages = [...pdfState.pages];
          // GUARD: Ensure we have a valid item to move
          if (pages[evt.oldIndex]) {
            const [moved] = pages.splice(evt.oldIndex, 1);
            pages.splice(evt.newIndex, 0, moved);
            pdfState.pages = pages;
          }
        }
      },
    });

    return {
      destroy: () => sortableInstance.destroy(),
    };
  }

  let uploadArea: ReturnType<typeof UploadArea>;
</script>

<UploadArea
  bind:this={uploadArea}
  onFilesSelected={(files) => pdfState.loadPdfs(files)}
  class={pdfState.pages.length === 0 ? "h-full" : "hidden"}
/>

{#if pdfState.pages.length > 0}
  <div
    use:sortable
    class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 3xl:grid-cols-6"
  >
    {#each pdfState.pages as page, i (page?.id || i)}
      {#if page}
        <PdfPage {page} index={i} />
      {/if}
    {/each}
  </div>
{/if}

<div
  class={cn(
    "fixed bottom-4 inset-x-0 top-auto z-40 mx-auto w-full max-w-6xl px-2 sm:bottom-8 sm:px-4",
    pdfState.pages.length === 0 && "hidden",
  )}
  transition:slide={{ duration: 500, delay: 200 }}
>
  <div
    class="flex w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-border/50 bg-card/80 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 lg:flex-nowrap lg:justify-between"
  >
    <div class="flex items-center gap-1 lg:border-r lg:border-border/40 lg:pr-2">
      <Button
        variant="outline"
        class="toolbar-btn-primary"
        onclick={() => uploadArea.click()}
        title="Add PDF"
      >
        <UploadCloud size={18} />
        <span class="hidden sm:inline">Add PDF</span>
      </Button>
      <Button
        variant="secondary"
        class="toolbar-btn"
        onclick={() => pdfState.addBlankPage()}
        title="Add Blank"
      >
        <FilePlus size={18} />
        <span class="hidden md:inline">Add Blank</span>
      </Button>
    </div>

    <div class="flex items-center gap-1 lg:border-r lg:border-border/40 lg:pr-2">
      <Button
        variant="secondary"
        class="toolbar-btn"
        onclick={() => pdfState.undo()}
        title="Undo"
      >
        <Undo2 size={18} />
        <span class="hidden xl:inline">Undo</span>
      </Button>
      <Button
        variant="secondary"
        class="toolbar-btn"
        onclick={() => pdfState.redo()}
        title="Redo"
      >
        <Redo2 size={18} />
        <span class="hidden xl:inline">Redo</span>
      </Button>
    </div>

    <div class="flex items-center gap-1 lg:border-r lg:border-border/40 lg:pr-2">
      <Button
        variant="secondary"
        class="toolbar-btn"
        onclick={() => pdfState.bulkRotate(-90)}
        title="Rotate Left"
      >
        <RotateCcw size={18} />
        <span class="hidden xl:inline">Left</span>
      </Button>
      <Button
        variant="secondary"
        class="toolbar-btn"
        onclick={() => pdfState.bulkRotate(90)}
        title="Rotate Right"
      >
        <RotateCw size={18} />
        <span class="hidden xl:inline">Right</span>
      </Button>
    </div>

    <div class="flex items-center gap-1 lg:border-r lg:border-border/40 lg:pr-2">
      <Button
        variant={pdfState.selectedIds.size === pdfState.pages.length ? "default_soft" : "secondary"}
        class="toolbar-btn"
        onclick={() => pdfState.selectAll()}
        title="Select All"
      >
        <CheckSquare size={18} />
        <span class="hidden xl:inline">Select All</span>
      </Button>
      <Button
        variant="secondary"
        class="toolbar-btn"
        onclick={() => pdfState.deselectAll()}
        title="Deselect"
      >
        <Square size={18} />
        <span class="hidden xl:inline">Deselect</span>
      </Button>
    </div>

    <div class="flex items-center gap-1">
      <Button
        variant="destructive_soft"
        class="toolbar-btn"
        onclick={() => pdfState.bulkDelete()}
        title="Delete Selected"
      >
        <Trash2 size={18} />
        <span class="hidden md:inline">Delete</span>
      </Button>
      <Button variant="dark" onclick={() => pdfState.download()}>
        <Download size={16} />
        <span>Export</span>
      </Button>
    </div>
  </div>
</div>

{#if pdfState.loader.show}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div class="flex flex-col items-center rounded-2xl bg-card p-8 shadow-2xl ring-1 ring-border/50">
      <Loader2 class="mb-4 size-10 animate-spin text-primary" />
      <h3 class="mb-2 text-lg font-semibold text-foreground">
        Processing Documents
      </h3>
      <p class="mb-6 text-sm text-muted-foreground">{pdfState.loader.text}</p>
      <div class="h-2 w-64 overflow-hidden rounded-full bg-muted">
        <div
          class="h-full bg-primary transition-all duration-300"
          style="width: {pdfState.loader.progress}%"
        ></div>
      </div>
    </div>
  </div>
{/if}