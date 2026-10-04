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

<tfoot data-slot="table-footer" class={cn(classes.footer(), className)} {...rest}>
	{@render children?.()}
</tfoot>
