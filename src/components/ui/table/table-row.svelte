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
	ref?: HTMLTableRowElement | null;
	children?: Snippet;
} & HTMLAttributes<HTMLTableRowElement> = $props();

const style = getTableStyle();
const classes = $derived(table(style()));
</script>

<tr bind:this={ref} data-slot="table-row" class={cn(classes.row(), className)} {...rest}>
	{@render children?.()}
</tr>
