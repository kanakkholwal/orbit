<script lang="ts">
  import { Button } from "$components/ui/button";

  type Props = { value: string; onchange: (value: string) => void };

  let { value, onchange }: Props = $props();

  let canvas = $state<HTMLCanvasElement | null>(null);
  let drawing = false;
  let dirty = $state(false);

  $effect(() => {
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0a0a0a";
  });

  function point(event: PointerEvent) {
    const rect = canvas?.getBoundingClientRect();
    return rect ? { x: event.clientX - rect.left, y: event.clientY - rect.top } : { x: 0, y: 0 };
  }

  function start(event: PointerEvent) {
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    canvas.setPointerCapture(event.pointerId);
    drawing = true;
    const { x, y } = point(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(event: PointerEvent) {
    const ctx = canvas?.getContext("2d");
    if (!drawing || !ctx) return;
    const { x, y } = point(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    dirty = true;
  }

  function clear() {
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    dirty = false;
    onchange("");
  }
</script>

{#if value && !dirty}
  <div class="flex items-center gap-3 rounded-xl border border-border p-2">
    <img src={value} alt="Current signature" class="h-12 flex-1 object-contain object-left" />
    <Button variant="outline" size="sm" onclick={clear}>Redraw</Button>
  </div>
{:else}
  <div class="flex flex-col gap-2">
    <canvas
      bind:this={canvas}
      aria-label="Draw your signature"
      class="h-28 w-full touch-none rounded-xl border border-dashed border-border-strong bg-white"
      onpointerdown={start}
      onpointermove={draw}
      onpointerup={() => (drawing = false)}
      onpointercancel={() => (drawing = false)}
    ></canvas>
    <div class="flex gap-2">
      <Button size="sm" disabled={!dirty} onclick={() => canvas && onchange(canvas.toDataURL("image/png"))}>Use signature</Button>
      <Button variant="ghost" size="sm" disabled={!dirty} onclick={clear}>Clear</Button>
    </div>
  </div>
{/if}
