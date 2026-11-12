<script lang="ts">
import type { HTMLSelectAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type NativeSelectSize, nativeSelect } from "./variants";

let {
	ref = $bindable(null),
	value = $bindable(),
	class: classProp,
	size = "default",
	children,
	...rest
}: Omit<HTMLSelectAttributes, "size"> & {
	ref?: HTMLSelectElement | null;
	size?: NativeSelectSize;
} = $props();

const s = $derived(nativeSelect({ size }));
</script>

<div data-slot="native-select-wrapper" data-size={size} class={cn(s.wrapper(), classProp)}>
	<select bind:value bind:this={ref} data-slot="native-select" data-size={size} class={s.select()} {...rest}>
		{@render children?.()}
	</select>
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" data-slot="native-select-icon" class={s.icon()}>
		<path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
</div>
