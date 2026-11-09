<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { navigationMenu } from "./variants";
import { getNavigationMenuStyle } from "./context";

let {
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLDivElement> & { children?: Snippet } = $props();
const variant = getNavigationMenuStyle();
</script>

<div
	data-slot="navigation-menu-footer"
	class={cn(navigationMenu({ variant: variant() }).footer(), classProp)}
	{...rest}
>
	{@render children?.()}
</div>
