<script lang="ts">
import { Tooltip as TooltipPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: TooltipPrimitive.TriggerProps = $props();
</script>

<TooltipPrimitive.Trigger
	{...rest}
	data-slot="tooltip-trigger"
	class={cn("inline-flex", classProp)}
/>
