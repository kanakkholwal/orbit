<script lang="ts">
import type { HTMLInputAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type InputSize, type InputVariant, input } from "./variants";

type Props = {
	value?: string;
	class?: string;
	size?: InputSize;
	/** `outline` (default) shows focus as the border; `ring` adds a soft halo. */
	variant?: InputVariant;
	invalid?: boolean;
	/** Bindable: the `<input>` element. */
	ref?: HTMLInputElement | null;
} & Omit<HTMLInputAttributes, "size" | "value" | "class">;

let {
	value = $bindable(""),
	ref = $bindable(null),
	class: classProp,
	size = "default",
	variant = "outline",
	invalid = false,
	...rest
}: Props = $props();
</script>

<input
	bind:this={ref}
	data-slot="input"
	{...rest}
	bind:value
	aria-invalid={invalid || rest["aria-invalid"] || undefined}
	class={cn(input({ size, variant }), classProp)}
/>
