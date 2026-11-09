<script lang="ts">
import { Toggle as TogglePrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { type ToggleSize, type ToggleVariant, toggleButton } from "./variants";

let {
	children,
	pressed = $bindable(false),
	disabled = false,
	variant = "default",
	size = "default",
	label,
	class: classProp,
	...rest
}: Omit<
	TogglePrimitive.RootProps,
	"pressed" | "disabled" | "children" | "child" | "class"
> & {
	children?: Snippet;
	pressed?: boolean;
	disabled?: boolean;
	variant?: ToggleVariant;
	size?: ToggleSize;
	label?: string;
	class?: string;
} = $props();
</script>

<TogglePrimitive.Root
	bind:pressed
	{disabled}
	aria-label={label}
	data-slot="toggle"
	data-variant={variant}
	class={cn(toggleButton({ variant, size }), classProp)}
	{...rest}
>
	{@render children?.()}
</TogglePrimitive.Root>
