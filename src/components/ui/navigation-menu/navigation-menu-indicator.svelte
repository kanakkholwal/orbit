<script lang="ts">
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { navigationMenu } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	...rest
}: NavigationMenuPrimitive.IndicatorProps = $props();
const styles = navigationMenu();
</script>

<NavigationMenuPrimitive.Indicator
	bind:ref
	data-slot="navigation-menu-indicator"
	class={cn(styles.indicator(), classProp)}
	{...rest}
>
	<div class={styles.indicatorArrow()}></div>
</NavigationMenuPrimitive.Indicator>
