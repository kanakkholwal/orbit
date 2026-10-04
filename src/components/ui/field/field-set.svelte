<script lang="ts">
import type { HTMLFieldsetAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type FieldSize, field } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	size = "default",
	children,
	...rest
}: HTMLFieldsetAttributes & {
	ref?: HTMLFieldSetElement | null;
	size?: FieldSize;
} = $props();
</script>

<fieldset
	bind:this={ref}
	data-slot="field-set"
	data-size={size}
	class={cn(field({ size }).set(), classProp)}
	{...rest}
>
	{@render children?.()}
</fieldset>
