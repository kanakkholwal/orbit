<script lang="ts">
  import { OptionGroup, ResultCard, SegmentedControl, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { workspace } from "$stores/workspace.svelte";
  import {
    IconChevronLeft as ChevronLeft,
    IconChevronRight as ChevronRight,
    IconDownload as Download,
    IconEraser as Eraser,
    IconLoader2 as Loader,
    IconPhoto as Photo,
    IconRefresh as Refresh,
    IconSignature as SignatureIcon,
  } from "@tabler/icons-svelte";
  import { untrack } from "svelte";
  import { EsignPdfState } from "./helper.svelte";

  const store = new EsignPdfState();
  const uid = $props.id();

  type Mode = "draw" | "type" | "upload";
  let mode = $state<Mode>("draw");
  let typedName = $state("");
  let uploadedName = $state<string | null>(null);
  let uploadInput = $state<HTMLInputElement | null>(null);

  const modes: { value: Mode; label: string }[] = [
    { value: "draw", label: "Draw" },
    { value: "type", label: "Type" },
    { value: "upload", label: "Image" },
  ];

  const INK = "#1a1916";
  const SCRIPT_FONT = '"Segoe Script", "Brush Script MT", cursive';

  let pad = $state<HTMLCanvasElement | null>(null);
  let drawing = false;
  let hasInk = $state(false);

  $effect(() => {
    if (mode !== "draw" || !pad) hasInk = false;
  });

  function padPos(e: PointerEvent) {
    const r = pad!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * pad!.width,
      y: ((e.clientY - r.top) / r.height) * pad!.height,
    };
  }
  function startDraw(e: PointerEvent) {
    if (!pad) return;
    drawing = true;
    hasInk = true;
    const ctx = pad.getContext("2d")!;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = INK;
    const { x, y } = padPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    pad.setPointerCapture(e.pointerId);
  }
  function moveDraw(e: PointerEvent) {
    if (!drawing || !pad) return;
    const ctx = pad.getContext("2d")!;
    const { x, y } = padPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  function endDraw() {
    if (!drawing) return;
    drawing = false;
    if (pad && hasInk) store.setSignature(pad.toDataURL("image/png"));
  }
  function clearPad() {
    pad?.getContext("2d")?.clearRect(0, 0, pad.width, pad.height);
    hasInk = false;
    store.clearSignature();
  }

  function applyTyped(name: string) {
    const text = name.trim();
    if (!text) {
      store.clearSignature();
      return;
    }
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d")!;
    ctx.font = `italic 72px ${SCRIPT_FONT}`;
    c.width = Math.max(200, Math.ceil(ctx.measureText(text).width) + 40);
    c.height = 140;
    ctx.font = `italic 72px ${SCRIPT_FONT}`;
    ctx.fillStyle = INK;
    ctx.textBaseline = "middle";
    ctx.fillText(text, 20, 76);
    store.setSignature(c.toDataURL("image/png"));
  }

  function onUpload(e: Event & { currentTarget: HTMLInputElement }) {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      uploadedName = file.name;
      store.setSignature(reader.result as string);
    };
    reader.onerror = () => store.notifyUnsupported();
    reader.readAsDataURL(file);
  }

  let previewCanvas = $state<HTMLCanvasElement | null>(null);
  let stage = $state<HTMLDivElement | null>(null);
  let boxWidth = $state(0);
  let boxHeight = $state(0);
  let pageAspect = $state(1 / 1.414);
  let rendering = $state(true);
  let renderToken = 0;

  const page = $derived(store.placement.page);
  const stageWidth = $derived(Math.max(160, Math.min(boxWidth - 32, (boxHeight - 32) * pageAspect)));
  const sigHeightRatio = $derived(store.placement.w * store.signatureAspect * pageAspect);

  $effect(() => {
    const index = page;
    const target = previewCanvas;
    if (!target || store.pageCount === 0) return;
    untrack(() => renderPage(target, index));
  });

  async function renderPage(target: HTMLCanvasElement, index: number) {
    const token = ++renderToken;
    rendering = true;
    const offscreen = document.createElement("canvas");
    try {
      await store.renderPreview(offscreen, index, 1000);
      if (token !== renderToken) return;
      target.width = offscreen.width;
      target.height = offscreen.height;
      target.getContext("2d")?.drawImage(offscreen, 0, 0);
      if (offscreen.height > 0) pageAspect = offscreen.width / offscreen.height;
    } finally {
      if (token === renderToken) rendering = false;
    }
  }

  let dragging = false;
  const grab = { dx: 0, dy: 0 };

  function clampPlacement(x: number, y: number) {
    store.placement = {
      ...store.placement,
      x: Math.max(0, Math.min(x, 1 - store.placement.w)),
      y: Math.max(0, Math.min(y, 1 - sigHeightRatio)),
    };
  }
  function startMove(e: PointerEvent & { currentTarget: HTMLElement }) {
    if (!stage) return;
    dragging = true;
    const r = stage.getBoundingClientRect();
    grab.dx = (e.clientX - r.left) / r.width - store.placement.x;
    grab.dy = (e.clientY - r.top) / r.height - store.placement.y;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent) {
    if (!dragging || !stage) return;
    const r = stage.getBoundingClientRect();
    clampPlacement((e.clientX - r.left) / r.width - grab.dx, (e.clientY - r.top) / r.height - grab.dy);
  }
  function endMove() {
    dragging = false;
  }
  function nudge(e: KeyboardEvent) {
    const step = e.shiftKey ? 0.05 : 0.01;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = moves[e.key];
    if (!delta) return;
    e.preventDefault();
    clampPlacement(store.placement.x + delta[0], store.placement.y + delta[1]);
  }

  function setSize(value: number) {
    store.placement = { ...store.placement, w: value };
    clampPlacement(store.placement.x, store.placement.y);
  }
</script>

{#if !store.hasPdf}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(f) => store.loadFile(f[0]).catch(() => {})}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to sign</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Draw, type or add a picture of your signature, then place it on the page.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard
        title="Signed PDF saved"
        description={`Your signature is on page ${store.result.page}. ${store.result.name} is downloaded.`}
      >
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="esign-pdf" />
      </ResultCard>
    {/if}

    <ToolBar
      label={`${store.fileName}.pdf`}
      meta={`${store.pageCount} ${store.pageCount === 1 ? "page" : "pages"}`}
      onReset={store.isProcessing ? undefined : () => store.reset()}
      resetLabel="Clear"
    >
      {#snippet actions()}
        <div class="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onclick={() => store.setPage(page - 1)}
            disabled={page === 0}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          <span class="min-w-24 px-1 text-center text-body tabular-nums text-foreground" aria-live="polite">
            Page {page + 1} of {store.pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onclick={() => store.setPage(page + 1)}
            disabled={page >= store.pageCount - 1}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      {/snippet}
    </ToolBar>

    {#if !store.signature}
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <p class="text-body text-muted-foreground">Create your signature, then drag it into place on the page.</p>
        <Button variant="outline" size="sm" class="xl:hidden" onclick={() => (workspace.inspectorDrawerOpen = true)}>
          <SignatureIcon />
          Create signature
        </Button>
      </div>
    {:else}
      <p class="text-body text-muted-foreground">
        Drag your signature where it belongs, or select it and use the arrow keys.
      </p>
    {/if}

    <div
      bind:clientWidth={boxWidth}
      bind:clientHeight={boxHeight}
      class="relative flex h-[max(22rem,calc(100dvh-21rem))] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted p-4"
    >
      {#if rendering}
        <div class="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-muted" aria-live="polite">
          <Loader class="size-4 animate-spin text-primary" />
          <span class="text-body text-muted-foreground">Loading page {page + 1}</span>
        </div>
      {/if}
      <div bind:this={stage} class="relative shadow-sm" style:width={`${stageWidth}px`}>
        <canvas
          bind:this={previewCanvas}
          class="block h-auto w-full bg-fixed-light"
          aria-label={`Page ${page + 1} of ${store.fileName}.pdf`}
        ></canvas>
        {#if store.signature}
          <button
            type="button"
            aria-label="Signature. Drag it, or use the arrow keys to move it."
            onpointerdown={startMove}
            onpointermove={move}
            onpointerup={endMove}
            onpointercancel={endMove}
            onkeydown={nudge}
            style:left={`${store.placement.x * 100}%`}
            style:top={`${store.placement.y * 100}%`}
            style:width={`${store.placement.w * 100}%`}
            class="absolute cursor-move touch-none select-none rounded-md outline-2 outline-offset-2 outline-primary outline-dashed focus-visible:outline-solid"
          >
            <img src={store.signature} alt="" draggable="false" class="pointer-events-none block w-full" />
          </button>
        {/if}
      </div>
    </div>
  </div>

  <WorkspaceInspector title="Signature">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Your signature">
        <SegmentedControl name={`${uid}-mode`} options={modes} bind:value={mode} />

        {#if mode === "draw"}
          <canvas
            bind:this={pad}
            width="600"
            height="240"
            onpointerdown={startDraw}
            onpointermove={moveDraw}
            onpointerup={endDraw}
            onpointercancel={endDraw}
            aria-label="Drawing area. Sign with your mouse, finger or pen."
            class="h-40 w-full touch-none rounded-xl border border-border bg-fixed-light"
          ></canvas>
          <div class="flex items-center justify-between gap-2">
            <p class="text-caption text-muted-foreground">Sign with your mouse, finger or pen.</p>
            <Button variant="ghost" onclick={clearPad} disabled={!hasInk && !store.signature}>
              <Eraser />
              Clear
            </Button>
          </div>
        {:else if mode === "type"}
          <label for={`${uid}-name`} class="sr-only">Your name</label>
          <input
            id={`${uid}-name`}
            type="text"
            autocomplete="name"
            bind:value={typedName}
            oninput={() => applyTyped(typedName)}
            placeholder="Type your name"
            class="h-10 w-full rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring"
          />
          {#if typedName.trim()}
            <div class="flex h-24 items-center overflow-hidden rounded-xl border border-border bg-fixed-light px-4">
              <span class="truncate text-heading-sm text-fixed-dark" style:font-family={SCRIPT_FONT} style:font-style="italic">
                {typedName}
              </span>
            </div>
          {/if}
        {:else}
          <Button variant="outline" class="w-full" onclick={() => uploadInput?.click()}>
            <Photo />
            {uploadedName ? "Choose a different image" : "Choose an image"}
          </Button>
          <p class="truncate text-caption text-muted-foreground" title={uploadedName ?? undefined}>
            {uploadedName ?? "A PNG with a clear background looks best."}
          </p>
          <input bind:this={uploadInput} type="file" accept="image/png,image/jpeg,image/webp" class="hidden" onchange={onUpload} />
        {/if}
      </OptionGroup>

      <OptionGroup label="Size" description={store.signature ? undefined : "Create a signature to adjust its size."}>
        <label for={`${uid}-size`} class="sr-only">Signature size</label>
        <input
          id={`${uid}-size`}
          type="range"
          min="0.1"
          max="0.6"
          step="0.01"
          value={store.placement.w}
          disabled={!store.signature}
          oninput={(e) => setSize(e.currentTarget.valueAsNumber)}
          class="h-9 w-full accent-primary disabled:opacity-50"
        />
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Signing page {page + 1}…
        </span>
      {:else if !store.signature}
        <span class="block truncate">Create a signature to continue.</span>
      {:else}
        <span class="block truncate tabular-nums">Your signature goes on page {page + 1}.</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.apply().catch(() => {})} disabled={!store.ready || store.isProcessing}>
      {store.isProcessing ? "Saving…" : "Save signed PDF"}
    </Button>
  </ToolFooter>
{/if}
