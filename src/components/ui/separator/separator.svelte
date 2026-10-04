<script lang="ts">
import { Separator as SeparatorPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { type SeparatorVariant, separator } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	orientation = "horizontal",
	decorative = false,
	variant = "solid",
	...rest
}: SeparatorPrimitive.RootProps & {
	/** Purely visual: hidden from assistive tech. */
	decorative?: boolean;
	variant?: SeparatorVariant;
} = $props();
</script>

<SeparatorPrimitive.Root
	bind:ref
	data-slot="separator"
	{orientation}
	{decorative}
	class={cn(separator({ variant }), classProp)}
	{...rest}
/>
