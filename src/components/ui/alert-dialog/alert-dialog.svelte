<script lang="ts">
import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import type { DialogVariant } from "$components/ui/dialog/context.js";
import { setAlertDialog } from "./context";

let {
	children,
	open = $bindable(false),
	variant = "default",
}: { children?: Snippet; open?: boolean; variant?: DialogVariant } = $props();

let footer = $state<{ children?: Snippet; class?: string }>();

setAlertDialog({
	get variant() {
		return variant;
	},
	get footer() {
		return footer;
	},
	set footer(next) {
		footer = next;
	},
});
</script>

<AlertDialogPrimitive.Root bind:open>
	{@render children?.()}
</AlertDialogPrimitive.Root>
