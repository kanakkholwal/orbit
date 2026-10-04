<script lang="ts">
import { Tabs as TabsPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { children, value, class: classProp, ...rest }: TabsPrimitive.ContentProps = $props();
</script>

<!-- bits-ui's Content always stays in the DOM, toggling native `hidden`, so panels stay findable and crawlable. -->
<TabsPrimitive.Content {value} data-slot="tabs-content" class={cn("mt-4", classProp)} {...rest}>
	{@render children?.()}
</TabsPrimitive.Content>
