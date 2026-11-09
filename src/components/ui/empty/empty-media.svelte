<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type EmptyMediaTone, type EmptyMediaVariant, emptyMedia } from "./variants";

let {
	variant = "default",
	tone = "neutral",
	class: classProp,
	children,
	...rest
}: {
	variant?: EmptyMediaVariant;
	tone?: EmptyMediaTone;
	class?: string;
	children?: Snippet;
} & Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> = $props();
</script>

<div
	{...rest}
	data-slot="empty-icon"
	data-variant={variant}
	class={cn(emptyMedia({ variant, tone }), classProp)}
>
	{@render children?.()}
</div>
