<script lang="ts">
import { Tabs as TabsPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import {
	setTabs,
	type TabsOrientation,
	type TabsSize,
	type TabsVariant,
} from "./context";

let {
	children,
	value = $bindable(""),
	variant = "pill",
	size = "default",
	orientation = "horizontal",
	class: classProp,
	...rest
}: Omit<TabsPrimitive.RootProps, "value"> & {
	value?: string;
	variant?: TabsVariant;
	size?: TabsSize;
	orientation?: TabsOrientation;
} = $props();

setTabs({
	get value() {
		return value;
	},
	get variant() {
		return variant;
	},
	get size() {
		return size;
	},
	get orientation() {
		return orientation;
	},
});
</script>

<TabsPrimitive.Root bind:value {orientation} data-slot="tabs" class={cn(
		"flex",
		orientation === "vertical" ? "flex-row items-start gap-4" : "flex-col",
		classProp,
	)} {...rest}>
	{@render children?.()}
</TabsPrimitive.Root>
