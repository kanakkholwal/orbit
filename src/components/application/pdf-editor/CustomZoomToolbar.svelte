<script lang="ts">
    import { useZoom } from "@embedpdf/plugin-zoom/svelte";
    import CommandButton from "./CommandButton.svelte";

    interface Props {
        documentId: string;
    }

    let { documentId }: Props = $props();

    const zoom = useZoom(() => documentId);

    const zoomPercentage = $derived(
        Math.round((zoom.state.currentZoomLevel ?? 1) * 100),
    );

    let inputValue = $state("100");

    $effect(() => {
        inputValue = zoomPercentage.toString();
    });

    function handleZoomChange(e: SubmitEvent) {
        e.preventDefault();
        const value = parseFloat(inputValue);
        if (!isNaN(value) && value > 0 && zoom.provides) {
            zoom.provides.requestZoom(value / 100);
        }
    }

    function handleInputChange(e: Event) {
        const target = e.target as HTMLInputElement;
        inputValue = target.value.replace(/[^0-9]/g, "");
    }

    function handleBlur() {
        if (!inputValue || parseFloat(inputValue) <= 0) {
            inputValue = zoomPercentage.toString();
        }
    }
</script>

{#if zoom.provides}
    <div class="flex items-center gap-0.5 rounded-md bg-muted/60 px-1">
        <form onsubmit={handleZoomChange} class="flex items-center">
            <input
                name="zoom"
                type="text"
                inputmode="numeric"
                pattern="\d*"
                class="h-6 w-8 border-0 bg-transparent p-0 text-right text-xs tabular-nums text-foreground outline-none"
                aria-label="Set zoom"
                value={inputValue}
                oninput={handleInputChange}
                onblur={handleBlur}
            />
            <span class="text-xs text-muted-foreground">%</span>
        </form>
        <CommandButton
            commandId="zoom:toggle-menu"
            {documentId}
            itemId="zoom-menu-button"
        />
        <CommandButton commandId="zoom:out" {documentId} />
        <CommandButton commandId="zoom:in" {documentId} />
    </div>
{/if}
