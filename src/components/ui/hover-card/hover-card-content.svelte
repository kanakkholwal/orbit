<script lang="ts">
import { LinkPreview as HoverCardPrimitive } from "bits-ui";
import { ANCHORED } from "$lib/anchor.js";
import { cn } from "$lib/cn.js";

let {
	class: classProp,
	align = "center",
	sideOffset = 4,
	...rest
}: HoverCardPrimitive.ContentProps = $props();
</script>

<HoverCardPrimitive.Portal>
	<HoverCardPrimitive.Content
		{align}
		{sideOffset}
		{...rest}
		data-slot="hover-card-content"
		class={cn(
			ANCHORED,
			"static z-50 w-64 rounded-xl bg-popover p-3 text-sm shadow-(--overlay-shadow)",
			classProp,
		)}
	/>
</HoverCardPrimitive.Portal>
