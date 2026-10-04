<script lang="ts">
import { Popover as PopoverPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: PopoverPrimitive.TriggerProps = $props();
</script>

<PopoverPrimitive.Trigger
	{...rest}
	data-slot="popover-trigger"
	class={cn(
		"inline-flex rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
		classProp,
	)}
/>
