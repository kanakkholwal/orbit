<script lang="ts">
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { menu } from "$lib/menu.js";

let {
	class: classProp,
	checked = $bindable(false),
	children: label,
	closeOnSelect = false,
	...rest
}: Omit<DropdownMenuPrimitive.CheckboxItemProps, "children"> & {
	children?: Snippet;
} = $props();

const styles = menu();
</script>

<DropdownMenuPrimitive.CheckboxItem
	bind:checked
	{closeOnSelect}
	{...rest}
	data-slot="dropdown-menu-checkbox-item"
	data-inset=""
	class={cn(styles.item(), classProp)}
>
	{#snippet children({ checked: on })}
		<span class={styles.indicator()}>
			<!-- Always mounted so the tick can draw in and back out. -->
			<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" data-on={on} class={styles.check()}>
				<path
					d="m3.5 8.5 3 3 6-7"
					pathLength="1"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</span>
		{@render label?.()}
	{/snippet}
</DropdownMenuPrimitive.CheckboxItem>
