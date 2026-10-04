<script lang="ts">
import { Tooltip as TooltipPrimitive } from "bits-ui";
import { ANCHORED } from "$lib/anchor.js";
import { cn } from "$lib/cn.js";

let {
	class: classProp,
	side = "top",
	sideOffset = 6,
	...rest
}: TooltipPrimitive.ContentProps = $props();
</script>

<TooltipPrimitive.Portal>
	<TooltipPrimitive.Content
		{side}
		{sideOffset}
		{...rest}
		data-slot="tooltip-content"
		class={cn(
			ANCHORED,
			"static z-50 rounded-md bg-popover px-2 py-1 text-foreground text-xs shadow-(--overlay-shadow)",
			"data-[state=open]:pointer-events-none",
			// Tooltips report delayed-open/instant-open, never open. Once one is open, the next skips motion.
			"data-[state=delayed-open]:opacity-100 data-[state=delayed-open]:scale-100 data-[state=delayed-open]:duration-[var(--duration-tooltip)]",
			"starting:data-[state=delayed-open]:opacity-0 starting:data-[state=delayed-open]:scale-[var(--enter-scale)]",
			"data-[state=instant-open]:opacity-100 data-[state=instant-open]:scale-100 data-[state=instant-open]:duration-0",
			classProp,
		)}
	/>
</TooltipPrimitive.Portal>
