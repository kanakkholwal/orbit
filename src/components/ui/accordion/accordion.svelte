<script lang="ts">
import { Accordion as AccordionPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { type AccordionMotion, accordion } from "./variants";

let {
	children,
	type = "single",
	collapsible: _collapsible,
	value = $bindable(),
	onValueChange,
	motion = "smooth",
	class: classProp,
	...rest
}: {
	children?: Snippet;
	type?: "single" | "multiple";
	/** Ignored: bits-ui's single mode always allows closing the open item. Kept so
	 * existing callers passing `collapsible={false}` still compile. */
	collapsible?: boolean;
	/** The open item in single mode, the open items in multiple mode. Bindable. */
	value?: string | string[];
	onValueChange?: (value: string | string[]) => void;
	motion?: AccordionMotion;
	class?: string;
} = $props();

const rootClass = $derived(cn(accordion({ motion }), classProp));

function commit(next: string | string[]) {
	value = next;
	onValueChange?.(next);
}
</script>

<!-- bits-ui fixes `type` when the root mounts, so each mode is its own root with its own value shape. -->
{#if type === "multiple"}
	<AccordionPrimitive.Root
		{...rest}
		type="multiple"
		bind:value={() => (Array.isArray(value) ? value : value ? [value] : []), commit}
		data-slot="accordion"
		data-motion={motion}
		class={rootClass}
	>
		{@render children?.()}
	</AccordionPrimitive.Root>
{:else}
	<AccordionPrimitive.Root
		{...rest}
		type="single"
		bind:value={() => (Array.isArray(value) ? (value[0] ?? "") : (value ?? "")), commit}
		data-slot="accordion"
		data-motion={motion}
		class={rootClass}
	>
		{@render children?.()}
	</AccordionPrimitive.Root>
{/if}
