<script lang="ts">
import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { attachSegmentPill } from "./segment";
import { setToggleGroup, type ToggleGroupSize, type ToggleGroupVariant } from "./context";
import { toggleGroup } from "./variants";

let {
	children,
	value = $bindable<string | string[]>(""),
	type = "single",
	variant = "default",
	size = "default",
	disabled = false,
	label = "Options",
	onValueChange,
	class: classProp,
	...rest
}: Omit<
	ToggleGroupPrimitive.RootProps,
	"type" | "value" | "onValueChange" | "disabled" | "children" | "child" | "class"
> & {
	children?: Snippet;
	value?: string | string[];
	type?: "single" | "multiple";
	variant?: ToggleGroupVariant;
	size?: ToggleGroupSize;
	disabled?: boolean;
	label?: string;
	onValueChange?: (value: string | string[]) => void;
	class?: string;
} = $props();

setToggleGroup({
	get size() {
		return size;
	},
	get variant() {
		return variant;
	},
});

let root = $state<HTMLElement | null>(null);
let pill = $state<HTMLSpanElement>();
$effect(() => {
	if (variant !== "segmented" || !root || !pill) return;
	return attachSegmentPill(root, pill);
});

const rootClass = $derived(
	cn(toggleGroup({ variant, size }).root(), disabled && "opacity-50", classProp),
);
</script>

{#snippet indicator()}
	{#if variant === "segmented"}
		<span bind:this={pill} aria-hidden="true" data-slot="toggle-group-indicator" class={toggleGroup({ variant, size }).indicator()}></span>
	{/if}
{/snippet}

<!-- bits-ui's type/value form a discriminated union that can't narrow from a runtime variable. -->
{#if type === "multiple"}
	<ToggleGroupPrimitive.Root
		type="multiple"
		bind:value={value as string[]}
		bind:ref={root}
		{disabled}
		data-slot="toggle-group"
		aria-label={label}
		class={rootClass}
		onValueChange={onValueChange
			? (next: string[]) => onValueChange(next)
			: undefined}
		{...rest}
	>
		{@render indicator()}
		{@render children?.()}
	</ToggleGroupPrimitive.Root>
{:else}
	<ToggleGroupPrimitive.Root
		type="single"
		bind:value={value as string}
		bind:ref={root}
		{disabled}
		data-slot="toggle-group"
		aria-label={label}
		class={rootClass}
		onValueChange={onValueChange
			? (next: string) => onValueChange(next)
			: undefined}
		{...rest}
	>
		{@render indicator()}
		{@render children?.()}
	</ToggleGroupPrimitive.Root>
{/if}
