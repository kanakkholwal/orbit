<script lang="ts">
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { menu } from "$lib/menu.js";

let {
	class: classProp,
	destructive = false,
	inset = false,
	...rest
}: DropdownMenuPrimitive.ItemProps & {
	destructive?: boolean;
	inset?: boolean;
} = $props();

const variant = $derived(destructive ? "destructive" : "default");
</script>

<DropdownMenuPrimitive.Item
	{...rest}
	data-slot="dropdown-menu-item"
	data-inset={inset || undefined}
	class={cn(menu({ variant }).item(), classProp)}
/>
