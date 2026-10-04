<script lang="ts">
import { Dialog as DialogPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { type DialogSize, type DialogVariant, setDialog } from "./context";

let {
	children,
	open = $bindable(false),
	size = "md",
	variant = "default",
	dismissOnBackdrop = true,
}: {
	children?: Snippet;
	open?: boolean;
	size?: DialogSize;
	variant?: DialogVariant;
	dismissOnBackdrop?: boolean;
} = $props();

let footer = $state<{ children?: Snippet; class?: string }>();

setDialog({
	get size() {
		return size;
	},
	get variant() {
		return variant;
	},
	get dismissOnBackdrop() {
		return dismissOnBackdrop;
	},
	get footer() {
		return footer;
	},
	set footer(next) {
		footer = next;
	},
});
</script>

<DialogPrimitive.Root bind:open>
	{@render children?.()}
</DialogPrimitive.Root>
