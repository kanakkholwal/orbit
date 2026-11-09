<script lang="ts">
import { Collapsible as CollapsiblePrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let {
	children,
	class: classProp,
	...rest
}: Omit<CollapsiblePrimitive.TriggerProps, "child"> = $props();
</script>

<CollapsiblePrimitive.Trigger
	data-slot="collapsible-trigger"
	{...rest}
	class={cn(
		"group/collapsible-trigger flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left font-medium text-foreground text-sm transition-colors hover:text-muted-foreground",
		classProp,
	)}
>
	<!-- Only the chevron turns; an icon passed as children stays put. -->
	<svg
		viewBox="0 0 16 16"
		fill="none"
		aria-hidden="true"
		data-slot="collapsible-icon"
		class="size-3.5 shrink-0 text-muted-foreground transition-[rotate] duration-(--duration-exit) ease-(--ease-ui-out) group-data-[state=open]/collapsible-trigger:rotate-90 group-data-[state=open]/collapsible-trigger:duration-(--duration-overlay) motion-reduce:transition-none"
	>
		<path d="m6 4 4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
	{@render children?.()}
</CollapsiblePrimitive.Trigger>
