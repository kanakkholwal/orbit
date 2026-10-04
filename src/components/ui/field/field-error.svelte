<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type FieldErrorEntry, field, fieldErrorMessages } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	errors,
	children,
	...rest
}: HTMLAttributes<HTMLDivElement> & {
	ref?: HTMLDivElement | null;
	errors?: FieldErrorEntry[];
} = $props();

const messages = $derived(fieldErrorMessages(errors));
</script>

{#if children || messages.length}
	<div
		bind:this={ref}
		role="alert"
		data-slot="field-error"
		class={cn(field().error(), classProp)}
		{...rest}
	>
		{#if children}
			{@render children()}
		{:else if messages.length === 1}
			{messages[0]}
		{:else}
			<ul class="ml-4 flex list-disc flex-col gap-1">
				{#each messages as message (message)}
					<li>{message}</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
