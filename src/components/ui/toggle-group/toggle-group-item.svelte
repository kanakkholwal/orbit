<script lang="ts">
import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { getToggleGroup } from "./context";
import { toggleGroup } from "./variants";

let {
	children: childrenProp,
	value,
	class: classProp,
	...rest
}: Omit<ToggleGroupPrimitive.ItemProps, "children"> & { children?: Snippet } = $props();

const group = getToggleGroup();
</script>

<ToggleGroupPrimitive.Item
	{value}
	data-slot="toggle-group-item"
	class={cn(toggleGroup({ variant: group.variant, size: group.size }).item(), classProp)}
	{...rest}
>
	{#snippet children()}
		{@render childrenProp?.()}
	{/snippet}
</ToggleGroupPrimitive.Item>
