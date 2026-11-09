<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import Separator from "$components/ui/separator/separator.svelte";
import { field } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLDivElement> & { ref?: HTMLDivElement | null } = $props();

const s = field();
</script>

<div
	bind:this={ref}
	data-slot="field-separator"
	data-content={Boolean(children)}
	class={cn(s.separator(), classProp)}
	{...rest}
>
	<Separator class="absolute inset-0 top-1/2" />
	{#if children}
		<span data-slot="field-separator-content" class={s.separatorContent()}>
			{@render children()}
		</span>
	{/if}
</div>
