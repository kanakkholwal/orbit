<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type FieldLegendVariant, fieldLegend } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	variant = "legend",
	children,
	...rest
}: HTMLAttributes<HTMLLegendElement> & {
	ref?: HTMLLegendElement | null;
	variant?: FieldLegendVariant;
} = $props();
</script>

<legend
	bind:this={ref}
	data-slot="field-legend"
	data-variant={variant}
	class={cn(fieldLegend({ variant }), classProp)}
	{...rest}
>
	{@render children?.()}
</legend>
