<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { table } from "./variants";

let {
	children,
	class: className,
	...rest
}: { children?: Snippet } & HTMLAttributes<HTMLElement> = $props();

const classes = table({});
</script>

<caption data-slot="table-caption" class={cn(classes.caption(), className)} {...rest}>
	{@render children?.()}
</caption>
