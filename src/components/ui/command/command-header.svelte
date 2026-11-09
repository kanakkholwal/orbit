<script lang="ts">
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { getCommandDialogState } from "./context";

let { children, class: classProp }: { children?: Snippet; class?: string } = $props();

const dialogState = getCommandDialogState();

// Rendered by CommandDialog in the rim above the card, so nothing is emitted here.
$effect(() => {
	if (!dialogState) return;
	dialogState.header = { children, class: classProp };
	return () => {
		dialogState.header = undefined;
	};
});
</script>

{#if !dialogState}
	<div
		data-slot="command-header"
		class={cn("flex items-center justify-between gap-3 px-3.5 pt-2.5 pb-1.5", classProp)}
	>
		<p class="font-medium text-foreground text-sm">{@render children?.()}</p>
	</div>
{/if}
