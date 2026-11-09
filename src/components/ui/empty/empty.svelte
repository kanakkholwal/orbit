<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type EmptyLayout, type EmptySize, type EmptyVariant, empty } from "./variants";

let {
	variant = "default",
	layout = "vertical",
	size = "default",
	class: classProp,
	children,
	...rest
}: {
	variant?: EmptyVariant;
	layout?: EmptyLayout;
	size?: EmptySize;
	class?: string;
	children?: Snippet;
} & Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> = $props();
</script>

<!-- Part names and data-slot values follow shadcn-svelte, so this drops into an existing project. -->
<div
	data-slot="empty"
	{...rest}
	data-layout={layout}
	data-size={size}
	class={cn(empty({ variant, layout, size }).root(), classProp)}
>
	{@render children?.()}
</div>
