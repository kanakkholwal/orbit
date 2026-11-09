<script lang="ts">
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { type NavigationMenuVariant, navigationMenu } from "./variants";

let {
	ref = $bindable(null),
	variant = "default",
	class: classProp,
	...rest
}: NavigationMenuPrimitive.ViewportProps & { variant?: NavigationMenuVariant } = $props();

const styles = $derived(navigationMenu({ variant }));
</script>

<!-- shadcn-svelte's geometry: bits-ui measures the content without its p-2, hence the 1rem. -->
<div class="absolute start-0 top-full isolate z-50 flex justify-center">
	<NavigationMenuPrimitive.Viewport
		bind:ref
		data-slot="navigation-menu-viewport"
		class={cn(
			"nav-menu-viewport relative mt-1.5 w-full origin-top",
			styles.viewport(),
			"h-[calc(var(--bits-navigation-menu-viewport-height)+var(--navigation-menu-spacing))] md:w-[calc(var(--bits-navigation-menu-viewport-width)+var(--navigation-menu-spacing))]",
			classProp,
		)}
		{...rest}
	/>
</div>
