<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type CardVariant, cardFrame } from "./variants";
import { type CardWellFooter, setCardWell } from "./context";

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
	"transition-[transform,scale,translate,border-color] duration-(--duration-base) ease-[var(--ease-ui-out)] hover:-translate-y-0.5 hover:border-border-strong motion-reduce:hover:translate-y-0";
const frame = $derived(cardFrame({ variant }));

let footer = $state<CardWellFooter>();
// svelte-ignore state_referenced_locally -- the variant picks the layout once, like the markup below
if (variant === "well")
	setCardWell({
		get footer() {
			return footer;
		},
		set footer(next) {
			footer = next;
		},
	});
</script>

{#if variant === "well"}
	<div data-slot="card" data-variant="well" {...rest} class={cn(frame.root(), interactive && LIFT, classProp)}>
		<div class={frame.body()}>
			{@render children?.()}
		</div>
		{#if footer}
			{@const { children: footerChildren, class: footerClass, ...footerRest } = footer}
			<div {...footerRest} data-slot="card-footer" class={cn("flex items-center gap-2 px-6 [.border-t]:pt-6", footerClass)}>
				{@render footerChildren?.()}
			</div>
		{/if}
	</div>
{:else if variant === "framed"}
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
