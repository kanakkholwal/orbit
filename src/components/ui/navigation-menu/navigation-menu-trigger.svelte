<script lang="ts">
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import {
	type NavigationMenuSize,
	navigationMenu,
	navigationMenuTriggerStyle,
} from "./variants";

let {
	ref = $bindable(null),
	size,
	class: classProp,
	children,
	...rest
}: NavigationMenuPrimitive.TriggerProps & { size?: NavigationMenuSize } = $props();
</script>

<NavigationMenuPrimitive.Trigger
	bind:ref
	data-slot="navigation-menu-trigger"
	class={cn(navigationMenuTriggerStyle({ size }), classProp)}
	{...rest}
>
	{@render children?.()}
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		class={navigationMenu().chevron()}
	>
		<path d="m6 9 6 6 6-6" />
	</svg>
</NavigationMenuPrimitive.Trigger>
