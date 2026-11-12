<script lang="ts">
  import type { Crop } from "$lib/image/codec";

  interface Props {
    src: string;
    /** Natural size of the source image, the unit the crop is stored in. */
    width: number;
    height: number;
    crop: Crop;
    /** width / height lock, or undefined for a free box. */
    ratio?: number;
    onchange: (crop: Crop) => void;
  }

  let { src, width, height, crop, ratio, onchange }: Props = $props();

  let frame: HTMLDivElement;
  type Corner = "nw" | "ne" | "sw" | "se";
  type Drag =
    | { kind: "move"; startX: number; startY: number; origin: Crop }
    | { kind: "resize"; corner: Corner; anchorX: number; anchorY: number };
  let drag: Drag | null = null;

  const MIN = $derived(Math.max(16, Math.min(width, height) * 0.05));

  function toSource(e: PointerEvent) {
    const r = frame.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * width, y: ((e.clientY - r.top) / r.height) * height };
  }

  function startMove(e: PointerEvent) {
    const p = toSource(e);
    drag = { kind: "move", startX: p.x, startY: p.y, origin: { ...crop } };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function startResize(e: PointerEvent, corner: Corner) {
    e.stopPropagation();
    const anchorX = corner.includes("w") ? crop.x + crop.width : crop.x;
    const anchorY = corner.includes("n") ? crop.y + crop.height : crop.y;
    drag = { kind: "resize", corner, anchorX, anchorY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onMove(e: PointerEvent) {
    if (!drag) return;
    const p = toSource(e);
    if (drag.kind === "move") {
      const x = Math.min(Math.max(0, drag.origin.x + p.x - drag.startX), width - crop.width);
      const y = Math.min(Math.max(0, drag.origin.y + p.y - drag.startY), height - crop.height);
      onchange({ ...crop, x, y });
      return;
    }
    const { corner, anchorX, anchorY } = drag;
    const goLeft = corner.includes("w");
    const goUp = corner.includes("n");
    const maxW = goLeft ? anchorX : width - anchorX;
    const maxH = goUp ? anchorY : height - anchorY;
    let w = Math.min(Math.max(Math.abs(p.x - anchorX), MIN), maxW);
    let h = Math.min(Math.max(Math.abs(p.y - anchorY), MIN), maxH);
    if (ratio) {
      // Follow the axis the pointer moved further along, then clamp both sides.
      if (w / ratio > h) w = h * ratio;
      else h = w / ratio;
      if (w > maxW) (w = maxW), (h = w / ratio);
      if (h > maxH) (h = maxH), (w = h * ratio);
    }
    onchange({ x: goLeft ? anchorX - w : anchorX, y: goUp ? anchorY - h : anchorY, width: w, height: h });
  }

  const end = () => (drag = null);

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;
  const corners: { id: Corner; cls: string; cursor: string }[] = [
    { id: "nw", cls: "-left-1 -top-1 items-start justify-start", cursor: "cursor-nwse-resize" },
    { id: "ne", cls: "-right-1 -top-1 items-start justify-end", cursor: "cursor-nesw-resize" },
    { id: "sw", cls: "-bottom-1 -left-1 items-end justify-start", cursor: "cursor-nesw-resize" },
    { id: "se", cls: "-bottom-1 -right-1 items-end justify-end", cursor: "cursor-nwse-resize" },
  ];
</script>

<div
  bind:this={frame}
  class="relative mx-auto w-full max-w-full touch-none select-none overflow-hidden rounded-xl border border-border bg-muted"
  style="aspect-ratio: {width} / {height}; max-height: 70vh;"
>
  <img {src} alt="Selected for cropping" draggable="false" class="pointer-events-none absolute inset-0 size-full" />
  <div
    role="group"
    aria-label="Crop area. Drag to move, drag a corner to resize."
    class="absolute cursor-move border border-white shadow-[0_0_0_9999px_rgb(0_0_0/0.5)]"
    style="left: {pct(crop.x, width)}; top: {pct(crop.y, height)}; width: {pct(crop.width, width)}; height: {pct(crop.height, height)};"
    onpointerdown={startMove}
    onpointermove={onMove}
    onpointerup={end}
    onpointercancel={end}
  >
    {#each corners as c (c.id)}
      <span
        role="presentation"
        class="absolute flex size-11 p-1.5 {c.cls} {c.cursor}"
        onpointerdown={(e) => startResize(e, c.id)}
        onpointermove={onMove}
        onpointerup={end}
        onpointercancel={end}
      >
        <span class="size-3.5 rounded-sm border border-foreground/40 bg-white"></span>
      </span>
    {/each}
  </div>
</div>
