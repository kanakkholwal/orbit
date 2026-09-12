<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from "$lib/utils.js";
	import type { HTMLTextareaAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		"data-slot": dataSlot = "textarea",
		...restProps
	}: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props();
</script>

<textarea
	bind:this={ref}
	data-slot={dataSlot}
	class={cn(
		"placeholder:text-placeholder focus-visible:border-ring aria-invalid:border-destructive flex field-sizing-content min-h-20 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base leading-relaxed text-foreground outline-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 md:text-body",
		className
	)}
	bind:value
	{...restProps}
></textarea>
