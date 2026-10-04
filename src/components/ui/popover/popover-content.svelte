<script lang="ts">
import { Popover as PopoverPrimitive } from "bits-ui";
import { ANCHORED } from "$lib/anchor.js";
import { cn } from "$lib/cn.js";
import { popover } from "./variants";

let {
	class: classProp,
	sideOffset = 4,
	align = "center",
	container,
	...rest
}: PopoverPrimitive.ContentProps & {
	/** Portal target; defaults to the body. Pass a fullscreen element so the popover stays visible. */
	container?: HTMLElement | null;
} = $props();
</script>

<PopoverPrimitive.Portal to={container ?? "body"}>
	<PopoverPrimitive.Content
		{sideOffset}
		{align}
		{...rest}
		data-slot="popover-content"
		class={cn(ANCHORED, "static", popover().surface(), popover().content(), classProp)}
	/>
</PopoverPrimitive.Portal>
