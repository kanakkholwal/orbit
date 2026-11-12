<script lang="ts">
import type { Snippet } from "svelte";
import { untrack } from "svelte";
import { cn } from "$lib/cn.js";
import { type CompareOrientation, createImageCompare } from "./compare";
import {
	type ImageCompareSize,
	type ImageCompareVariant,
	imageCompare,
} from "./variants";

let {
	before,
	after,
	position = $bindable(),
	defaultPosition = 50,
	onPositionChange,
	orientation = "horizontal",
	labels = ["Before", "After"],
	label = "Before and after",
	aspectRatio = "3 / 2",
	variant = "default",
	size = "default",
	hover = false,
	class: classProp,
}: {
	/** The original, left (or top). Render an image with its own alt; it covers the frame. */
	before: Snippet;
	/** The result, right (or bottom). */
	after: Snippet;
	/** Divider position in percent from the left (or top); bindable. */
	position?: number;
	defaultPosition?: number;
	onPositionChange?: (position: number) => void;
	/** `vertical` stacks the images; changing it swings the divider a quarter turn. */
	orientation?: CompareOrientation;
	/** Captions over each side, fading as the divider reaches them; `false` hides them. */
	labels?: [string, string] | false;
	/** Accessible name of the divider. */
	label?: string;
	/** Frame proportions, as a CSS aspect-ratio. */
	aspectRatio?: string;
	/** `default` capsule handle, `line` a small ring on the line, `overlay` larger captions. */
	variant?: ImageCompareVariant;
	size?: ImageCompareSize;
	/** A mouse moves the divider by hovering, without pressing; touch still drags. */
	hover?: boolean;
	class?: string;
} = $props();

const clamp = (v: number) => Math.min(100, Math.max(0, v));
// svelte-ignore state_referenced_locally -- seeds the uncontrolled position once
let internal = $state(defaultPosition);
const current = $derived(clamp(position ?? internal));
const afterShare = $derived(Math.round(100 - current));
let dragging = $state(false);
let quiet = $state(false);
let root = $state<HTMLDivElement>();
let engine: ReturnType<typeof createImageCompare> | null = null;
// Server and first paint only; after that the engine owns every inline style.
const first = untrack(() => ({ p: current, v: orientation === "vertical" }));

const options = $derived({
	orientation,
	onCommit: (next: number) => {
		if (position === undefined) internal = next;
		else position = next;
		onPositionChange?.(next);
	},
	onDragChange: (value: boolean) => {
		dragging = value;
	},
	onQuietChange: (value: boolean) => {
		quiet = value;
	},
	hover,
});

$effect(() => {
	const el = root;
	if (!el) return;
	const created = untrack(() => createImageCompare(el, current, options));
	engine = created;
	return () => {
		created.destroy();
		engine = null;
	};
});
$effect(() => {
	engine?.update(options);
});
$effect(() => {
	const next = current;
	untrack(() => engine?.set(next));
});

const s = $derived(imageCompare({ variant, size }));
</script>

{#snippet chevron(d: string)}
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path {d} stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
{/snippet}

<div
	bind:this={root}
	data-slot="image-compare"
	data-orientation={orientation}
	data-dragging={dragging || undefined}
	class={cn(s.root(), classProp)}
	style:aspect-ratio={aspectRatio}
>
	<div class={s.layer()}>{@render after()}</div>
	<div
		data-compare="before"
		class={s.layer()}
		style:clip-path={first.v ? `inset(0 0 ${100 - first.p}% 0)` : `inset(0 ${100 - first.p}% 0 0)`}
	>
		{@render before()}
	</div>
	{#if labels}
		<span data-compare="chip-before" class={s.chip()} aria-hidden="true">{labels[0]}</span>
		<span data-compare="chip-after" data-place="end" class={s.chip()} style:opacity={first.v ? 0 : 1} aria-hidden="true">
			{labels[1]}
		</span>
		<span data-compare="chip-bottom" data-place="bottom" class={s.chip()} style:opacity={first.v ? 1 : 0} aria-hidden="true">
			{labels[1]}
		</span>
	{/if}
	<div data-compare="pivot" class={s.pivot()} style:translate={first.v ? `50% ${first.p}%` : `${first.p}% 50%`}>
		<span data-compare="rotor" class={s.rotor()} style:rotate={first.v ? "90deg" : "0deg"}>
			<span class={s.line()}></span>
		</span>
		<span data-compare="handle-slot" class={s.slot()}>
			<div
				data-compare="handle"
				data-quiet={quiet || undefined}
				class={s.handle()}
				role="slider"
				tabindex="0"
				aria-label={label}
				aria-orientation={orientation}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={afterShare}
				aria-valuetext={`${afterShare}% after`}
			>
				<span data-compare="chevrons" class={s.chevrons()} style:rotate={first.v ? "90deg" : "0deg"} aria-hidden="true">
					<span class={s.chevron()}>{@render chevron("M10 3.5 5.5 8l4.5 4.5")}</span>
					<span class={s.chevron()}>{@render chevron("m6 3.5 4.5 4.5L6 12.5")}</span>
				</span>
			</div>
		</span>
	</div>
</div>
