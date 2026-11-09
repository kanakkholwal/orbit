<script lang="ts">
import { Dialog as DialogPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import {
	type DialogMotion,
	type DialogSize,
	type DialogVariant,
	setDialog,
} from "./context";

let {
	children,
	open = $bindable(false),
	motion = "zoom",
	size = "default",
	variant = "default",
	dismissOnBackdrop = true,
}: {
	children?: Snippet;
	open?: boolean;
	motion?: DialogMotion;
	size?: DialogSize;
	variant?: DialogVariant;
	dismissOnBackdrop?: boolean;
} = $props();

let footer = $state<{ children?: Snippet; class?: string }>();

setDialog({
	get motion() {
		return motion;
	},
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
