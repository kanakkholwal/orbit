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

<!-- The page under the header, usually one TabsContent per tab. -->
<div {...rest} data-slot="page-header-content" class={cn(pageHeader().panels(), classProp)}>
	{@render children?.()}
</div>
