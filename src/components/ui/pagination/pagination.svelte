<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & HTMLAttributes<HTMLElement> = $props();
</script>

<nav {...rest} data-slot="pagination" aria-label="Pagination" class={cn("flex items-center gap-1", classProp)}>
	{@render children?.()}
</nav>
