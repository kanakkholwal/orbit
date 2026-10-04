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

<div
	{...rest}
	data-slot="dropdown-menu-label"
	class={cn("px-2.5 py-1.5 font-medium text-muted-foreground text-xs", classProp)}
>
	{@render children?.()}
</div>
