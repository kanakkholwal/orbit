<script lang="ts">
  import { ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { cn } from "$lib/utils";
  import {
    ChevronLeft,
    ChevronRight,
    Eraser,
    LoaderCircle,
    PenLine,
    Type,
    Upload,
  } from "@lucide/svelte";
  import { EsignPdfState } from "./helper.svelte";

  const store = new EsignPdfState();

  type Mode = "draw" | "type" | "upload";
  let mode = $state<Mode>("draw");
  let typedName = $state("");

  const modes: { id: Mode; label: string; icon: typeof PenLine }[] = [
    { id: "draw", label: "Draw", icon: PenLine },
    { id: "type", label: "Type", icon: Type },
    { id: "upload", label: "Upload", icon: Upload },
  ];

  // ── Drawing pad ───────────────────────────────────────────────────────────
  let pad = $state<HTMLCanvasElement>()!;
  let drawing = false;
  let hasInk = $state(false);

  function padPos(e: PointerEvent) {
    const r = pad.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * pad.width,
      y: ((e.clientY - r.top) / r.height) * pad.height,
    };
  }
  function startDraw(e: PointerEvent) {
    drawing = true;
    hasInk = true;
    const ctx = pad.getContext("2d")!;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1916";
    const { x, y } = padPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    pad.setPointerCapture(e.pointerId);
  }
  function moveDraw(e: PointerEvent) {
    if (!drawing) return;
    const ctx = pad.getContext("2d")!;
    const { x, y } = padPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  function endDraw() {
    drawing = false;
  }
  function clearPad() {
    pad?.getContext("2d")?.clearRect(0, 0, pad.width, pad.height);
    hasInk = false;
  }
  function useDrawn() {
    if (!hasInk) return;
    store.setSignature(pad.toDataURL("image/png"));
  }

  // ── Typed signature ───────────────────────────────────────────────────────
  function useTyped() {
    if (!typedName.trim()) return;
    const c = document.createElement("canvas");
    c.width = 600;
    c.height = 200;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#1a1916";
    ctx.font = 'italic 72px "Segoe Script", "Brush Script MT", cursive';
    ctx.textBaseline = "middle";
    ctx.fillText(typedName.trim(), 20, 110);
    store.setSignature(c.toDataURL("image/png"));
  }

  // ── Uploaded image ────────────────────────────────────────────────────────
  function onUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => store.setSignature(reader.result as string);
    reader.onerror = () => store.notifyUnsupported();
    reader.readAsDataURL(file);
    (e.target as HTMLInputElement).value = "";
  }

  // ── Page preview + draggable placement ────────────────────────────────────
  let previewCanvas = $state<HTMLCanvasElement>();
  let stage = $state<HTMLDivElement>();
  let dragging = false;
  let grab = { dx: 0, dy: 0 };

  $effect(() => {
    const page = store.placement.page;
    if (previewCanvas && store.hasPdf) {
      store.renderPreview(previewCanvas, page);
    }
  });

  function startMove(e: PointerEvent) {
    if (!stage) return;
    dragging = true;
    const r = stage.getBoundingClientRect();
    grab.dx = (e.clientX - r.left) / r.width - store.placement.x;
    grab.dy = (e.clientY - r.top) / r.height - store.placement.y;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent) {
    if (!dragging || !stage) return;
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - grab.dx;
    const y = (e.clientY - r.top) / r.height - grab.dy;
    store.placement = {
      ...store.placement,
      x: Math.max(0, Math.min(x, 1 - store.placement.w)),
      y: Math.max(0, Math.min(y, 1)),
    };
  }
  function endMove() {
    dragging = false;
  }
</script>

{#if !store.hasPdf}
  <UploadArea
    accept="application/pdf"
    multiple={false}
    onFilesSelected={(f) => store.loadFile(f[0])}
  >
    {#snippet title()}
      <h3 class="text-display-sm text-foreground">Sign a PDF</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-md text-sm leading-relaxed text-muted-foreground">
        Draw, type, or upload your signature, place it anywhere on the page, and
        download. Entirely on your device — nothing is uploaded.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar label="Sign · {store.fileName}.pdf" onReset={() => store.reset()} resetLabel="Start over" />

    {#if !store.signature}
      <ToolPanel title="Create your signature">
        <div class="flex flex-col gap-5">
          <div class="grid grid-cols-3 gap-2">
            {#each modes as m (m.id)}
              {@const Icon = m.icon}
              <button
                type="button"
                onclick={() => (mode = m.id)}
                class={cn(
                  "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors",
                  mode === m.id
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon class="size-4" />
                {m.label}
              </button>
            {/each}
          </div>

          {#if mode === "draw"}
            <div class="flex flex-col gap-3">
              <canvas
                bind:this={pad}
                width="600"
                height="200"
                onpointerdown={startDraw}
                onpointermove={moveDraw}
                onpointerup={endDraw}
                class="h-48 w-full touch-none rounded-lg border border-border bg-card"
              ></canvas>
              <div class="flex items-center gap-2">
                <Button variant="ghost" size="sm" class="rounded-md" onclick={clearPad}>
                  <Eraser class="size-3.5" />
                  Clear
                </Button>
                <Button class="ml-auto rounded-md" onclick={useDrawn} disabled={!hasInk}>
                  Use signature
                </Button>
              </div>
            </div>
          {:else if mode === "type"}
            <div class="flex flex-col gap-3">
              <Input
                bind:value={typedName}
                placeholder="Type your name"
                class="h-12 rounded-md text-lg"
              />
              {#if typedName.trim()}
                <div
                  class="flex h-24 items-center rounded-lg border border-border bg-card px-5"
                >
                  <span
                    class="text-4xl text-foreground"
                    style="font-family: 'Segoe Script', 'Brush Script MT', cursive; font-style: italic;"
                  >
                    {typedName}
                  </span>
                </div>
              {/if}
              <Button class="ml-auto w-fit rounded-md" onclick={useTyped} disabled={!typedName.trim()}>
                Use signature
              </Button>
            </div>
          {:else}
            <label
              class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-6 py-12 text-center transition-colors hover:bg-muted/30"
            >
              <Upload class="size-5 text-muted-foreground" />
              <span class="text-sm text-muted-foreground">
                Upload a signature image (PNG with transparency works best)
              </span>
              <input type="file" accept="image/*" class="hidden" onchange={onUpload} />
            </label>
          {/if}
        </div>
      </ToolPanel>
    {:else}
      <ToolPanel title="Place your signature">
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                class="rounded-md"
                onclick={() => store.setPage(store.placement.page - 1)}
                disabled={store.placement.page === 0}
              >
                <ChevronLeft class="size-4" />
              </Button>
              <span class="px-2 font-mono text-xs tabular-nums text-muted-foreground">
                {store.placement.page + 1} / {store.pageCount}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                class="rounded-md"
                onclick={() => store.setPage(store.placement.page + 1)}
                disabled={store.placement.page >= store.pageCount - 1}
              >
                <ChevronRight class="size-4" />
              </Button>
            </div>

            <label class="flex items-center gap-2 text-xs text-muted-foreground">
              Size
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.01"
                value={store.placement.w}
                oninput={(e) =>
                  (store.placement = {
                    ...store.placement,
                    w: parseFloat((e.target as HTMLInputElement).value),
                  })}
                class="accent-primary"
              />
            </label>

            <Button
              variant="ghost"
              size="sm"
              class="ml-auto rounded-md text-muted-foreground"
              onclick={() => store.clearSignature()}
            >
              Change signature
            </Button>
          </div>

          <div
            bind:this={stage}
            class="relative mx-auto w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card"
          >
            <canvas bind:this={previewCanvas} class="block h-auto w-full"></canvas>
            {#if store.signature}
              <img
                src={store.signature}
                alt="signature"
                draggable="false"
                onpointerdown={startMove}
                onpointermove={move}
                onpointerup={endMove}
                style="left: {store.placement.x * 100}%; top: {store.placement.y *
                  100}%; width: {store.placement.w * 100}%;"
                class="absolute cursor-move touch-none select-none rounded-xs outline-2 outline-primary/40 hover:outline-primary"
              />
            {/if}
          </div>
          <p class="text-center text-xs text-muted-foreground">
            Drag the signature to position it, then apply.
          </p>
        </div>
      </ToolPanel>
    {/if}

    <ToolFooter
      hint={store.isProcessing
        ? store.progressLabel
        : store.signature
          ? "Drag to position, then apply"
          : "Create a signature to continue"}
    >
      <Button
        size="lg"
        class="rounded-md bg-primary px-6 text-primary-foreground hover:bg-primary-active"
        onclick={() => store.apply()}
        disabled={!store.ready || store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progressLabel}
        {:else}
          Apply & download
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
