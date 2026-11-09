<script lang="ts">
import { Popover as PopoverPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { ANCHORED } from "$lib/anchor.js";
import { type PopoverSize, popover } from "./variants";

let {
	class: classProp,
	sideOffset = 4,
	align = "center",
	container,
	size = "default",
	...rest
}: PopoverPrimitive.ContentProps & {
	/** Portal target; defaults to the body. Pass a fullscreen element so the popover stays visible. */
	container?: HTMLElement | null;
	size?: PopoverSize;
} = $props();

const styles = $derived(popover({ size }));
</script>

<PopoverPrimitive.Portal to={container ?? "body"}>
	<PopoverPrimitive.Content
		{sideOffset}
		{align}
		role="dialog"
		{...rest}
		data-slot="popover-content"
		data-size={size}
		class={cn(ANCHORED, "static", styles.surface(), styles.content(), classProp)}
	/>
</PopoverPrimitive.Portal>
