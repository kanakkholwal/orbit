<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type InputGroupSize, inputGroup } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	size = "md",
	children,
	...rest
}: HTMLAttributes<HTMLDivElement> & {
	ref?: HTMLDivElement | null;
	size?: InputGroupSize;
} = $props();
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="input-group"
	class={cn(inputGroup({ size }).root(), classProp)}
	{...rest}
>
	{@render children?.()}
</div>
