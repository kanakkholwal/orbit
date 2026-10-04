<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { getTableStyle } from "./context";
import { table } from "./variants";

let {
	children,
	class: className,
	...rest
}: { children?: Snippet } & HTMLAttributes<HTMLTableSectionElement> = $props();

const style = getTableStyle();
const classes = $derived(table(style()));
</script>

<tbody data-slot="table-body" class={cn(classes.body(), className)} {...rest}>
	{@render children?.()}
</tbody>
