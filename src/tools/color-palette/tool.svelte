<script lang="ts">
  import { OptionGroup, SegmentedControl, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { CopyButton } from "$components/ui/copy-button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { IconRefresh as Refresh } from "$lib/icons";
  import { decode, render } from "$lib/image/codec";
  import { onDestroy } from "svelte";

  let url = $state("");
  let colors = $state<string[]>([]);
  let count = $state(6);
  let busy = $state(false);
  let error = $state("");
  let pixels: Uint8ClampedArray | null = null;

  onDestroy(() => url && URL.revokeObjectURL(url));

  const hex = (r: number, g: number, b: number) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

  /** Median cut: split the colour box with the widest range until there are enough boxes. */
  function quantize(data: Uint8ClampedArray, want: number): string[] {
    const px: number[][] = [];
    for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 200) px.push([data[i], data[i + 1], data[i + 2]]);
    if (px.length === 0) return [];
    const boxes = [px];
    while (boxes.length < want) {
      boxes.sort((a, b) => b.length - a.length);
      const box = boxes.shift()!;
      if (box.length < 2) {
        boxes.push(box);
        break;
      }
      const range = [0, 1, 2].map((c) => Math.max(...box.map((p) => p[c])) - Math.min(...box.map((p) => p[c])));
      const ch = range.indexOf(Math.max(...range));
      box.sort((a, b) => a[ch] - b[ch]);
      const mid = box.length >> 1;
      boxes.push(box.slice(0, mid), box.slice(mid));
    }
    return boxes
      .sort((a, b) => b.length - a.length)
      .map((box) => {
        const sum = box.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]);
        return hex(...(sum.map((v) => Math.round(v / box.length)) as [number, number, number]));
      });
  }

  async function load(file: File) {
    busy = true;
    error = "";
    try {
      const bmp = await decode(file);
      const side = 96;
      const surface = render(bmp, { width: side, height: Math.max(1, Math.round((side * bmp.height) / bmp.width)) });
      bmp.close();
      const ctx = surface.getContext("2d") as CanvasRenderingContext2D;
      pixels = ctx.getImageData(0, 0, surface.width, surface.height).data;
      colors = quantize(pixels, count);
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(file);
    } catch {
      error = "This image could not be read.";
    } finally {
      busy = false;
    }
  }

  const ink = (c: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#111111" : "#ffffff";
  };
</script>

{#if !url}
  <div class="flex flex-col gap-3">
    <UploadArea accept="image/*,.heic,.heif" onFilesSelected={(files) => void load(files[0])}>
      {#snippet title()}
        <h3 class="text-2xl font-medium text-foreground">Choose an image</h3>
      {/snippet}
      {#snippet description()}
        <p class="max-w-sm text-pretty text-sm text-muted-foreground">The main colours are found on your device. The image is never uploaded.</p>
      {/snippet}
    </UploadArea>
    {#if error}<p role="alert" class="text-sm text-destructive-strong">{error}</p>{/if}
  </div>
{:else}
  <div class="grid gap-4 lg:grid-cols-[1fr_320px]">
    <ToolPanel title="Colours">
      <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {#each colors as c (c)}
          <li class="flex flex-col overflow-hidden rounded-xl border border-border">
            <div class="flex h-24 items-end p-2 text-xs font-medium" style="background:{c};color:{ink(c)}">{c.toUpperCase()}</div>
            <div class="p-1.5"><CopyButton text={c.toUpperCase()} label="Copy" class="w-full" /></div>
          </li>
        {/each}
      </ul>
    </ToolPanel>
    <ToolPanel title="Image">
      <div class="flex flex-col gap-4">
        <img src={url} alt="Source of the colours" class="max-h-64 w-full rounded-lg border border-border object-contain" />
        <OptionGroup label="Number of colours">
          <SegmentedControl
            name="Number of colours"
            size="sm"
            options={[3, 4, 6, 8, 12].map((n) => ({ value: String(n), label: String(n) }))}
            value={String(count)}
            onchange={(v) => {
              count = Number(v);
              if (pixels) colors = quantize(pixels, count);
            }}
          />
        </OptionGroup>
        <Button variant="outline" disabled={busy} onclick={() => ((url = ""), (colors = []))}>
          <Refresh />
          Choose another image
        </Button>
      </div>
    </ToolPanel>
  </div>
{/if}
