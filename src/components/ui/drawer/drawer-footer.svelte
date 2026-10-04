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
	data-slot="drawer-footer"
	class={cn("mt-auto flex flex-col gap-2 pt-5 sm:flex-row sm:justify-end", classProp)}
>
	{@render children?.()}
</div>
