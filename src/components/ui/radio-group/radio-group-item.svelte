<script lang="ts">
import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { getRadioGroupItemContext } from "./context";
import { radioGroup } from "./variants";

let {
	children,
	value,
	label,
	description,
	disabled = false,
	class: classProp,
	...rest
}: Omit<RadioGroupPrimitive.ItemProps, "value" | "disabled" | "class" | "children"> & {
	children?: Snippet;
	value: string;
	label?: string;
	description?: string;
	disabled?: boolean;
	class?: string;
} = $props();

const group = getRadioGroupItemContext();
const frame = $derived(radioGroup({ variant: group.variant, size: group.size }));
</script>

<label data-slot="radio-group-item" class={cn(frame.label(), classProp)}>
	<RadioGroupPrimitive.Item {...rest} {value} {disabled} class={frame.ring()}>
		{#snippet children({ checked })}
			<span data-on={checked} class={frame.dot()}></span>
		{/snippet}
	</RadioGroupPrimitive.Item>
	<span class="min-w-0">
		{#if children}
			{@render children()}
		{:else if label}
			<span class="block">{label}</span>
		{/if}
		{#if description}
			<span class="block text-muted-foreground text-xs leading-relaxed">{description}</span>
		{/if}
	</span>
</label>
