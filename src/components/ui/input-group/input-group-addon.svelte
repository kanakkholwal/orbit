<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import {
	focusGroupControl,
	type InputGroupAddonAlign,
	inputGroupAddon,
} from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	align = "inline-start",
	onclick,
	children,
	...rest
}: HTMLAttributes<HTMLDivElement> & {
	ref?: HTMLDivElement | null;
	align?: InputGroupAddonAlign;
} = $props();
</script>

<!-- A pointer convenience: the control inside is focusable itself. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	bind:this={ref}
	role="group"
	data-slot="input-group-addon"
	data-align={align}
	class={cn(inputGroupAddon({ align }), classProp)}
	onclick={(event) => {
		focusGroupControl(event.target, event.currentTarget);
		onclick?.(event);
	}}
	{...rest}
>
	{@render children?.()}
</div>
