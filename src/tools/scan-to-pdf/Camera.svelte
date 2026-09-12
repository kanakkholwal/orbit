<script lang="ts">
  import { Button } from "$components/ui/button";
  import { cn } from "$lib/utils";
  import {
    IconCameraRotate as SwitchCamera,
    IconLoader2 as Loader,
    IconPhotoPlus as PhotoPlus,
    IconX as X,
  } from "@tabler/icons-svelte";
  import { untrack } from "svelte";

  let {
    captured,
    onCapture,
    onClose,
    onChoosePhotos,
  }: {
    captured: number;
    onCapture: (photo: Blob) => void | Promise<void>;
    onClose: () => void;
    onChoosePhotos: () => void;
  } = $props();

  let video = $state<HTMLVideoElement | null>(null);
  let status = $state<"starting" | "live" | "error">("starting");
  let error = $state("");
  let cameras = $state<MediaDeviceInfo[]>([]);
  let cameraIndex = $state(-1);
  let flash = $state(false);
  let busy = $state(false);

  function describe(e: unknown): string {
    const name = e instanceof DOMException ? e.name : "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      return "Camera access is blocked. Allow it in your browser's site settings, or choose photos instead.";
    }
    if (name === "NotFoundError" || name === "OverconstrainedError") return "No camera was found on this device.";
    if (name === "NotReadableError") return "The camera is being used by another app. Close it and try again.";
    return "The camera couldn't start. You can still choose photos instead.";
  }

  $effect(() => {
    const element = video;
    const index = cameraIndex;
    if (!element) return;

    let stream: MediaStream | null = null;
    let cancelled = false;
    status = "starting";

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new DOMException("Unsupported", "NotSupportedError");
        const deviceId = index >= 0 ? untrack(() => cameras[index]?.deviceId) : undefined;
        const found = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: "environment" } }),
            width: { ideal: 3840 },
            height: { ideal: 2160 },
          },
        });
        if (cancelled) {
          for (const track of found.getTracks()) track.stop();
          return;
        }
        stream = found;
        element.srcObject = found;
        await element.play().catch(() => {});
        status = "live";
        if (cameras.length === 0) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          if (!cancelled) cameras = devices.filter((d) => d.kind === "videoinput");
        }
      } catch (e) {
        if (cancelled) return;
        console.error("[Scan to PDF] Camera failed", e);
        error = describe(e);
        status = "error";
      }
    })();

    return () => {
      cancelled = true;
      if (stream) for (const track of stream.getTracks()) track.stop();
      element.srcObject = null;
    };
  });

  async function capture() {
    if (!video || status !== "live" || busy || video.videoWidth === 0) return;
    busy = true;
    flash = true;
    setTimeout(() => (flash = false), 180);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (blob) await onCapture(blob);
    } finally {
      busy = false;
    }
  }

  function switchCamera() {
    if (cameras.length < 2) return;
    cameraIndex = (cameraIndex + 1) % cameras.length;
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.defaultPrevented) return;
    if (e.key === "Escape") onClose();
    if ((e.key === " " || e.key === "Enter") && e.target === document.body) {
      e.preventDefault();
      capture();
    }
  }}
/>

<section class="flex flex-col overflow-hidden rounded-2xl border border-border bg-card" aria-label="Camera">
  <div class="relative grid aspect-4/3 max-h-[62vh] w-full place-items-center bg-neutral-950 sm:aspect-video">
    <video
      bind:this={video}
      class={cn("h-full w-full object-contain", status !== "live" && "invisible")}
      autoplay
      muted
      playsinline
    ></video>

    {#if status === "starting"}
      <span class="absolute inset-0 grid place-items-center text-body text-white/80">
        <span class="flex items-center gap-2">
          <Loader class="size-5 animate-spin" />
          Starting camera
        </span>
      </span>
    {:else if status === "error"}
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p class="max-w-sm text-pretty text-body text-white/90">{error}</p>
        <Button variant="secondary" onclick={onChoosePhotos}>
          <PhotoPlus />
          Choose photos
        </Button>
      </div>
    {/if}

    <span
      aria-hidden="true"
      class={cn("pointer-events-none absolute inset-0 bg-white transition-opacity duration-150", flash ? "opacity-70" : "opacity-0")}
    ></span>

    {#if captured > 0}
      <span class="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-caption font-medium tabular-nums text-white" aria-live="polite">
        {captured} {captured === 1 ? "page" : "pages"}
      </span>
    {/if}
  </div>

  <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-3 sm:px-4">
    <div class="flex items-center gap-1.5">
      <Button variant="ghost" onclick={onClose}>
        <X />
        {captured > 0 ? "Done" : "Close"}
      </Button>
    </div>

    <button
      type="button"
      onclick={capture}
      disabled={status !== "live" || busy}
      aria-label="Take photo"
      title="Take photo (Space)"
      class="grid size-14 place-items-center rounded-full border-4 border-primary/25 bg-primary text-primary-foreground shadow-sm outline-none transition-transform duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
    >
      <span class="size-6 rounded-full bg-primary-foreground/90"></span>
    </button>

    <div class="flex items-center justify-end">
      {#if cameras.length > 1}
        <Button variant="ghost" size="icon" onclick={switchCamera} aria-label="Switch camera" title="Switch camera">
          <SwitchCamera />
        </Button>
      {/if}
    </div>
  </div>

  <p class="border-t border-border px-4 py-2.5 text-caption text-muted-foreground">
    Lay the page flat in good light and fill the frame. Pages aren't straightened or cropped automatically.
  </p>
</section>
