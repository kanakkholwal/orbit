<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type BadgeSize, type BadgeVariant, badge } from "./variants";

type Props = Omit<HTMLAttributes<HTMLSpanElement>, "class" | "children"> & {
	children?: Snippet;
	class?: string;
	variant?: BadgeVariant;
	size?: BadgeSize;
	dot?: boolean;
};

let {
	children,
	class: classProp,
	variant = "default",
	size = "md",
	dot = false,
	...rest
}: Props = $props();
</script>

<span
	data-slot="badge"
	data-variant={variant}
	class={cn(badge({ variant, size }), classProp)}
	{...rest}
>
	{#if dot}<span class="size-1.5 shrink-0 rounded-full bg-current"></span>{/if}
	{@render children?.()}
</span>
