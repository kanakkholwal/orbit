<script lang="ts">
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { type NavigationMenuVariant, navigationMenu } from "./variants";
import { setNavigationMenuStyle } from "./context";
import NavigationMenuViewport from "./navigation-menu-viewport.svelte";

let {
	ref = $bindable(null),
	value = $bindable(""),
	viewport = true,
	variant = "default",
	class: classProp,
	children,
	...rest
}: NavigationMenuPrimitive.RootProps & {
	/** Render the shared panel that slides between triggers. */
	viewport?: boolean;
	variant?: NavigationMenuVariant;
} = $props();

const styles = $derived(navigationMenu({ variant }));
setNavigationMenuStyle(() => variant);
</script>

<NavigationMenuPrimitive.Root
	bind:ref
	bind:value
	data-slot="navigation-menu"
	data-viewport={viewport}
	data-variant={variant}
	class={cn(styles.root(), classProp)}
	{...rest}
>
	{@render children?.()}
	{#if viewport}
		<NavigationMenuViewport {variant} />
	{/if}
</NavigationMenuPrimitive.Root>
