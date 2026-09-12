<script lang="ts">
	import { cn, type WithoutChild } from "$lib/utils.js";
	import { IconChevronDown as ChevronDownIcon } from "@tabler/icons-svelte";
	import { Select as SelectPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		children,
		size = "default",
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps> & {
		size?: "sm" | "default";
	} = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-slot="select-trigger"
	data-size={size}
	class={cn(
		"data-placeholder:text-placeholder [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring data-[state=open]:border-ring aria-invalid:border-destructive flex w-fit items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-body text-foreground whitespace-nowrap outline-none transition-colors duration-150 select-none disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-10 data-[size=sm]:h-9 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<ChevronDownIcon class="size-4 text-muted-foreground" />
</SelectPrimitive.Trigger>
