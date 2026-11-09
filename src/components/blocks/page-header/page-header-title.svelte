<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { pageHeader } from "./variants";

let {
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLHeadingElement> & { children?: Snippet } = $props();
</script>

<h1 {...rest} data-slot="page-header-title" class={cn(pageHeader().title(), classProp)}>
	{@render children?.()}
</h1>
