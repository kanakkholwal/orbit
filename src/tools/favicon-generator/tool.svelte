<script lang="ts">
  import { ResultCard, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { IconDownload as Download, IconRefresh as Refresh } from "$lib/icons";
  import { createSurface, decode, render, toBlob } from "$lib/image/codec";
  import { releaseCanvas } from "$lib/device-limits";
  import { onDestroy } from "svelte";

  const SIZES = [
    { name: "favicon-16x16.png", size: 16 },
    { name: "favicon-32x32.png", size: 32 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "android-chrome-192x192.png", size: 192 },
    { name: "android-chrome-512x512.png", size: 512 },
  ];
  const ICO_SIZES = [16, 32, 48];
  const HEAD = `<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">`;

  let name = $state("");
  let previewUrl = $state("");
  let zip = $state.raw<Blob | null>(null);
  let busy = $state(false);
  let error = $state("");

  onDestroy(() => previewUrl && URL.revokeObjectURL(previewUrl));

  async function square(bmp: ImageBitmap, size: number) {
    const side = Math.min(bmp.width, bmp.height);
    const crop = { x: (bmp.width - side) / 2, y: (bmp.height - side) / 2, width: side, height: side };
    const surface = render(bmp, { crop, width: size, height: size });
    const blob = await toBlob(surface, "png");
    releaseCanvas(surface as HTMLCanvasElement);
    return new Uint8Array(await blob.arrayBuffer());
  }

  /** An ICO file that holds PNG images, which every current browser reads. */
  function ico(images: { size: number; data: Uint8Array }[]) {
    const head = 6 + images.length * 16;
    const out = new Uint8Array(head + images.reduce((n, i) => n + i.data.length, 0));
    const view = new DataView(out.buffer);
    view.setUint16(2, 1, true);
    view.setUint16(4, images.length, true);
    let offset = head;
    images.forEach((img, i) => {
      const at = 6 + i * 16;
      out[at] = img.size;
      out[at + 1] = img.size;
      view.setUint16(at + 4, 1, true);
      view.setUint16(at + 6, 32, true);
      view.setUint32(at + 8, img.data.length, true);
      view.setUint32(at + 12, offset, true);
      out.set(img.data, offset);
      offset += img.data.length;
    });
    return out;
  }

  async function make(file: File) {
    busy = true;
    error = "";
    zip = null;
    try {
      const bmp = await decode(file);
      const { default: JSZip } = await import("jszip");
      const archive = new JSZip();
      const small = new Map<number, Uint8Array>();
      for (const size of ICO_SIZES) small.set(size, await square(bmp, size));
      archive.file("favicon.ico", ico(ICO_SIZES.map((size) => ({ size, data: small.get(size)! }))));
      for (const s of SIZES) archive.file(s.name, small.get(s.size) ?? (await square(bmp, s.size)));
      archive.file("head-snippet.html", HEAD + "\n");
      bmp.close();
      zip = await archive.generateAsync({ type: "blob" });
      name = file.name;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = URL.createObjectURL(file);
    } catch {
      error = "This image could not be read. Try a PNG, JPG or WebP.";
    } finally {
      busy = false;
    }
  }

  function download() {
    if (!zip) return;
    const url = URL.createObjectURL(zip);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favicons.zip";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
</script>

{#if !zip && !busy}
  <div class="flex flex-col gap-3">
    <UploadArea accept="image/*,.heic,.heif" onFilesSelected={(files) => void make(files[0])}>
      {#snippet title()}
        <h3 class="text-2xl font-medium text-foreground">Choose a logo or image</h3>
      {/snippet}
      {#snippet description()}
        <p class="max-w-sm text-pretty text-sm text-muted-foreground">Use a square image of at least 512 x 512 pixels. A non-square one is cropped to the centre.</p>
      {/snippet}
    </UploadArea>
    {#if error}<p role="alert" class="text-sm text-destructive-strong">{error}</p>{/if}
  </div>
{:else if busy}
  <p class="py-16 text-center text-sm text-muted-foreground" role="status">Making your icons…</p>
{:else}
  <div class="flex flex-col gap-4">
    <ResultCard title="Icons ready" description={`${SIZES.length + 1} files made from ${name}.`}>
      {#snippet actions()}
        <Button variant="outline" onclick={() => (zip = null)}>
          <Refresh />
          Start over
        </Button>
        <Button onclick={download}>
          <Download />
          Download ZIP
        </Button>
      {/snippet}
    </ResultCard>
    <ToolPanel title="Add this to your page">
      <div class="flex flex-col gap-4">
        {#if previewUrl}
          <img src={previewUrl} alt="Source of the icons" class="size-16 rounded-lg border border-border object-cover" />
        {/if}
        <pre class="overflow-x-auto rounded-lg border border-border bg-muted p-3 text-xs"><code>{HEAD}</code></pre>
        <p class="text-sm text-muted-foreground">In the ZIP: favicon.ico (16, 32, 48), 16 and 32 pixel PNGs, an Apple touch icon, and Android icons at 192 and 512.</p>
      </div>
    </ToolPanel>
  </div>
{/if}
