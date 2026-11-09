<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLThAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { table } from "./variants";
import { getTableStyle } from "./context";

let {
	children,
	class: className,
	...rest
}: { children?: Snippet } & HTMLThAttributes = $props();

const style = getTableStyle();
const classes = $derived(table(style()));
</script>

<th data-slot="table-head" class={cn(classes.head(), className)} {...rest}>
	{@render children?.()}
</th>
