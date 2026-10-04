<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type SkeletonShape, skeleton } from "./variants";

let {
	width,
	height,
	shape = "line",
	class: classProp,
	...rest
}: HTMLAttributes<HTMLDivElement> & {
	/** Overrides the class width; omit to size with classes. */
	width?: string;
	height?: string;
	shape?: SkeletonShape;
	class?: string;
} = $props();
</script>

<div
	aria-hidden="true"
	data-slot="skeleton"
	{...rest}
	style:width
	style:height
	class={cn(skeleton({ shape }), classProp)}
></div>
