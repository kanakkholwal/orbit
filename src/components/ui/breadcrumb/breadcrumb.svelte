<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { setBreadcrumbStyle } from "./context";
import { type BreadcrumbSize, type BreadcrumbVariant, breadcrumb } from "./variants";

let {
	children,
	variant = "default",
	size = "md",
	class: classProp,
	...rest
}: {
	children?: Snippet;
	variant?: BreadcrumbVariant;
	size?: BreadcrumbSize;
	class?: string;
} & HTMLAttributes<HTMLElement> = $props();

setBreadcrumbStyle(() => ({ variant, size }));
</script>

<nav
	{...rest}
	data-slot="breadcrumb"
	data-variant={variant}
	aria-label="Breadcrumb"
	class={cn(breadcrumb({ variant, size }).root(), classProp)}
>
	{@render children?.()}
</nav>
