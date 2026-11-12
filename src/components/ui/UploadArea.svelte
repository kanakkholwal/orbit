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
  import { getTool } from "$tools/list";
  import ToolHeader from "$components/tool/ToolHeader.svelte";
  import { Badge } from "./badge";
  import { IconCloudUpload as UploadCloud } from "$lib/icons";
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

  const tool = $derived(getTool(page.url.pathname.split("/")[2] ?? "") ?? null);
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

<div class="mx-auto flex w-full max-w-3xl flex-col gap-8 py-4 sm:py-10">
  {#if tool}
    <ToolHeader {tool} />
  {/if}

  <div class="rise" style="--i:1">
    <button
  type="button"
  class={cn(
    "group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-background p-1 outline-none transition-colors duration-(--duration-base) focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    dragActive ? "border-primary" : "hover:border-border-strong",
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
  <div
    class={cn(
      "flex w-full flex-col items-center gap-5 rounded-[11px] border-2 border-dashed px-6 py-12 text-center transition-colors duration-(--duration-base) sm:py-16",
      dragActive ? "border-primary bg-primary/5" : "border-border-strong bg-card"
    )}
  >
    <span
      class={cn(
        "grid size-14 place-items-center rounded-2xl transition-[background-color,color,transform] duration-(--duration-base) ease-(--ease-ui-out)",
        dragActive ? "scale-105 bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
      )}
    >
      {#if icon}
        {@render icon()}
      {:else}
        <UploadCloud class="size-6" />
      {/if}
    </span>

    <div class="flex flex-col items-center gap-1.5">
      {#if dragActive}
        <h3 class="text-2xl font-medium text-foreground">Drop to add</h3>
      {:else if title}
        {@render title()}
      {:else}
        <h3 class="text-2xl font-medium text-foreground">Drop files here</h3>
      {/if}
      {#if description}
        {@render description()}
      {:else}
        <p class="max-w-sm text-pretty text-sm text-muted-foreground">
          Or choose them from your device. Files are opened here and never uploaded.
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
      {/if}
    </div>
  </div>

  <input bind:this={fileInput} type="file" {accept} {multiple} class="hidden" onchange={handleInputChange} />
</button>
  </div>

  <ul class="rise flex flex-wrap items-center justify-center gap-2" style="--i:2">
    <li><Badge variant="secondary">{acceptLabel}</Badge></li>
    <li><Badge variant="secondary">Stays on this device</Badge></li>
    <li><Badge variant="secondary">No account</Badge></li>
    {#if maxSize !== Infinity}
      <li><Badge variant="secondary">Up to {formatCap(maxSize)} each</Badge></li>
    {/if}
  </ul>
</div>
