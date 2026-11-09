const nav = typeof navigator === "undefined" ? undefined : (navigator as Navigator & { deviceMemory?: number });

/** Phones and low-memory devices, where a few large canvases are enough to crash the tab. */
export const constrained: boolean =
  !!nav &&
  (/Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent) ||
    (nav.maxTouchPoints > 1 && /Mac/i.test(nav.platform)) ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4));

/** iOS Safari refuses canvases above about 16.7M pixels and kills the tab near 224MB in total. */
export const MAX_CANVAS_PIXELS = constrained ? 4_000_000 : 16_000_000;
export const MAX_CANVAS_SIDE = constrained ? 4096 : 8192;

/** Scale to render a widthPt x heightPt page at, lowered so the canvas fits the device's budget. */
export function safeScale(widthPt: number, heightPt: number, wanted: number): number {
  let scale = Math.min(wanted, MAX_CANVAS_SIDE / widthPt, MAX_CANVAS_SIDE / heightPt);
  const pixels = widthPt * heightPt * scale * scale;
  if (pixels > MAX_CANVAS_PIXELS) scale *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);
  return Math.max(scale, 0.1);
}

/** devicePixelRatio, capped so thumbnails on 3x phones do not cost nine times the memory. */
export function outputRatio(): number {
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  return Math.min(dpr, constrained ? 1.5 : 2);
}

/** Zeroing the size is what makes Safari free the backing store. */
export function releaseCanvas(...canvases: (HTMLCanvasElement | OffscreenCanvas | null | undefined)[]) {
  for (const canvas of canvases) {
    if (canvas) canvas.width = canvas.height = 0;
  }
}

export const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Runs fn over items with at most `limit` in flight; one at a time on constrained devices. */
export async function mapLimit<T, R>(items: T[], fn: (item: T, index: number) => Promise<R>, limit = constrained ? 1 : 3): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

/** Lets at most `max` async jobs run at once; the rest wait their turn. */
export function createLimiter(max: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  return async <T>(job: () => Promise<T>): Promise<T> => {
    if (active >= max) await new Promise<void>((resolve) => queue.push(resolve));
    active++;
    try {
      return await job();
    } finally {
      active--;
      queue.shift()?.();
    }
  };
}

/** Thumbnails and previews share this so a 300 page file cannot start 300 renders at once. */
export const renderLimit = createLimiter(constrained ? 1 : 3);

/** Files above this are likely to exhaust memory on a phone. */
export const LARGE_FILE_BYTES = constrained ? 60 * 1024 * 1024 : 400 * 1024 * 1024;
