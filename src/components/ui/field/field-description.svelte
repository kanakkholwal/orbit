<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { field } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLParagraphElement> & {
	ref?: HTMLParagraphElement | null;
} = $props();
</script>

<p bind:this={ref} data-slot="field-description" class={cn(field().description(), classProp)} {...rest}>
	{@render children?.()}
</p>
