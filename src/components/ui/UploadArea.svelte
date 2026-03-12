<script lang="ts">
  import { cn } from "$lib/utils";
  import { UploadCloud } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { fade } from "svelte/transition";
  import { buttonVariants } from "./button";
  import { trackFileUpload } from "$lib/analytics-tracker";
  interface Props {
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    disabled?: boolean;
    files?: File[];
    onFilesSelected?: (files: File[]) => void;
    class?: string;
    icon?: import("svelte").Snippet;
    title?: import("svelte").Snippet;
    description?: import("svelte").Snippet;
    action?: import("svelte").Snippet;
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
  }: Props = $props();

  let isDragging = $state(false);
  let fileInput: HTMLInputElement;

  export const click = () => {
    if (!disabled && fileInput) {
      fileInput.click();
    }
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
    if (target.files) {
      validateAndEmit(Array.from(target.files));
    }
    // Reset input value to allow re-selecting the same file if needed
    target.value = "";
  }

  function validateAndEmit(newFiles: File[]) {
    const validFiles = newFiles.filter((file) => {
      // 1. Check Size
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large.`);
        return false;
      }

      // 2. Check Type (Robust 'accept' parsing)
      if (accept && accept !== "*" && accept.trim() !== "") {
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();

        // Split accept string by comma and trim
        const acceptedTypes = accept
          .split(",")
          .map((t) => t.trim().toLowerCase());

        const isValid = acceptedTypes.some((type) => {
          // A. Extension check (e.g. .jpg)
          if (type.startsWith(".")) {
            return fileName.endsWith(type);
          }
          // B. Wildcard mime check (e.g. image/*)
          if (type.endsWith("/*")) {
            const mainType = type.replace("/*", "");
            return fileType.startsWith(mainType);
          }
          // C. Exact mime check (e.g. image/jpeg)
          return fileType === type;
        });

        if (!isValid) {
          console.warn(
            `File rejected: ${file.name} (Type: ${fileType}) does not match accept: ${accept}`,
          );
          return false;
        }
      }

      return true;
    });

    if (validFiles.length > 0) {
      files = [...files, ...validFiles];
      
      // Track file upload event in Google Analytics
      validFiles.forEach((file) => {
        trackFileUpload(file.name, file.size, file.type || 'unknown');
      });
      
      if (onFilesSelected) onFilesSelected(validFiles);
    }
  }
</script>

<button
  type="button"
  class="group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dotted transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
  {isDragging
    ? 'border-primary bg-primary/5 scale-[1.01] ring-4 ring-primary/10'
    : 'border-border bg-card/75 hover:border-primary/50 hover:bg-card/90'}
  {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  {className}"
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
  ondragover={handleDragOver}
  ondrop={handleDrop}
  onclick={click}
  {disabled}
>
  <div class="flex flex-col items-center justify-center p-8 sm:p-12 md:p-16">
    <div
      class="mb-6 transition-transform duration-300 {isDragging
        ? 'scale-110'
        : 'group-hover:scale-110'}"
    >
      {#if icon}
        {@render icon()}
      {:else}
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner"
        >
          <UploadCloud size={40} strokeWidth={1.5} />
        </div>
      {/if}
    </div>
    <div class="mb-3 text-center">
      {#if title}
        {@render title()}
      {:else}
        <h3 class="text-2xl font-bold tracking-tight text-foreground">
          Upload Files
        </h3>
      {/if}
    </div>
    <div class="mb-8 max-w-xs text-center">
      {#if description}
        {@render description()}
      {:else}
        <p class="text-sm text-muted-foreground">
          Drag & drop your files here, or click to browse.
        </p>
      {/if}
    </div>
    <div class="relative z-10">
      {#if action}
        {@render action()}
      {:else}
        <div
          class={cn(buttonVariants({ variant: "dark" }))}
        >
          Select Files
        </div>
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

  {#if isDragging}
    <div
      class="pointer-events-none absolute inset-0 z-0 bg-primary/5 backdrop-blur-[1px]"
      transition:fade={{ duration: 150 }}
    ></div>
  {/if}
</button>
