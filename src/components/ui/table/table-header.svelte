<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { getTableStyle } from "./context";
import { table } from "./variants";

let {
	ref = $bindable(null),
	children,
	class: className,
	...rest
}: {
	ref?: HTMLTableSectionElement | null;
	children?: Snippet;
} & HTMLAttributes<HTMLTableSectionElement> = $props();

const style = getTableStyle();
const classes = $derived(table(style()));
</script>

<thead bind:this={ref} data-slot="table-header" class={cn(classes.header(), className)} {...rest}>
	{@render children?.()}
</thead>
