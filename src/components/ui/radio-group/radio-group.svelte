<script lang="ts">
import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { attachRadioPill } from "./glide";
import {
	type RadioOrientation,
	type RadioSize,
	type RadioVariant,
	radioGroup,
} from "./variants";
import { setRadioGroupItemContext } from "./context";

let {
	children,
	value = $bindable(""),
	orientation = "vertical",
	variant = "default",
	size = "default",
	disabled = false,
	name,
	onValueChange,
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
	onValueChange?: (value: string) => void;
	"aria-labelledby"?: string;
	"aria-label"?: string;
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

let root = $state<HTMLElement | null>(null);
let pill = $state<HTMLSpanElement | null>(null);
$effect(() => {
	if (variant !== "list" || !root || !pill) return;
	return attachRadioPill(root, pill);
});
</script>

<RadioGroupPrimitive.Root
	{...rest}
	bind:ref={root}
	bind:value
	onValueChange={(v) => onValueChange?.(v)}
	orientation={orientation === "grid" ? "vertical" : orientation}
	{disabled}
	{name}
	data-slot="radio-group"
	class={cn(radioGroup({ orientation, variant }).root(), disabled && "opacity-50", classProp)}
>
	{#if variant === "list"}<span bind:this={pill} aria-hidden="true" class={radioGroup({ variant }).pill()}></span>{/if}
	{@render children?.()}
</RadioGroupPrimitive.Root>
