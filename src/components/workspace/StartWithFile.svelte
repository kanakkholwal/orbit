<script lang="ts">
  import { Button } from "$components/ui/button";
  import { registerFileDrop } from "$lib/runtime/file-drop.svelte";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { IconCloudUpload as Upload } from "@tabler/icons-svelte";
  import { onMount } from "svelte";
  import FileSuggestions from "./FileSuggestions.svelte";

  let { class: className }: { class?: string } = $props();

  let files = $state<File[]>([]);
  let dragging = $state(false);
  let dragDepth = 0;
  let fileInput = $state<HTMLInputElement | null>(null);

  onMount(() => {
    if (!appState.isTauri) return;
    return registerFileDrop((dropped) => (files = dropped));
  });
</script>

<section
  aria-label="Start with a file"
  class={cn("panel-card flex flex-col gap-4 p-4 sm:p-5", className)}
  ondragenter={(e) => {
    if (!e.dataTransfer?.types.includes("Files")) return;
    e.preventDefault();
    dragDepth += 1;
    dragging = true;
  }}
  ondragover={(e) => e.dataTransfer?.types.includes("Files") && e.preventDefault()}
  ondragleave={() => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) dragging = false;
  }}
  ondrop={(e) => {
    e.preventDefault();
    dragDepth = 0;
    dragging = false;
    const dropped = Array.from(e.dataTransfer?.files ?? []);
    if (dropped.length > 0) files = dropped;
  }}
>
  <h2 class="text-body-lg font-medium text-foreground">Start with a file</h2>

  {#if files.length > 0}
    <FileSuggestions {files} onclear={() => (files = [])} />
  {:else}
    <div
      class={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-150",
        dragging ? "border-primary bg-primary/5" : "border-border bg-background"
      )}
    >
      <span class="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
        <Upload class="size-5" />
      </span>
      <div>
        <p class="text-body-lg font-medium text-foreground">{dragging ? "Drop it here" : "Drop a PDF or image"}</p>
        <p class="mt-1 text-body text-muted-foreground">We'll show the tools that can open it. Nothing is uploaded.</p>
      </div>
      <Button variant="outline" size="sm" onclick={() => fileInput?.click()}>Choose a file</Button>
      <input
        bind:this={fileInput}
        type="file"
        accept="application/pdf,image/*"
        multiple
        class="hidden"
        onchange={(e) => {
          files = Array.from(e.currentTarget.files ?? []);
          e.currentTarget.value = "";
        }}
      />
    </div>
  {/if}
</section>
