<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { calendar } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLElement> & { ref?: HTMLElement | null } = $props();
</script>

<nav bind:this={ref} class={cn(calendar().nav(), classProp)} {...rest}>
	{@render children?.()}
</nav>
