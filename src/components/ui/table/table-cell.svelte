<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLTdAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { table } from "./variants";
import { getTableStyle } from "./context";

let {
	children,
	class: className,
	...rest
}: { children?: Snippet } & HTMLTdAttributes = $props();

const style = getTableStyle();
const classes = $derived(table(style()));
</script>

<td data-slot="table-cell" class={cn(classes.cell(), className)} {...rest}>
	{@render children?.()}
</td>
