<script lang="ts">
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { arrayMove, sortableList } from "$lib/actions/sortable-list";
  import { cn } from "$lib/utils";
  import {
    IconSquareCheck as CheckSquare,
    IconDownload as Download,
    IconFilePlus as FilePlus,
    IconLoader2 as LoaderCircle,
    IconArrowForwardUp as Redo2,
    IconRotate2 as RotateCcw,
    IconRotateClockwise as RotateCw,
    IconSquare as Square,
    IconTrash as Trash2,
    IconArrowBackUp as Undo2,
    IconCloudUpload as UploadCloud,
  } from "@tabler/icons-svelte";
  import { setContext } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { PDF_STATE_KEY, PdfEditorState } from "./helper.svelte";
  import PdfPage from "./PdfPage.svelte";

  const pdfState = new PdfEditorState();
  setContext(PDF_STATE_KEY, pdfState);

  let uploadArea: ReturnType<typeof UploadArea>;

  const toolbarBtn =
    "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 label-eyebrow transition-colors text-muted-foreground hover:bg-muted/60 hover:text-foreground";
</script>

<UploadArea
  bind:this={uploadArea}
  onFilesSelected={(files) => pdfState.loadPdfs(files)}
  class={pdfState.pages.length === 0 ? "h-full" : "hidden"}
/>

{#if pdfState.pages.length > 0}
  <div class="flex flex-col gap-4 pb-32">
    <div
      class="sticky top-0 z-20 flex items-baseline justify-between gap-3 border-b border-border bg-card/70 py-2 backdrop-blur-2xl backdrop-saturate-150 supports-backdrop-filter:bg-card/55"
    >
      <span
        class="label-eyebrow text-primary"
      >
        Pages
      </span>
      <span class="font-mono text-caption tabular-nums text-muted-foreground">
        {String(pdfState.selectedIds.size).padStart(2, "0")} / {String(pdfState.pages.length).padStart(2, "0")}
      </span>
    </div>

    <div
      use:sortableList={{
        onReorder: (o, n) => (pdfState.pages = arrayMove(pdfState.pages, o, n)),
      }}
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 3xl:grid-cols-6"
    >
      {#each pdfState.pages as page, i (page?.id || i)}
        {#if page}
          <PdfPage {page} index={i} />
        {/if}
      {/each}
    </div>
  </div>
{/if}

<div
  class={cn(
    "fixed inset-x-0 bottom-4 z-40 mx-auto w-full max-w-5xl px-3 sm:bottom-6 sm:px-4",
    pdfState.pages.length === 0 && "hidden"
  )}
  transition:slide={{ duration: 320, delay: 120 }}
  style="padding-bottom: max(env(safe-area-inset-bottom), 0px);"
>
  <div
    class="flex w-full flex-wrap items-center justify-between gap-1.5 rounded-md border border-border bg-card/70 px-2 py-1.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.18)] backdrop-blur-2xl backdrop-saturate-150 supports-backdrop-filter:bg-card/55 lg:flex-nowrap"
  >
    <div class="flex items-center gap-1 lg:border-r lg:border-border lg:pr-1.5">
      <button
        type="button"
        class={toolbarBtn}
        onclick={() => uploadArea.click()}
        title="Add PDF"
      >
        <UploadCloud class="size-3.5" />
        <span class="hidden sm:inline">Add</span>
      </button>
      <button
        type="button"
        class={toolbarBtn}
        onclick={() => pdfState.addBlankPage()}
        title="Add blank page"
      >
        <FilePlus class="size-3.5" />
        <span class="hidden md:inline">Blank</span>
      </button>
    </div>

    <div class="flex items-center gap-1 lg:border-r lg:border-border lg:pr-1.5">
      <button
        type="button"
        class={toolbarBtn}
        onclick={() => pdfState.undo()}
        title="Undo"
      >
        <Undo2 class="size-3.5" />
        <span class="hidden xl:inline">Undo</span>
      </button>
      <button
        type="button"
        class={toolbarBtn}
        onclick={() => pdfState.redo()}
        title="Redo"
      >
        <Redo2 class="size-3.5" />
        <span class="hidden xl:inline">Redo</span>
      </button>
    </div>

    <div class="flex items-center gap-1 lg:border-r lg:border-border lg:pr-1.5">
      <button
        type="button"
        class={toolbarBtn}
        onclick={() => pdfState.bulkRotate(-90)}
        title="Rotate left"
      >
        <RotateCcw class="size-3.5" />
        <span class="hidden xl:inline">Left</span>
      </button>
      <button
        type="button"
        class={toolbarBtn}
        onclick={() => pdfState.bulkRotate(90)}
        title="Rotate right"
      >
        <RotateCw class="size-3.5" />
        <span class="hidden xl:inline">Right</span>
      </button>
    </div>

    <div class="flex items-center gap-1 lg:border-r lg:border-border lg:pr-1.5">
      <button
        type="button"
        class={cn(
          toolbarBtn,
          pdfState.selectedIds.size === pdfState.pages.length &&
            "bg-primary/10 text-primary"
        )}
        onclick={() => pdfState.selectAll()}
        title="Select all"
      >
        <CheckSquare class="size-3.5" />
        <span class="hidden xl:inline">All</span>
      </button>
      <button
        type="button"
        class={toolbarBtn}
        onclick={() => pdfState.deselectAll()}
        title="Deselect"
      >
        <Square class="size-3.5" />
        <span class="hidden xl:inline">None</span>
      </button>
    </div>

    <div class="flex items-center gap-1.5">
      <button
        type="button"
        class={cn(
          toolbarBtn,
          "hover:bg-destructive/10 hover:text-destructive"
        )}
        onclick={() => pdfState.bulkDelete()}
        title="Delete selected"
      >
        <Trash2 class="size-3.5" />
        <span class="hidden md:inline">Delete</span>
      </button>
      <Button
        size="sm"
        class="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
        onclick={() => pdfState.download()}
      >
        <Download class="size-3.5" />
        Export
      </Button>
    </div>
  </div>
</div>

{#if pdfState.loader.show}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
    transition:fade={{ duration: 160 }}
  >
    <div
      class="flex w-full max-w-sm flex-col items-center gap-4 rounded-md border border-border bg-card p-6 shadow-2xl"
    >
      <span
        class="inline-flex size-10 items-center justify-center rounded-sm bg-primary/10 text-primary"
      >
        <LoaderCircle class="size-4 animate-spin" />
      </span>
      <p
        class="label-eyebrow text-muted-foreground"
      >
        Processing
      </p>
      <p class="text-sm text-foreground">{pdfState.loader.text}</p>
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
        <div
          class="h-full bg-primary transition-all duration-300"
          style="width: {pdfState.loader.progress}%"
        ></div>
      </div>
    </div>
  </div>
{/if}
