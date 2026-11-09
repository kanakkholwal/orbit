<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { pageHeader } from "./variants";
import { pageHeaderState } from "./context";

let {
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLElement> & { children?: Snippet } = $props();

const header = pageHeaderState();
</script>

<header
	{...rest}
	data-slot="page-header-bar"
	data-condensed={header.condensed}
	class={cn(pageHeader().bar(), classProp)}
>
	{@render children?.()}
</header>
