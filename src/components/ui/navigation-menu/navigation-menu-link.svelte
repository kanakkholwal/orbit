<script lang="ts">
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { navigationMenu } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	...rest
}: NavigationMenuPrimitive.LinkProps = $props();
</script>

<NavigationMenuPrimitive.Link
	bind:ref
	data-slot="navigation-menu-link"
	class={cn(navigationMenu().link(), classProp)}
	{...rest}
/>
