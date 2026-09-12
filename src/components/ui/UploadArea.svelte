<script lang="ts">
  import { page } from "$app/state";
  import { trackFileUpload } from "$lib/analytics-tracker";
  import { fileDropState, registerFileDrop } from "$lib/runtime/file-drop.svelte";
  import { takePendingFiles } from "$lib/runtime/pending-files.svelte";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { IconCloudUpload as UploadCloud } from "@tabler/icons-svelte";
  import { onMount, type Snippet } from "svelte";
  import { toast } from "svelte-sonner";
  import { buttonVariants } from "./button";

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

  // Tauri intercepts HTML drag/drop, so register this area as a native-drop intake.
  onMount(() => {
    if (disabled) return;
    const handed = takePendingFiles(page.url.pathname);
    if (handed.length > 0) queueMicrotask(() => validateAndEmit(handed));
    if (!appState.isTauri) return;
    return registerFileDrop((dropped) => validateAndEmit(dropped));
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
        toast.error(`File ${file.name} is too large.`);
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
      files = [...files, ...validFiles];
      validFiles.forEach((file) => {
        trackFileUpload(file.name, file.size, file.type || "unknown");
      });
      onFilesSelected?.(validFiles);
    }
  }

  let acceptLabel = $derived.by(() => {
    if (!accept || accept === "*" || accept === "*/*") return "Any file";
    const types = accept.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    if (types.every((t) => t.includes("pdf"))) return "PDF";
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

<button
  type="button"
  class={cn(
    "group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    dragActive ? "border-primary bg-primary/5" : "border-border bg-card hover:border-border-strong",
    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    className
  )}
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
  ondragover={handleDragOver}
  ondrop={handleDrop}
  onclick={click}
  {disabled}
>
  <div class="flex flex-col items-center gap-5 px-6 py-12 text-center sm:py-16">
    <span
      class={cn(
        "grid size-14 place-items-center rounded-2xl transition-[background-color,color,transform] duration-200 ease-craft",
        dragActive ? "scale-105 bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
      )}
    >
      {#if icon}
        {@render icon()}
      {:else}
        <UploadCloud class="size-6" stroke={1.75} />
      {/if}
    </span>

    <div class="flex flex-col items-center gap-1.5">
      {#if dragActive}
        <h3 class="text-heading-sm font-medium text-foreground">Drop to add</h3>
      {:else if title}
        {@render title()}
      {:else}
        <h3 class="text-heading-sm font-medium text-foreground">Drop files here</h3>
      {/if}
      {#if description}
        {@render description()}
      {:else}
        <p class="max-w-sm text-pretty text-body text-muted-foreground">
          Or choose them from your device. Files are opened here and never uploaded.
        </p>
      {/if}
    </div>

    <div class="flex flex-col items-center gap-3">
      {#if action}
        {@render action()}
      {:else}
        <span class={buttonVariants({ variant: "primary", size: "default" })}>
          Choose {multiple ? "files" : "a file"}
        </span>
      {/if}
      {#if hint}
        {@render hint()}
      {:else}
        <p class="text-caption text-muted-foreground">
          {acceptLabel}{maxSize !== Infinity ? ` · up to ${(maxSize / (1024 * 1024)).toFixed(0)} MB each` : ""} · stays on this device
        </p>
      {/if}
    </div>
  </div>

  <input bind:this={fileInput} type="file" {accept} {multiple} class="hidden" onchange={handleInputChange} />
</button>
