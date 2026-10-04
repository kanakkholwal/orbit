<script lang="ts">
import { Accordion as AccordionPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } = $props();
</script>

<AccordionPrimitive.Header level={3} data-slot="accordion-header" class="flex">
	<AccordionPrimitive.Trigger
		{...rest}
		data-slot="accordion-trigger"
		class={cn(
			"group/accordion-trigger flex flex-1 items-center justify-between gap-4 px-4 py-3 text-left font-medium text-foreground text-sm outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50",
			classProp,
		)}
	>
		{@render children?.()}
		<!-- Only the chevron turns; a leading icon passed as children stays put. -->
		<svg
			viewBox="0 0 16 16"
			fill="none"
			aria-hidden="true"
			data-slot="accordion-icon"
			class="size-4 shrink-0 text-muted-foreground transition-[rotate] duration-(--duration-exit) ease-(--ease-out) group-data-[state=open]/accordion-trigger:rotate-180 group-data-[state=open]/accordion-trigger:duration-(--duration-overlay) motion-reduce:transition-none"
		>
			<path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
