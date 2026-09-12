<script lang="ts">
  import { useZoom } from "@embedpdf/plugin-zoom/svelte";
  import CommandButton from "./CommandButton.svelte";

  interface Props {
    documentId: string;
  }

  let { documentId }: Props = $props();

  const zoom = useZoom(() => documentId);
  const zoomPercentage = $derived(Math.round((zoom.state.currentZoomLevel ?? 1) * 100));

  let inputValue = $state("100");

  $effect(() => {
    inputValue = zoomPercentage.toString();
  });

  function applyZoom(e: SubmitEvent) {
    e.preventDefault();
    const value = Number.parseFloat(inputValue);
    if (!Number.isNaN(value) && value > 0) zoom.provides?.requestZoom(value / 100);
  }
</script>

{#if zoom.provides}
  <div class="flex items-center gap-1">
    <form
      onsubmit={applyZoom}
      class="flex h-9 items-center rounded-lg border border-border bg-background pl-2.5 pr-1 transition-colors duration-150 focus-within:border-ring"
    >
      <input
        name="zoom"
        type="text"
        inputmode="numeric"
        class="w-9 bg-transparent text-right text-body tabular-nums text-foreground outline-none"
        aria-label="Zoom percentage"
        value={inputValue}
        oninput={(e) => (inputValue = e.currentTarget.value.replace(/[^0-9]/g, ""))}
        onblur={() => {
          if (!inputValue || Number.parseFloat(inputValue) <= 0) inputValue = zoomPercentage.toString();
        }}
      />
      <span class="pl-0.5 text-body text-muted-foreground">%</span>
      <CommandButton commandId="zoom:toggle-menu" {documentId} itemId="zoom-menu-button" class="-mr-0.5 h-8 w-7" />
    </form>
    <CommandButton commandId="zoom:out" {documentId} />
    <CommandButton commandId="zoom:in" {documentId} />
  </div>
{/if}
