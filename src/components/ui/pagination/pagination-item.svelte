<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLLiAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & HTMLLiAttributes = $props();
</script>

<li {...rest} data-slot="pagination-item" class={cn("flex", classProp)}>
	{@render children?.()}
</li>
