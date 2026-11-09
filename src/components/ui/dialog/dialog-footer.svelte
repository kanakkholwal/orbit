<script lang="ts">
import type { Snippet } from "svelte";
import { getDialog } from "./context";

let { children, class: classProp }: { children?: Snippet; class?: string } = $props();

const dialog = getDialog();

// Rendered by DialogContent in the frame rim, so nothing is emitted here.
$effect(() => {
	dialog.footer = { children, class: classProp };
	return () => {
		dialog.footer = undefined;
	};
});
</script>
