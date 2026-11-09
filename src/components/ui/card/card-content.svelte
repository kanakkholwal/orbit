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

<div {...rest} data-slot="card-content" class={cn("px-6", classProp)}>
	{@render children?.()}
</div>
