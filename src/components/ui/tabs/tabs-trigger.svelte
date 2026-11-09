<script lang="ts">
import { Tabs as TabsPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { tabsFrame } from "./variants";
import { getTabs } from "./context";

let { children, value, class: classProp, ...rest }: TabsPrimitive.TriggerProps = $props();

const tabs = getTabs();
const frame = $derived(
	tabsFrame({ variant: tabs.variant, size: tabs.size, orientation: tabs.orientation }),
);
</script>

<TabsPrimitive.Trigger
	{value}
	data-slot="tabs-trigger"
	data-tab={value}
	class={cn(frame.trigger(), classProp)}
	{...rest}
>
	{@render children?.()}
</TabsPrimitive.Trigger>
