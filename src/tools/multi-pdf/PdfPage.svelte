<script lang="ts">
  import { cn } from "$lib/utils";
  import {
    IconCheck as Check,
    IconCopy as Copy,
    IconLoader2 as Loader,
    IconRotate2 as RotateLeft,
    IconRotateClockwise as RotateRight,
    IconScissors as Scissors,
    IconTrash as Trash,
  } from "@tabler/icons-svelte";
  import { getContext } from "svelte";
  import { PDF_STATE_KEY, type PageData, type PdfEditorState } from "./helper.svelte";

  const pdfState = getContext<PdfEditorState>(PDF_STATE_KEY);

  let { page, index, isLast }: { page: PageData; index: number; isLast: boolean } = $props();

  let canvasEl: HTMLCanvasElement;
  let isRendered = $state(false);
  const isBlank = $derived(page.pdfIndex === -1);
  const isSelected = $derived(pdfState.selectedIds.has(page.id));
  const splitsHere = $derived(pdfState.splitMarkers.has(page.id) && !isLast);
  const label = $derived(`Page ${index + 1}`);

  function lazyLoad(node: HTMLElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (!isRendered && canvasEl && page.pdfIndex !== -1) {
          pdfState
            .renderThumbnail(canvasEl, page.pdfIndex, page.pageIndex, page.rotation)
            .then(() => (isRendered = true))
            .catch((err) => console.error("Render failed:", err));
        }
        observer.disconnect();
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }

  const actionClass =
    "grid size-9 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";
</script>

<div class="group relative" data-id={page.id} use:lazyLoad>
  <div
    class={cn(
      "flex flex-col overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow] duration-150",
      isSelected ? "border-primary ring-1 ring-primary" : "border-border hover:border-border-strong hover:shadow-sm"
    )}
  >
    <button
      type="button"
      onclick={() => pdfState.toggleSelection(page.id)}
      aria-pressed={isSelected}
      aria-label={`${label}${isSelected ? ", selected" : ""}`}
      class="relative m-1.5 grid aspect-3/4 cursor-grab place-items-center overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
    >
      {#if isBlank}
        <span class="absolute inset-3 rounded-sm bg-fixed-light shadow-xs"></span>
      {:else if !isRendered}
        <Loader class="absolute size-5 animate-spin text-muted-foreground" />
      {/if}
      <canvas
        bind:this={canvasEl}
        class={cn(
          "h-full w-full object-contain transition-[opacity,transform] duration-300 ease-craft",
          isRendered ? "opacity-100" : "opacity-0",
          isBlank && "hidden"
        )}
        style:transform={`rotate(${page.visualRotation}deg)`}
      ></canvas>

      <span
        aria-hidden="true"
        class={cn(
          "absolute left-2 top-2 grid size-6 place-items-center rounded-md border transition-[opacity,background-color]",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background/95 text-transparent pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
        )}
      >
        <Check class="size-4" />
      </span>
    </button>

    <div class="flex items-center justify-between gap-1 px-2 pb-1.5">
      <span class="min-w-0 truncate text-caption tabular-nums text-muted-foreground">
        <span class="font-medium text-foreground">{index + 1}</span>
        · {isBlank ? "Blank page" : page.fileName}
      </span>
    </div>

    <div
      class="flex items-center justify-between border-t border-border px-1 py-0.5 pointer-fine:opacity-0 pointer-fine:transition-opacity pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100"
    >
      <button type="button" class={actionClass} onclick={() => pdfState.rotatePage(page.id, -90)} aria-label={`Rotate ${label} left`} title="Rotate left">
        <RotateLeft class="size-4" />
      </button>
      <button type="button" class={actionClass} onclick={() => pdfState.rotatePage(page.id, 90)} aria-label={`Rotate ${label} right`} title="Rotate right">
        <RotateRight class="size-4" />
      </button>
      <button type="button" class={actionClass} onclick={() => pdfState.duplicatePage(page.id)} aria-label={`Duplicate ${label}`} title="Duplicate">
        <Copy class="size-4" />
      </button>
      {#if !isLast}
        <button
          type="button"
          class={cn(actionClass, splitsHere && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary")}
          onclick={() => pdfState.toggleSplit(page.id)}
          aria-pressed={splitsHere}
          aria-label={`Start a new document after ${label}`}
          title="Split after this page"
        >
          <Scissors class="size-4" />
        </button>
      {/if}
      <button
        type="button"
        class={cn(actionClass, "hover:bg-destructive/10 hover:text-destructive")}
        onclick={() => pdfState.deletePage(page.id)}
        aria-label={`Delete ${label}`}
        title="Delete"
      >
        <Trash class="size-4" />
      </button>
    </div>
  </div>

  {#if splitsHere}
    <span
      class="absolute -right-2 top-1/3 z-10 flex -translate-y-1/2 items-center gap-1 rounded-full bg-primary px-2 py-1 text-caption font-medium text-primary-foreground shadow-md"
    >
      <Scissors class="size-3.5" />
      <span class="sr-only">New document starts after {label}</span>
    </span>
  {/if}
</div>
