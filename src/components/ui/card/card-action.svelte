<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div {...rest} data-slot="card-action" class={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", classProp)}>
	{@render children?.()}
</div>
