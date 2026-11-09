<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { pageHeader } from "./variants";

let {
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLDivElement> & { children?: Snippet } = $props();
</script>

<!-- The title and whatever sits beside it, such as a status Badge. -->
<div {...rest} data-slot="page-header-heading" class={cn(pageHeader().heading(), classProp)}>
	{@render children?.()}
</div>
