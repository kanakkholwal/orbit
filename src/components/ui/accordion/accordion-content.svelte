<script lang="ts">
import { Accordion as AccordionPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { accordionItem } from "./context";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } = $props();

const ids = accordionItem();
</script>

<AccordionPrimitive.Content {...rest} forceMount>
	{#snippet child({ props, open })}
		<div
			{...props}
			id={ids?.content}
			role="region"
			aria-labelledby={ids?.trigger}
			inert={!open}
			data-slot="accordion-content"
			class="group/accordion-panel grid grid-rows-[0fr] transition-[grid-template-rows] duration-(--accordion-duration) ease-(--accordion-ease) data-[state=open]:grid-rows-[1fr] data-[state=open]:[--accordion-duration:var(--accordion-open-duration)] data-[state=open]:[--accordion-ease:var(--accordion-open-ease)] motion-reduce:transition-none"
		>
			<div class="overflow-hidden">
				<!-- The answer settles into place as the panel opens, and lifts back as it closes. -->
				<div class={cn("px-4 pb-3 text-muted-foreground text-sm leading-relaxed translate-y-(--accordion-content-y) scale-y-(--accordion-content-scale) opacity-0 transition-[translate,scale,opacity] duration-(--accordion-duration) ease-(--accordion-ease) origin-top group-data-[state=open]/accordion-panel:translate-y-0 group-data-[state=open]/accordion-panel:scale-y-100 group-data-[state=open]/accordion-panel:opacity-100 motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:scale-y-100", classProp)}>
					{@render children?.()}
				</div>
			</div>
		</div>
	{/snippet}
</AccordionPrimitive.Content>
