<script lang="ts">
  import { OptionGroup, SegmentedControl, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { NativeSelect, NativeSelectOption } from "$components/ui/native-select";
  import { Textarea } from "$components/ui/textarea";
  import { IconDownload as Download, IconPhoto as Photo, IconX as X } from "$lib/icons";
  import type QRCodeStyling from "qr-code-styling";
  import type { CornerDotType, CornerSquareType, DotType } from "qr-code-styling";
  import { onDestroy, onMount } from "svelte";

  const DOTS: { value: DotType; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "rounded", label: "Rounded" },
    { value: "dots", label: "Dots" },
    { value: "classy", label: "Classy" },
    { value: "classy-rounded", label: "Classy rounded" },
    { value: "extra-rounded", label: "Extra rounded" },
  ];
  const FRAMES: { value: CornerSquareType; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "extra-rounded", label: "Rounded" },
    { value: "dot", label: "Circle" },
  ];
  const EYES: { value: CornerDotType; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "dot", label: "Circle" },
  ];

  let text = $state("https://");
  let dotType = $state<DotType>("rounded");
  let frameType = $state<CornerSquareType>("extra-rounded");
  let eyeType = $state<CornerDotType>("dot");
  let dotColor = $state("#1d4ed8");
  let dotColor2 = $state("#7c3aed");
  let gradient = $state(true);
  let frameColor = $state("#111827");
  let background = $state("#ffffff");
  let level = $state<"L" | "M" | "Q" | "H">("Q");
  let logo = $state("");
  let logoName = $state("");
  let host = $state<HTMLDivElement | null>(null);
  let qr: QRCodeStyling | null = null;
  let ready = $state(false);

  const SIZE = 1000;

  const options = $derived({
    width: SIZE,
    height: SIZE,
    type: "canvas" as const,
    data: text.trim() || " ",
    margin: 12,
    image: logo || undefined,
    qrOptions: { errorCorrectionLevel: logo ? ("H" as const) : level },
    imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.3, hideBackgroundDots: true },
    dotsOptions: gradient
      ? { type: dotType, gradient: { type: "linear" as const, rotation: Math.PI / 4, colorStops: [{ offset: 0, color: dotColor }, { offset: 1, color: dotColor2 }] } }
      : { type: dotType, color: dotColor },
    cornersSquareOptions: { type: frameType, color: frameColor },
    cornersDotOptions: { type: eyeType, color: frameColor },
    backgroundOptions: { color: background },
  });

  onMount(async () => {
    const { default: QR } = await import("qr-code-styling");
    qr = new QR(options);
    if (host) qr.append(host);
    host?.querySelector("canvas")?.setAttribute("aria-label", "QR code preview");
    ready = true;
  });

  $effect(() => {
    const next = options;
    if (qr && ready) {
      qr.update(next);
      const canvas = host?.querySelector("canvas");
      canvas?.setAttribute("aria-label", "QR code preview");
    }
  });

  onDestroy(() => {
    if (host) host.replaceChildren();
    qr = null;
  });

  function pickLogo(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      logo = String(reader.result);
      logoName = file.name;
    };
    reader.readAsDataURL(file);
  }

  async function save(ext: "png" | "svg" | "webp" | "jpeg") {
    if (!qr) return;
    if (ext === "svg") {
      // The preview is a canvas, so build the vector copy from the same options.
      const { default: QR } = await import("qr-code-styling");
      const vector = new QR({ ...options, type: "svg" });
      await vector.download({ name: "qr-code", extension: "svg" });
      return;
    }
    await qr.download({ name: "qr-code", extension: ext });
  }

  const fileInputId = $props.id();
</script>

<div class="grid gap-4 lg:grid-cols-[1fr_340px]">
  <ToolPanel title="Design">
    <div class="flex flex-col gap-5">
      <OptionGroup label="Content">
        <Textarea bind:value={text} rows={3} aria-label="Text or link for the QR code" placeholder="https://example.com" />
      </OptionGroup>

      <div class="grid gap-5 sm:grid-cols-2">
        <OptionGroup label="Dot style">
          <NativeSelect aria-label="Dot style" bind:value={dotType}>
            {#each DOTS as d (d.value)}
              <NativeSelectOption value={d.value}>{d.label}</NativeSelectOption>
            {/each}
          </NativeSelect>
        </OptionGroup>
        <OptionGroup label="Error correction" description={logo ? "High is used with a logo." : undefined}>
          <SegmentedControl
            name="Error correction"
            size="sm"
            options={[
              { value: "L", label: "L" },
              { value: "M", label: "M" },
              { value: "Q", label: "Q" },
              { value: "H", label: "H" },
            ]}
            value={level}
            onchange={(v) => (level = v as typeof level)}
          />
        </OptionGroup>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <OptionGroup label="Corner frame">
          <SegmentedControl name="Corner frame" size="sm" options={FRAMES} value={frameType} onchange={(v) => (frameType = v as CornerSquareType)} />
        </OptionGroup>
        <OptionGroup label="Corner centre">
          <SegmentedControl name="Corner centre" size="sm" options={EYES} value={eyeType} onchange={(v) => (eyeType = v as CornerDotType)} />
        </OptionGroup>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <OptionGroup label={gradient ? "Dots from" : "Dots"}>
          <input type="color" aria-label="Dot colour" class="h-11 w-full cursor-pointer rounded-lg border border-border bg-transparent p-1" bind:value={dotColor} />
        </OptionGroup>
        <OptionGroup label="Dots to">
          <input type="color" aria-label="Second dot colour" disabled={!gradient} class="h-11 w-full cursor-pointer rounded-lg border border-border bg-transparent p-1 disabled:opacity-40" bind:value={dotColor2} />
        </OptionGroup>
        <OptionGroup label="Corners">
          <input type="color" aria-label="Corner colour" class="h-11 w-full cursor-pointer rounded-lg border border-border bg-transparent p-1" bind:value={frameColor} />
        </OptionGroup>
        <OptionGroup label="Background">
          <input type="color" aria-label="Background colour" class="h-11 w-full cursor-pointer rounded-lg border border-border bg-transparent p-1" bind:value={background} />
        </OptionGroup>
      </div>

      <SegmentedControl
        name="Dot colour mode"
        size="sm"
        options={[
          { value: "solid", label: "Solid colour" },
          { value: "gradient", label: "Gradient" },
        ]}
        value={gradient ? "gradient" : "solid"}
        onchange={(v) => (gradient = v === "gradient")}
      />

      <OptionGroup label="Logo in the centre" description="A small image placed over the middle. Keep it simple so the code still scans.">
        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" onclick={() => document.getElementById(fileInputId)?.click()}>
            <Photo />
            {logo ? "Change logo" : "Add a logo"}
          </Button>
          {#if logo}
            <span class="max-w-40 truncate text-xs text-muted-foreground">{logoName}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              class="max-sm:size-11"
              aria-label="Remove logo"
              onclick={() => {
                logo = "";
                logoName = "";
              }}
            >
              <X class="size-4" />
            </Button>
          {/if}
          <input
            id={fileInputId}
            type="file"
            accept="image/*"
            class="hidden"
            onchange={(e) => {
              const picked = e.currentTarget.files?.[0];
              if (picked) pickLogo(picked);
              e.currentTarget.value = "";
            }}
          />
        </div>
      </OptionGroup>
    </div>
  </ToolPanel>

  <ToolPanel title="Your QR code">
    <div class="flex flex-col items-center gap-4">
      <div bind:this={host} class="aspect-square w-full max-w-72 overflow-hidden rounded-lg border border-border [&>canvas]:size-full"></div>
      <div class="flex flex-wrap justify-center gap-2">
        <Button disabled={!ready || !text.trim()} onclick={() => save("png")}>
          <Download />
          PNG
        </Button>
        <Button variant="outline" disabled={!ready || !text.trim()} onclick={() => save("svg")}>
          <Download />
          SVG
        </Button>
        <Button variant="outline" disabled={!ready || !text.trim()} onclick={() => save("webp")}>
          <Download />
          WebP
        </Button>
      </div>
      <p class="text-center text-xs text-muted-foreground">Test the code with your phone before you print it. Low contrast or a big logo can stop it scanning.</p>
    </div>
  </ToolPanel>
</div>
