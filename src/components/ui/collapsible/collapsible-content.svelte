<script lang="ts">
import { Collapsible as CollapsiblePrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let {
	children,
	class: classProp,
	...rest
}: Omit<CollapsiblePrimitive.ContentProps, "child" | "forceMount"> = $props();
</script>

<!-- grid-template-rows animates to content height without measuring it; forceMount keeps
	the panel mounted while closed, or the transition has no prior frame to animate from. -->
<CollapsiblePrimitive.Content {...rest} forceMount>
	{#snippet child({ props, open })}
		<div
			data-slot="collapsible-content"
			{...props}
			inert={!open}
			class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[var(--duration-dropdown)] ease-[var(--ease-out-quad)] data-[state=open]:grid-rows-[1fr] data-[state=open]:duration-[var(--duration-collapse)] motion-reduce:transition-none"
		>
			<div class="overflow-hidden">
				<div class={cn("px-1 pb-2 text-muted-foreground text-sm", classProp)}>
					{@render children?.()}
				</div>
			</div>
		</div>
	{/snippet}
</CollapsiblePrimitive.Content>
