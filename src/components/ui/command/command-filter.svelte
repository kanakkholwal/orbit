<script lang="ts">
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import ToggleGroupItem from "$components/ui/toggle-group/toggle-group-item.svelte";
import Tooltip from "$components/ui/tooltip/tooltip.svelte";
import TooltipContent from "$components/ui/tooltip/tooltip-content.svelte";
import TooltipTrigger from "$components/ui/tooltip/tooltip-trigger.svelte";
import { getCommand } from "./context";

let {
	value,
	label,
	class: classProp,
	children,
}: {
	value: string;
	/** The tooltip and accessible name when the filter shows only an icon. */
	label: string;
	class?: string;
	children?: Snippet;
} = $props();

const command = getCommand();
const iconOnly = $derived(command.variant === "launcher");
</script>

<!-- An icon filter in the launcher, named by a tooltip; a text chip in spotlight. -->
{#if iconOnly}
	<Tooltip>
		<TooltipTrigger>
			{#snippet child({ props })}
				<ToggleGroupItem
					{...props}
					{value}
					aria-label={label}
					data-slot="command-filter"
					class={cn(command.styles.filter(), classProp)}
				>
					{@render children?.()}
				</ToggleGroupItem>
			{/snippet}
		</TooltipTrigger>
		<TooltipContent side="bottom">{label}</TooltipContent>
	</Tooltip>
{:else}
	<ToggleGroupItem
		{value}
		data-slot="command-filter"
		class={cn(command.styles.filter(), classProp)}
	>
		{@render children?.()}
	</ToggleGroupItem>
{/if}
