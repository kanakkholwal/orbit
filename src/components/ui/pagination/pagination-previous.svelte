<script lang="ts">
import type { HTMLButtonAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type PaginationSize, pagination } from "./variants";

let {
	size = "md",
	class: classProp,
	...rest
}: { size?: PaginationSize; class?: string } & HTMLButtonAttributes = $props();

const s = $derived(pagination({ size }));
</script>

<button
	{...rest}
	type="button"
	data-slot="pagination-previous"
	aria-label="Previous page"
	class={cn(s.link(), s.nav(), classProp)}
>
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path d="M10 4 6 8l4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
</button>
