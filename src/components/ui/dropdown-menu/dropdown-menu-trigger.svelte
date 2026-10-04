<script lang="ts">
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: DropdownMenuPrimitive.TriggerProps = $props();
</script>

<DropdownMenuPrimitive.Trigger
	{...rest}
	data-slot="dropdown-menu-trigger"
	class={cn(
		"inline-flex rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
		classProp,
	)}
/>
