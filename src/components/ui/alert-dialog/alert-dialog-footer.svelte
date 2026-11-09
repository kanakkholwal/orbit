<script lang="ts">
import type { Snippet } from "svelte";
import { getAlertDialog } from "./context";

let { children, class: classProp }: { children?: Snippet; class?: string } = $props();

const dialog = getAlertDialog();

// Rendered by AlertDialogContent in the frame rim, so nothing is emitted here.
$effect(() => {
	dialog.footer = { children, class: classProp };
	return () => {
		dialog.footer = undefined;
	};
});
</script>
