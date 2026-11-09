<script lang="ts">
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { navigationMenu } from "./variants";
import { getNavigationMenuStyle } from "./context";

let {
	ref = $bindable(null),
	class: classProp,
	children,
	...rest
}: NavigationMenuPrimitive.ContentProps = $props();

const variant = getNavigationMenuStyle();
</script>

<!-- Absolute from md up, so the outgoing and incoming panels overlap while they cross-slide. -->
<NavigationMenuPrimitive.Content
	bind:ref
	data-slot="navigation-menu-content"
	class={cn(
		"nav-menu-content top-0 left-0 w-full md:absolute md:w-auto",
		navigationMenu({ variant: variant() }).content(),
		classProp,
	)}
	{...rest}
>
	<!-- bits-ui sizes the viewport from the content's first child, so body and footer share one. -->
	<div data-slot="navigation-menu-panel" class="flex flex-col">{@render children?.()}</div>
</NavigationMenuPrimitive.Content>
