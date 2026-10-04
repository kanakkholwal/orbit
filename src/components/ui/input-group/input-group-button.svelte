<script lang="ts">
import type { ComponentProps } from "svelte";
import Button from "$components/ui/button/button.svelte";
import type { ButtonSize } from "$components/ui/button/variants.js";
import { cn } from "$lib/cn.js";
import { inputGroup } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	type = "button",
	variant = "ghost",
	size = "xs",
	children,
	...rest
}: Omit<ComponentProps<typeof Button>, "size" | "href"> & {
	size?: Extract<ButtonSize, "xs" | "sm" | "icon-xs" | "icon-sm">;
} = $props();
</script>

<Button
	bind:ref
	{type}
	data-size={size}
	{variant}
	{size}
	class={cn(inputGroup().button(), classProp)}
	{...rest}
>
	{@render children?.()}
</Button>
