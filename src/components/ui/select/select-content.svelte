<script lang="ts">
import { Select as SelectPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { menu } from "$lib/menu.js";
import { ANCHORED } from "$lib/anchor.js";
import type { SelectContentSize } from "./variants";
import { getSelectSize } from "./context";

let {
	class: classProp,
	children,
	sideOffset = 6,
	size: sizeProp,
	...rest
}: SelectPrimitive.ContentProps & {
	/** Match the trigger's `size`. */
	size?: SelectContentSize;
} = $props();

const rootSize = getSelectSize();
const size = $derived(sizeProp ?? rootSize());
</script>

<SelectPrimitive.Portal>
	<SelectPrimitive.Content
		{sideOffset}
		{...rest}
		data-slot="select-content"
		data-size={size}
		class={cn(
			ANCHORED,
			menu({ size }).surface(),
			// At least the trigger's width, growing to the longest option so labels never clip.
			"static z-50 max-h-[min(16rem,var(--bits-select-content-available-height))] w-max min-w-[var(--bits-select-anchor-width)] max-w-[min(24rem,var(--bits-select-content-available-width))] overflow-x-hidden overflow-y-auto scroll-area",
			classProp,
		)}
	>
		<SelectPrimitive.Viewport>
			{@render children?.()}
		</SelectPrimitive.Viewport>
	</SelectPrimitive.Content>
</SelectPrimitive.Portal>
