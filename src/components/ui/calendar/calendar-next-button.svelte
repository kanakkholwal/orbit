<script lang="ts">
import { Calendar as Primitive } from "bits-ui";
import { type ButtonVariant, button } from "$components/ui/button/variants.js";
import { cn } from "$lib/cn.js";
import { calendar } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	children,
	variant = "ghost",
	...rest
}: Primitive.NextButtonProps & { variant?: ButtonVariant } = $props();
</script>

<Primitive.NextButton
	bind:ref
	class={cn(button({ variant, size: "icon" }), calendar().navButton(), classProp)}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
			<path d="m9 6 6 6-6 6" />
		</svg>
	{/if}
</Primitive.NextButton>
