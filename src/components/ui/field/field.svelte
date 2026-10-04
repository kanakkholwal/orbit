<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type FieldOrientation, type FieldSize, field } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	orientation = "vertical",
	size = "default",
	children,
	...rest
}: HTMLAttributes<HTMLDivElement> & {
	ref?: HTMLDivElement | null;
	orientation?: FieldOrientation;
	size?: FieldSize;
} = $props();
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="field"
	data-orientation={orientation}
	data-size={size}
	class={cn(field({ orientation, size }).root(), classProp)}
	{...rest}
>
	{@render children?.()}
</div>
