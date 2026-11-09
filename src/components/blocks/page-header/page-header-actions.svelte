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

<!-- Buttons and an AvatarGroup on the right of the title row. -->
<div {...rest} data-slot="page-header-actions" class={cn(pageHeader().side(), classProp)}>
	{@render children?.()}
</div>
