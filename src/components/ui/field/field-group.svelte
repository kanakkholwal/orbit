<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type FieldSize, field } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	size = "default",
	children,
	...rest
}: HTMLAttributes<HTMLDivElement> & {
	ref?: HTMLDivElement | null;
	size?: FieldSize;
} = $props();
</script>

<div
	bind:this={ref}
	data-slot="field-group"
	data-size={size}
	class={cn(field({ size }).group(), classProp)}
	{...rest}
>
	{@render children?.()}
</div>
