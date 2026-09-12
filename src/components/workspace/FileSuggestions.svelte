<script lang="ts">
  import { fileKind, openFilesInTool, suggestTools } from "$lib/runtime/pending-files.svelte";
  import { cn } from "$lib/utils";
  import {
    IconArrowRight as ArrowRight,
    IconFileTypePdf as FilePdf,
    IconPhoto as Photo,
    IconX as X,
  } from "@tabler/icons-svelte";

  let {
    files,
    onclear,
    heading = "Open it in",
    exclude,
    class: className,
  }: {
    files: File[];
    /** Shows the file summary row with a remove button when set. */
    onclear?: () => void;
    heading?: string;
    exclude?: string;
    class?: string;
  } = $props();

  const suggestions = $derived(suggestTools(files).filter((t) => t.slug !== exclude));
  const label = $derived(files.length === 1 ? files[0].name : `${files.length} files`);
  const totalSize = $derived(files.reduce((sum, f) => sum + f.size, 0));
  const kind = $derived(files.length > 0 ? fileKind(files[0]) : "other");

  const formatSize = (bytes: number) =>
    bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
</script>

<div class={cn("flex flex-col gap-3 text-left", className)} aria-live="polite">
  {#if onclear}
  <div class="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5">
    <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
      {#if kind === "image"}<Photo class="size-5" />{:else}<FilePdf class="size-5" />{/if}
    </span>
    <span class="min-w-0 flex-1">
      <span class="block truncate text-body font-medium text-foreground">{label}</span>
      <span class="block text-caption tabular-nums text-muted-foreground">{formatSize(totalSize)} · stays on this device</span>
    </span>
    <button
      type="button"
      onclick={onclear}
      aria-label="Remove file"
      class="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <X class="size-4" />
    </button>
  </div>
  {/if}

  {#if suggestions.length > 0}
    <p class="px-1 text-caption font-medium text-muted-foreground">{heading}</p>
    <ul class="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
      {#each suggestions as tool (tool.slug)}
        <li>
          <button
            type="button"
            onclick={() => openFilesInTool(files, tool.slug)}
            class="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-body text-foreground outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <tool.icon class="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            <span class="flex-1 truncate">{tool.title}</span>
            <ArrowRight class="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
          </button>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="px-1 text-body text-muted-foreground">
      Orbit opens PDFs and images. Choose one of those to see what you can do with it.
    </p>
  {/if}
</div>
