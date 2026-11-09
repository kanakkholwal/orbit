<script lang="ts">
import { Calendar as Primitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { calendar } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	value,
	onchange,
	...rest
}: Omit<Primitive.YearSelectProps, "child" | "children"> = $props();

const s = calendar();
</script>

<!-- A native select under a styled label: platform pickers on touch, full keyboard support. -->
<span class={cn(s.dropdown(), classProp)}>
	<Primitive.YearSelect bind:ref class="absolute inset-0 bg-popover opacity-0" {...rest}>
		{#snippet child({ props, yearItems, selectedYearItem })}
			<select {...props} {value} {onchange}>
				{#each yearItems as item (item.value)}
					<option
						value={item.value}
						selected={value !== undefined ? item.value === value : item.value === selectedYearItem.value}
					>
						{item.label}
					</option>
				{/each}
			</select>
			<span class={s.dropdownLabel()} aria-hidden="true">
				{yearItems.find((item) => item.value === value)?.label || selectedYearItem.label}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="m6 9 6 6 6-6" />
				</svg>
			</span>
		{/snippet}
	</Primitive.YearSelect>
</span>
