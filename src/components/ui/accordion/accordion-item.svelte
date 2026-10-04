<script lang="ts">
import { Accordion as AccordionPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; value: string; disabled?: boolean; class?: string } = $props();
</script>

<AccordionPrimitive.Item {...rest} data-slot="accordion-item" class={cn(classProp)}>
	{@render children?.()}
</AccordionPrimitive.Item>
