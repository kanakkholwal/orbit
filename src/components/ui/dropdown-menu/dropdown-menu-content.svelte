<script lang="ts">
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { type MenuSize, menu } from "$lib/menu.js";
import { ANCHORED, stagger } from "$lib/anchor.js";
import { dropdownMenuTrigger } from "./context";

let {
	class: classProp,
	sideOffset = 4,
	align = "start",
	size = "default",
	ref = $bindable(null),
	...rest
}: DropdownMenuPrimitive.ContentProps & { size?: MenuSize } = $props();

$effect(() => {
	if (ref) stagger(ref.querySelectorAll<HTMLElement>("[role='menuitem']"));
});
</script>

<DropdownMenuPrimitive.Portal>
	<DropdownMenuPrimitive.Content
		bind:ref
		{sideOffset}
		{align}
		aria-labelledby={dropdownMenuTrigger()}
		{...rest}
		data-slot="dropdown-menu-content"
		data-size={size}
		class={cn(ANCHORED, "static", menu({ size }).surface(), classProp)}
	/>
</DropdownMenuPrimitive.Portal>
