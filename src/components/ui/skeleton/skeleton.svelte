<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type SkeletonShape, skeleton, skeletonReveal } from "./variants";

let {
	width,
	height,
	shape = "line",
	loading,
	children,
	class: classProp,
	...rest
}: HTMLAttributes<HTMLDivElement> & {
	/** Overrides the class width; omit to size with classes. */
	width?: string;
	height?: string;
	shape?: SkeletonShape;
	/** With children: shows the placeholder in their shape, then crossfades to them once false. */
	loading?: boolean;
	children?: Snippet;
	class?: string;
} = $props();

const r = skeletonReveal();
const busy = $derived(loading ?? true);
</script>

{#if children}
	<div data-slot="skeleton-reveal" aria-busy={busy || undefined} class={cn(r.root(), classProp)} {...rest}>
		<div
			aria-hidden="true"
			data-slot="skeleton"
			data-loading={busy}
			style:width
			style:height
			class={cn(skeleton({ shape }), r.placeholder())}
		></div>
		<div data-loading={busy} inert={busy} class={r.content()}>{@render children()}</div>
	</div>
{:else}

<div
	aria-hidden="true"
	data-slot="skeleton"
	{...rest}
	style:width
	style:height
	class={cn(skeleton({ shape }), classProp)}
></div>
{/if}
