<script lang="ts">
import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { setRadioGroupItemContext } from "./context";
import {
	type RadioOrientation,
	type RadioSize,
	type RadioVariant,
	radioGroup,
} from "./variants";

let {
	children,
	value = $bindable(""),
	orientation = "vertical",
	variant = "default",
	size = "md",
	disabled = false,
	name,
	class: classProp,
	...rest
}: {
	children?: Snippet;
	value?: string;
	orientation?: RadioOrientation;
	variant?: RadioVariant;
	size?: RadioSize;
	disabled?: boolean;
	name?: string;
	class?: string;
} = $props();

setRadioGroupItemContext({
	get size() {
		return size;
	},
	get variant() {
		return variant;
	},
});
</script>

<RadioGroupPrimitive.Root
	{...rest}
	bind:value
	{orientation}
	{disabled}
	{name}
	data-slot="radio-group"
	class={cn(radioGroup({ orientation }).root(), disabled && "opacity-50", classProp)}
>
	{@render children?.()}
</RadioGroupPrimitive.Root>
