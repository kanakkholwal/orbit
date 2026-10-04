<script lang="ts">
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { menu } from "$lib/menu.js";

let {
	class: classProp,
	inset = false,
	children,
	...rest
}: DropdownMenuPrimitive.SubTriggerProps & { inset?: boolean } = $props();
</script>

<DropdownMenuPrimitive.SubTrigger
	{...rest}
	data-slot="dropdown-menu-sub-trigger"
	data-inset={inset || undefined}
	class={cn(
		menu().item(),
		classProp,
	)}
>
	<span class="min-w-0 flex-1 truncate text-left">{@render children?.()}</span>
	<svg
		viewBox="0 0 16 16"
		fill="none"
		aria-hidden="true"
		class="ml-2 size-3.5 shrink-0 text-muted-foreground"
	>
		<path
			d="m6 3.5 4.5 4.5L6 12.5"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
</DropdownMenuPrimitive.SubTrigger>
