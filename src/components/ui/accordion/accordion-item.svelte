<script lang="ts">
import { Accordion as AccordionPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { setAccordionItem } from "./context";

let {
	children,
	class: classProp,
	...rest
}: Omit<AccordionPrimitive.ItemProps, "children" | "child" | "class"> & {
	children?: Snippet;
	value: string;
	class?: string;
} = $props();

const uid = $props.id();
setAccordionItem({ trigger: `${uid}-trigger`, content: `${uid}-content` });
</script>

<AccordionPrimitive.Item {...rest} data-slot="accordion-item" class={cn(classProp)}>
	{@render children?.()}
</AccordionPrimitive.Item>
