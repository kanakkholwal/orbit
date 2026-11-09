<script lang="ts">
import { cn } from "$lib/cn.js";
import { type SpinnerSize, spinnerIcon } from "./variants";

let {
	size = "default",
	label = "Loading",
	class: classProp,
}: { size?: SpinnerSize; label?: string; class?: string } = $props();
</script>

<span role="status" aria-label={label} class={cn("inline-flex", classProp)}>
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class={spinnerIcon({ size })}>
		<circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.8" opacity="0.22" />
		<path d="M14.2 8A6.2 6.2 0 0 0 8 1.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
	</svg>
</span>
