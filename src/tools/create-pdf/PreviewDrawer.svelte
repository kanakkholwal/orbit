<script lang="ts">
  import { Button } from "$components/ui/button";
  import * as Drawer from "$components/ui/drawer";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
  import { IconDownload as Download, IconLoader2 as Loader, IconX as X } from "@tabler/icons-svelte";
  import type { PDFDocumentProxy } from "pdfjs-dist";
  import type { CreatorState } from "./state.svelte";

  let { studio, open = $bindable(false) }: { studio: CreatorState; open: boolean } = $props();

  const isMobile = new IsMobile();
  let status = $state<"idle" | "loading" | "ready" | "error">("idle");
  let pdf = $state.raw<PDFDocumentProxy | null>(null);
  let blob = $state.raw<Blob | null>(null);
  let width = $state(0);

  $effect(() => {
    if (!open) return;
    let cancelled = false;
    status = "loading";
    studio.loadPreview().then((result) => {
      if (cancelled) return;
      pdf = result?.pdf ?? null;
      blob = result?.blob ?? null;
      status = result ? "ready" : "error";
    });
    return () => {
      cancelled = true;
      pdf?.destroy();
      pdf = null;
    };
  });

  function page(canvas: HTMLCanvasElement, index: number) {
    if (pdf && width > 0) studio.renderPageToCanvas(canvas, pdf, index, Math.min(width, 760));
  }
</script>

<Drawer.Root bind:open direction={isMobile.current ? "bottom" : "right"} shouldScaleBackground={false}>
  <Drawer.Content class={isMobile.current ? "h-[92dvh] max-h-[92dvh] rounded-t-3xl" : "data-[vaul-drawer-direction=right]:w-[min(52rem,92vw)] data-[vaul-drawer-direction=right]:max-w-none data-[vaul-drawer-direction=right]:sm:max-w-none"}>
    <div class="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
      <Drawer.Title class="min-w-0 flex-1 truncate px-1 text-body font-medium text-foreground">
        Preview{#if pdf}<span class="font-normal text-muted-foreground"> · {pdf.numPages} {pdf.numPages === 1 ? "page" : "pages"}</span>{/if}
      </Drawer.Title>
      <Button size="sm" variant="primary" disabled={!blob} onclick={() => blob && studio.downloadBlob(blob, `${studio.fileName}.pdf`)}>
        <Download />
        Download
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Close preview" onclick={() => (open = false)}><X /></Button>
    </div>
    <Drawer.Description class="sr-only">The exact PDF that will be downloaded.</Drawer.Description>
    <div class="scrollbar-subtle min-h-0 flex-1 overflow-y-auto bg-canvas p-4 sm:p-8" bind:clientWidth={width}>
      {#if status === "loading"}
        <div class="flex h-full flex-col items-center justify-center gap-3 text-body text-muted-foreground" role="status">
          <Loader class="size-5 animate-spin text-primary" />
          {studio.engineLoading ? "Building your PDF" : "Rendering pages"}
        </div>
      {:else if status === "error"}
        <p class="py-16 text-center text-body text-muted-foreground">The preview couldn't be built. Check the message above, then try again.</p>
      {:else if pdf}
        <div class="mx-auto flex flex-col items-center gap-6">
          {#each Array.from({ length: pdf.numPages }, (_, i) => i) as index (index)}
            {#key width}
              <canvas use:page={index} class="max-w-full rounded-sm bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_12px_32px_-12px_rgb(0_0_0/0.25)]" aria-label={`Page ${index + 1}`}></canvas>
            {/key}
          {/each}
        </div>
      {/if}
    </div>
  </Drawer.Content>
</Drawer.Root>
