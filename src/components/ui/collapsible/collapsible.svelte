<script lang="ts">
import { Collapsible as CollapsiblePrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";

let {
	children,
	open = $bindable(false),
	disabled = false,
	class: classProp,
	...rest
}: {
	children?: Snippet;
	open?: boolean;
	disabled?: boolean;
	class?: string;
} = $props();
</script>

<CollapsiblePrimitive.Root
	{...rest}
	bind:open
	{disabled}
	data-slot="collapsible"
	class={cn("w-full", classProp)}
>
	{@render children?.()}
</CollapsiblePrimitive.Root>
