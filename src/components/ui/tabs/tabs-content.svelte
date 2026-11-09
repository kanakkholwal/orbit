<script lang="ts">
import { Tabs as TabsPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { getTabs } from "./context";

let { children, value, class: classProp, ...rest }: TabsPrimitive.ContentProps = $props();

const tabs = getTabs();
</script>

<!-- bits-ui's Content always stays in the DOM, toggling native `hidden`, so panels stay findable and crawlable. -->
<TabsPrimitive.Content {value} data-slot="tabs-content" class={cn(tabs.orientation === "vertical" ? "min-w-0 flex-1" : "mt-4", classProp)} {...rest}>
	{@render children?.()}
</TabsPrimitive.Content>
