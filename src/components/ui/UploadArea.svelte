<script lang="ts">
  import { page } from "$app/state";
  import { trackFileUpload } from "$lib/analytics-tracker";
  import { LARGE_FILE_BYTES } from "$lib/device-limits";
  import { formatCap } from "$lib/device-profile.svelte";
  import { warmEnginesForPath } from "$lib/engine-warmup";
  import { fileDropState, registerFileDrop } from "$lib/runtime/file-drop.svelte";
  import { takePendingFiles } from "$lib/runtime/pending-files.svelte";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { IconCamera as Camera, IconCloudUpload as UploadCloud } from "$lib/icons";
  import { onMount, type Snippet } from "svelte";
  import { toast } from "svelte-sonner";
  import { Button, buttonVariants } from "./button";

  interface Props {
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    disabled?: boolean;
    files?: File[];
    onFilesSelected?: (files: File[]) => void;
    class?: string;
    icon?: Snippet;
    title?: Snippet;
    description?: Snippet;
    action?: Snippet;
    hint?: Snippet;
  }

  let {
    accept = "application/pdf",
    multiple = true,
    maxSize = Infinity,
    disabled = false,
    files = $bindable([]),
    onFilesSelected,
    class: className = "",
    icon,
    title,
    description,
    action,
    hint,
  }: Props = $props();

  let isDragging = $state(false);
  let fileInput: HTMLInputElement;
  let cameraInput = $state<HTMLInputElement | null>(null);
  const pasteKey = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ V" : "Ctrl V";
  /** A camera button only makes sense for photo tools. */
  const wantsCamera = $derived(/image\//.test(accept) && !disabled);

  // Tauri intercepts HTML drag/drop, so register this area as a native-drop intake.
  onMount(() => {
    if (disabled) return;
    const handed = takePendingFiles(page.url.pathname);
    if (handed.length > 0) queueMicrotask(() => validateAndEmit(handed));
    // Pasted screenshots and copied files go through the same checks as dropped ones.
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable]")) return;
      const pasted = Array.from(event.clipboardData?.files ?? []);
      if (pasted.length > 0) validateAndEmit(multiple ? pasted : pasted.slice(0, 1));
    };
    window.addEventListener("paste", onPaste);
    const stopNative = appState.isTauri ? registerFileDrop((dropped) => validateAndEmit(dropped)) : undefined;
    return () => {
      window.removeEventListener("paste", onPaste);
      stopNative?.();
    };
  });

  let dragActive = $derived(
    isDragging || (appState.isTauri && fileDropState.isDragging)
  );

  export const click = () => {
    if (!disabled && fileInput) fileInput.click();
  };

  function handleDragEnter(e: DragEvent) {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
  }
  function handleDragLeave(e: DragEvent) {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging = false;
  }
  function handleDragOver(e: DragEvent) {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
  }
  function handleDrop(e: DragEvent) {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging = false;
    if (e.dataTransfer?.files) {
      validateAndEmit(Array.from(e.dataTransfer.files));
    }
  }
  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files) validateAndEmit(Array.from(target.files));
    target.value = "";
  }

  function validateAndEmit(newFiles: File[]) {
    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSize) {
        toast.error("File too large for this device", { description: `${file.name} is over ${formatCap(maxSize)}. Try a smaller file.` });
        return false;
      }
      if (accept && accept !== "*" && accept.trim() !== "") {
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();
        const acceptedTypes = accept
          .split(",")
          .map((t) => t.trim().toLowerCase());
        const isValid = acceptedTypes.some((type) => {
          if (type.startsWith(".")) return fileName.endsWith(type);
          if (type.endsWith("/*"))
            return fileType.startsWith(type.replace("/*", ""));
          return fileType === type;
        });
        if (!isValid) {
          console.warn(
            `File rejected: ${file.name} (Type: ${fileType}) does not match accept: ${accept}`
          );
          return false;
        }
      }
      return true;
    });
    if (validFiles.length > 0) {
      if (validFiles.some((f) => f.size > LARGE_FILE_BYTES))
        toast.warning("This file is large for this device. If the page slows down or reloads, try a smaller file.");
      files = [...files, ...validFiles];
      validFiles.forEach((file) => {
        trackFileUpload(file.name, file.size, file.type || "unknown");
      });
      // A chosen file is intent enough to pull the tool's remote engine down early.
      warmEnginesForPath(page.url.pathname);
      onFilesSelected?.(validFiles);
    }
  }

  let acceptLabel = $derived.by(() => {
    if (!accept || accept === "*" || accept === "*/*") return "Any file";
    const types = accept.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    if (types.every((t) => t.includes("pdf"))) return "PDF";
    const names = { image: "Images", video: "Video", audio: "Audio" } as const;
    const kinds = (Object.keys(names) as (keyof typeof names)[]).filter((k) => types.includes(`${k}/*`));
    if (kinds.length > 0) return kinds.map((k) => names[k]).join(", ");
    const imageRe = /^image\/|\.(png|jpe?g|gif|bmp|tiff?|webp|hei[cf]|ico|psd|jxr|jp2|jpx)$/;
    if (types.every((t) => imageRe.test(t))) return "Images";
    const exts = [
      ...new Set(
        types
          .map((t) => (t.includes("/") ? t.split("/")[1] : t.replace(".", "")))
          .filter(Boolean)
      ),
    ];
    return exts.length > 3
      ? `${exts.slice(0, 3).map((e) => e.toUpperCase()).join(", ")} +${exts.length - 3}`
      : exts.map((e) => e.toUpperCase()).join(", ");
  });
</script>

<div class={cn("flex w-full max-w-5xl flex-col gap-3", className)}>
  <div class="rise" style="--i:1">
    <button
      type="button"
      class={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-2xl border bg-background p-1 text-left outline-none transition-[border-color,box-shadow] duration-(--duration-base) ease-(--ease-ui-out) focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
        dragActive ? "border-primary shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_14%,transparent)]" : "border-border hover:border-border-strong",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
      ondragenter={handleDragEnter}
      ondragleave={handleDragLeave}
      ondragover={handleDragOver}
      ondrop={handleDrop}
      onclick={click}
      {disabled}
    >
      <div
        class={cn(
          "relative flex w-full flex-col items-center gap-5 rounded-xl px-6 py-14 text-center transition-colors duration-(--duration-base) sm:py-20",
          "bg-card bg-[radial-gradient(color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px)] bg-size-[18px_18px]",
          dragActive && "bg-primary/[0.06]"
        )}
      >
        <!-- Two ghost cards fan out behind the icon on hover or while dragging. -->
        <span class="relative grid size-16 place-items-center" aria-hidden="true">
          <span
            class={cn(
              "absolute size-12 rounded-xl border border-border bg-background transition-transform duration-(--duration-slow) ease-(--ease-ui-out) motion-reduce:transition-none",
              dragActive ? "-translate-x-5 -rotate-12" : "-rotate-6 group-hover:-translate-x-3 group-hover:-rotate-12"
            )}
          ></span>
          <span
            class={cn(
              "absolute size-12 rounded-xl border border-border bg-background transition-transform duration-(--duration-slow) ease-(--ease-ui-out) motion-reduce:transition-none",
              dragActive ? "translate-x-5 rotate-12" : "rotate-6 group-hover:translate-x-3 group-hover:rotate-12"
            )}
          ></span>
          <span
            class={cn(
              "relative grid size-14 place-items-center rounded-xl border border-border bg-background text-primary shadow-(--surface-shadow) transition-transform duration-(--duration-slow) ease-(--ease-ui-out) motion-reduce:transition-none",
              dragActive ? "-translate-y-1 scale-105 border-primary" : "group-hover:-translate-y-1"
            )}
          >
            {#if icon}
              {@render icon()}
            {:else}
              <UploadCloud class="size-6" />
            {/if}
          </span>
        </span>

        <div class="flex flex-col items-center gap-1.5">
          {#if dragActive}
            <h3 class="text-xl font-medium text-foreground sm:text-2xl">Drop to add</h3>
          {:else if title}
            {@render title()}
          {:else}
            <h3 class="text-xl font-medium text-foreground sm:text-2xl">Drop {multiple ? "files" : "a file"} here</h3>
          {/if}
          {#if description}
            {@render description()}
          {:else}
            <p class="max-w-sm text-pretty text-sm text-muted-foreground">
              Or choose {multiple ? "them" : "it"} from your device. Nothing is uploaded.
            </p>
          {/if}
        </div>

        <div class="flex flex-col items-center gap-3">
          {#if action}
            {@render action()}
          {:else}
            <span class={buttonVariants({ variant: "default", size: "default" })}>
              Choose {multiple ? "files" : "a file"}
            </span>
          {/if}
          {#if hint}
            {@render hint()}
          {:else}
            <p class="text-xs text-muted-foreground">
              {acceptLabel}{maxSize !== Infinity ? ` · up to ${formatCap(maxSize)} each` : ""}
              <span class="hidden pointer-fine:inline"> · or paste with {pasteKey}</span>
            </p>
          {/if}
        </div>
      </div>

      <input bind:this={fileInput} type="file" {accept} {multiple} class="hidden" onchange={handleInputChange} />
    </button>
  </div>

  {#if wantsCamera}
    <div class="rise flex justify-center pointer-fine:hidden" style="--i:2">
      <Button variant="outline" size="sm" class="rounded-full" {disabled} onclick={() => cameraInput?.click()}>
        <Camera />
        Take a photo
      </Button>
      <input bind:this={cameraInput} type="file" accept="image/*" capture="environment" class="hidden" onchange={handleInputChange} />
    </div>
  {/if}
</div>
