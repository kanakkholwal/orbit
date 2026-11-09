<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import {
	NOTCHED_SHELF_PATHS,
	type NotchedShelfAlign,
	type NotchedShelfLayout,
	type NotchedShelfShape,
	type NotchedShelfSize,
	type NotchedShelfVariant,
	notchedShelf,
} from "./variants";

let {
	children,
	variant = "solid",
	layout = "hanging",
	size = "md",
	shape = "smooth",
	align = "center",
	edge = false,
	fill,
	stroke,
	class: className,
	...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
	children?: Snippet;
	variant?: NotchedShelfVariant;
	layout?: NotchedShelfLayout;
	size?: NotchedShelfSize;
	shape?: NotchedShelfShape;
	align?: NotchedShelfAlign;
	/** Continue the hairline along the rest of the edge, full width. */
	edge?: boolean;
	/** Text colour class overriding the variant's fill, e.g. `text-card` over a card surface. */
	fill?: string;
	/** Stroke colour class overriding the variant's hairline. */
	stroke?: string;
} = $props();

const styles = $derived(notchedShelf({ variant, layout, size, align, edge }));
const paths = $derived(NOTCHED_SHELF_PATHS[shape]);
</script>

{#snippet wing(mirrored: boolean)}
	<svg
		viewBox="0 0 85 64"
		fill="none"
		aria-hidden="true"
		data-slot="notched-shelf-wing"
		class={styles.wing({ mirrored })}
	>
		<rect x="0" y="0" width="85" height="1" fill="currentColor" transform="translate(0, -1)" />
		<path d={paths.fill} fill="currentColor" />
		<path
			d={paths.edge}
			fill="none"
			class={cn(styles.stroke(), stroke)}
			stroke-width="1"
			vector-effect="non-scaling-stroke"
		/>
	</svg>
{/snippet}

<div
	data-slot="notched-shelf"
	data-variant={variant}
	data-layout={layout}
	data-shape={shape}
	class={cn(styles.root(), fill, className)}
	{...rest}
>
	{#if edge}<span aria-hidden="true" class={styles.edge()}></span>{/if}
	{@render wing(false)}
	<!-- bg-current takes the fill; the colour reset sits one level in so it can't repaint the bar. -->
	<div class={styles.bar()}>
		<div class={styles.content()}>{@render children?.()}</div>
	</div>
	{@render wing(true)}
	{#if edge}<span aria-hidden="true" class={styles.edge()}></span>{/if}
</div>
