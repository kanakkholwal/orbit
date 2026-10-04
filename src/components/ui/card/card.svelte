<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type CardVariant, cardFrame } from "./variants";

// Slot names and class shape follow shadcn-svelte, so this drops into an existing project.
let {
	children,
	class: classProp,
	interactive = false,
	variant = "default",
	...rest
}: {
	children?: Snippet;
	class?: string;
	interactive?: boolean;
	variant?: CardVariant;
} & HTMLAttributes<HTMLDivElement> = $props();

const LIFT =
	"transition-[transform,scale,translate,border-color] duration-(--duration-base) ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-border-strong motion-reduce:hover:translate-y-0";
const frame = $derived(cardFrame({ variant }));
</script>

{#if variant === "framed"}
	<!-- Inset frame, same treatment as Dialog: a rim in bg-background around a bg-card body. -->
	<div
		data-slot="card"
		data-variant="framed"
		{...rest}
		class={cn(frame.root(), interactive && LIFT, classProp)}
	>
		<div class={frame.body()}>
			{@render children?.()}
		</div>
	</div>
{:else}
	<div data-slot="card" {...rest} class={cn(frame.root(), frame.body(), interactive && LIFT, classProp)}>
		{@render children?.()}
	</div>
{/if}
