<script lang="ts">
import type { HTMLOptionAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { nativeSelect } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	children,
	...rest
}: HTMLOptionAttributes & { ref?: HTMLOptionElement | null } = $props();
</script>

<option bind:this={ref} data-slot="native-select-option" class={cn(nativeSelect().option(), classProp)} {...rest}>
	{@render children?.()}
</option>
