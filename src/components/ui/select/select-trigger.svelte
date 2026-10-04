<script lang="ts">
import { Select as SelectPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import {
	type SelectTriggerSize,
	type SelectTriggerVariant,
	selectTrigger,
} from "./variants";

let {
	class: classProp,
	children,
	variant = "default",
	size = "default",
	...rest
}: SelectPrimitive.TriggerProps & {
	variant?: SelectTriggerVariant;
	size?: SelectTriggerSize;
} = $props();
</script>

<SelectPrimitive.Trigger
	{...rest}
	data-slot="select-trigger"
	data-variant={variant}
	data-size={size}
	class={cn(selectTrigger({ variant, size }), "group/select-trigger", classProp)}
>
	{@render children?.()}
	<!-- Only the chevron turns; a leading icon passed as children stays put. -->
	<svg
		viewBox="0 0 16 16"
		fill="none"
		aria-hidden="true"
		data-slot="select-icon"
		class="size-3.5 shrink-0 text-muted-foreground transition-[rotate] duration-(--duration-exit) ease-(--ease-out) group-data-[state=open]/select-trigger:rotate-180 group-data-[state=open]/select-trigger:duration-(--duration-dropdown) motion-reduce:transition-none"
	>
		<path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
</SelectPrimitive.Trigger>
