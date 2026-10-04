<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLButtonAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type PaginationSize, pagination } from "./variants";

let {
	children,
	active = false,
	size = "md",
	class: classProp,
	...rest
}: {
	children?: Snippet;
	active?: boolean;
	size?: PaginationSize;
	class?: string;
} & HTMLButtonAttributes = $props();
</script>

<button
	{...rest}
	type="button"
	data-slot="pagination-link"
	aria-current={active ? "page" : undefined}
	class={cn(pagination({ size }).link(), classProp)}
>
	{@render children?.()}
</button>
