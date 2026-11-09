<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & HTMLAttributes<HTMLUListElement> = $props();
</script>

<ul {...rest} data-slot="pagination-content" class={cn("flex list-none items-center gap-1", classProp)}>
	{@render children?.()}
</ul>
