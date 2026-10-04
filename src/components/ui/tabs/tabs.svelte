<script lang="ts">
import { Tabs as TabsPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { setTabs, type TabsSize, type TabsVariant } from "./context";

let {
	children,
	value = $bindable(""),
	variant = "pill",
	size = "md",
	class: classProp,
	...rest
}: Omit<TabsPrimitive.RootProps, "value"> & {
	value?: string;
	variant?: TabsVariant;
	size?: TabsSize;
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
});
</script>

<TabsPrimitive.Root bind:value data-slot="tabs" class={cn("flex flex-col", classProp)} {...rest}>
	{@render children?.()}
</TabsPrimitive.Root>
