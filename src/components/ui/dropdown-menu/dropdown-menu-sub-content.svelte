<script lang="ts">
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { ANCHORED } from "$lib/anchor.js";
import { cn } from "$lib/cn.js";
import { menu } from "$lib/menu.js";

let { class: classProp, ...rest }: DropdownMenuPrimitive.SubContentProps = $props();
</script>

<DropdownMenuPrimitive.Portal>
	<DropdownMenuPrimitive.SubContent
		{...rest}
		data-slot="dropdown-menu-sub-content"
		class={cn(ANCHORED, "static", menu().surface(), "min-w-40", classProp)}
	/>
</DropdownMenuPrimitive.Portal>
