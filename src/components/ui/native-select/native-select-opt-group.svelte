<script lang="ts">
import type { HTMLOptgroupAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { nativeSelect } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	children,
	...rest
}: HTMLOptgroupAttributes & { ref?: HTMLOptGroupElement | null } = $props();
</script>

<optgroup
	bind:this={ref}
	data-slot="native-select-opt-group"
	class={cn(nativeSelect().option(), classProp)}
	{...rest}
>
	{@render children?.()}
</optgroup>
