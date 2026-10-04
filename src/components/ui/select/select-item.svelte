<script lang="ts">
import { Select as SelectPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { menu } from "$lib/menu.js";

let {
	class: classProp,
	value,
	label,
	children: childrenProp,
	...rest
}: SelectPrimitive.ItemProps = $props();

const styles = menu();
</script>

<SelectPrimitive.Item
	{value}
	{label}
	{...rest}
	data-slot="select-item"
	class={cn(styles.item(), classProp)}
>
	{#snippet children({ selected, highlighted })}
		<!-- One wrapper, so a leading icon sits beside its label instead of spreading with the tick. -->
		<span class="flex min-w-0 items-center gap-2">
			{#if childrenProp}
				{@render childrenProp({ selected, highlighted })}
			{:else}
				{label || value}
			{/if}
		</span>
		<!-- Always mounted so the tick draws in when the row is chosen. -->
		<svg viewBox="0 0 14 14" fill="none" aria-hidden="true" data-on={selected} class={styles.check()}>
			<path
				d="M3 7.4 5.6 10 11 4.2"
				pathLength="1"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	{/snippet}
</SelectPrimitive.Item>
