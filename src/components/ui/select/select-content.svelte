<script lang="ts">
import { Select as SelectPrimitive } from "bits-ui";
import { ANCHORED } from "$lib/anchor.js";
import { cn } from "$lib/cn.js";
import { menu } from "$lib/menu.js";
import { type SelectContentSize, selectContent } from "./variants";

let {
	class: classProp,
	children,
	sideOffset = 6,
	size,
	...rest
}: SelectPrimitive.ContentProps & {
	/** Match the trigger's `size`. */
	size?: SelectContentSize;
} = $props();
</script>

<SelectPrimitive.Portal>
	<SelectPrimitive.Content
		{sideOffset}
		{...rest}
		data-slot="select-content"
		data-size={size}
		class={cn(
			ANCHORED,
			menu().surface(),
			// At least the trigger's width, growing to the longest option so labels never clip.
			"static z-50 max-h-[min(16rem,var(--bits-select-content-available-height))] w-max min-w-[var(--bits-select-anchor-width)] max-w-[min(24rem,var(--bits-select-content-available-width))] overflow-x-hidden overflow-y-auto scroll-area",
			selectContent({ size }),
			classProp,
		)}
	>
		<SelectPrimitive.Viewport>
			{@render children?.()}
		</SelectPrimitive.Viewport>
	</SelectPrimitive.Content>
</SelectPrimitive.Portal>
