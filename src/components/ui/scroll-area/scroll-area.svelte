<script lang="ts">
import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";

let {
	children,
	maxHeight = "16rem",
	class: classProp,
	viewportRef = $bindable(null),
	viewportProps,
	...rest
}: ScrollAreaPrimitive.RootProps & {
	children: Snippet;
	maxHeight?: string;
	/** Exposes the actual scrollable element, for callers that need to drive its scroll
	 * position themselves (e.g. Conversation's auto-follow). */
	viewportRef?: HTMLDivElement | null;
	/** Escape hatch for props that must land on the real scrollable element, not the
	 * outer root (role, aria-*, tabindex, extra scroll/pointer listeners). */
	viewportProps?: Omit<ScrollAreaPrimitive.ViewportProps, "children" | "ref">;
} = $props();

let atTop = $state(true);
let atBottom = $state(true);

// Fades tell the reader there is more; a styled scrollbar alone does not on touch.
function measure() {
	if (!viewportRef) return;
	atTop = viewportRef.scrollTop <= 1;
	atBottom =
		viewportRef.scrollTop + viewportRef.clientHeight >= viewportRef.scrollHeight - 1;
}

$effect(() => {
	if (!viewportRef) return;
	measure();
	const observer = new ResizeObserver(measure);
	observer.observe(viewportRef);
	return () => observer.disconnect();
});
</script>

<ScrollAreaPrimitive.Root data-slot="scroll-area" class={cn("relative", classProp)} {...rest}>
	<ScrollAreaPrimitive.Viewport
		{...viewportProps}
		bind:ref={viewportRef}
		onscroll={(event) => {
			measure();
			viewportProps?.onscroll?.(event);
		}}
		data-slot="scroll-area-viewport"
		style="max-height: {maxHeight}"
		class={cn("size-full rounded-[inherit] outline-none", viewportProps?.class)}
	>
		{@render children()}
	</ScrollAreaPrimitive.Viewport>
	<ScrollAreaPrimitive.Scrollbar
		data-slot="scroll-area-scrollbar"
		orientation="vertical"
		class="flex touch-none select-none p-0.5 transition-colors data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-2.5"
	>
		<ScrollAreaPrimitive.Thumb
			data-slot="scroll-area-thumb"
			class="relative flex-1 rounded-full bg-border"
		/>
	</ScrollAreaPrimitive.Scrollbar>
	<ScrollAreaPrimitive.Corner />

	<span
		aria-hidden="true"
		style:opacity={atTop ? 0 : 1}
		class="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-background to-transparent transition-opacity duration-(--duration-fast)"
	></span>
	<span
		aria-hidden="true"
		style:opacity={atBottom ? 0 : 1}
		class="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background to-transparent transition-opacity duration-(--duration-fast)"
	></span>
</ScrollAreaPrimitive.Root>
