<script lang="ts">
  import { trackFileUpload } from "$lib/analytics-tracker";
  import { fileDropState, registerFileDrop } from "$lib/runtime/file-drop.svelte";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { UploadCloud } from "@lucide/svelte";
  import { onMount, type Snippet } from "svelte";
  import { toast } from "svelte-sonner";
  import { fade } from "svelte/transition";
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

  // On desktop, Tauri intercepts HTML drag/drop — register this area as the
  // active native-drop intake target and mirror the native drag state.
  onMount(() => {
    if (!appState.isTauri || disabled) return;
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

  let acceptLabel = $derived(
    accept === "application/pdf"
      ? "PDF only"
      : accept
          .split(",")
          .map((t) => t.trim().replace("application/", "").replace(".", ""))
          .filter(Boolean)
          .join(" · ")
          .toUpperCase()
  );
</script>

<button
  type="button"
  class={cn(
    "group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-md border border-dashed transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
    dragActive
      ? "border-primary/60 bg-primary/5"
      : "border-border/70 bg-muted/20 hover:border-primary/40 hover:bg-muted/30",
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
  <div class="relative z-5 flex flex-col items-center gap-5 px-6 py-12 sm:py-16 md:py-20">
    <div class="flex flex-col items-center gap-3">
      <span
        class={cn(
          "inline-flex size-12 items-center justify-center rounded-sm transition-colors",
          dragActive
            ? "bg-primary/15 text-primary"
            : "bg-muted/60 text-foreground/80 group-hover:bg-primary/10 group-hover:text-primary"
        )}
      >
        {#if icon}
          {@render icon()}
        {:else}
          <UploadCloud class="size-5" strokeWidth={1.5} />
        {/if}
      </span>
      <span
        class={cn(
          "font-mono text-[10px] font-medium uppercase tracking-[0.2em] transition-colors",
          dragActive ? "text-primary" : "text-muted-foreground/70"
        )}
      >
        {dragActive ? "Drop to upload" : "Upload"} · {acceptLabel}
      </span>
    </div>

    <div class="flex flex-col items-center gap-2 text-center">
      {#if title}
        {@render title()}
      {:else}
        <h3 class="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
          Drop files here
        </h3>
      {/if}
      {#if description}
        {@render description()}
      {:else}
        <p class="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Drag and drop, paste, or click to browse from your device. Files stay
          on this machine.
        </p>
      {/if}
    </div>

    <div class="relative z-10 flex flex-col items-center gap-3">
      {#if action}
        {@render action()}
      {:else}
        <span
          class={cn(
            buttonVariants({ variant: "default", size: "default" }),
            "rounded-sm bg-primary px-5 text-primary-foreground shadow-sm shadow-primary/15 hover:bg-primary/90"
          )}
        >
          Select files
        </span>
      {/if}
      {#if hint}
        {@render hint()}
      {:else if maxSize !== Infinity}
        <p
          class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60"
        >
          Max {(maxSize / (1024 * 1024)).toFixed(0)} MB per file
        </p>
      {/if}
    </div>
  </div>

  <input
    bind:this={fileInput}
    type="file"
    {accept}
    {multiple}
    class="hidden"
    onchange={handleInputChange}
  />

  {#if dragActive}
    <div
      class="pointer-events-none absolute inset-0 z-0 bg-primary/5"
      transition:fade={{ duration: 150 }}
    ></div>
  {/if}
</button>
