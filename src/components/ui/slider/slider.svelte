<script lang="ts">
import { Slider as SliderPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import {
	sliderInlineSplit,
	sliderLayout,
	sliderRulerOffset,
	sliderRulerTicks,
	sliderRulerValueAt,
	sliderThumbCenter,
	sliderWaveBars,
} from "./core";
import {
	type SliderMark,
	type SliderSize,
	type SliderVariant,
	slider,
	sliderPercent,
} from "./variants";

let {
	value = $bindable(50),
	min = 0,
	max = 100,
	step = 1,
	orientation: orientationProp = "horizontal",
	label,
	variant: variantProp = "default",
	size = "md",
	showValue = false,
	formatValue = (v: number) => String(v),
	marks = [],
	onValueChange,
	onValueCommit,
	disabled,
	class: classProp,
	...rest
}: Omit<
	SliderPrimitive.RootProps,
	| "type"
	| "value"
	| "min"
	| "max"
	| "step"
	| "onValueChange"
	| "onValueCommit"
	| "orientation"
> & {
	/** Bindable value; an array renders one thumb per entry. */
	value?: number | number[];
	min?: number;
	max?: number;
	step?: number;
	/** `default`, `track` and `bubble` go vertical; the other variants render horizontal. */
	orientation?: "horizontal" | "vertical";
	/** Accessible name; also the header title when `showValue` is on. */
	label?: string;
	/** `inline`, `fluid`, `wave` and `ruler` are single-thumb; a range falls back to `track`. */
	variant?: SliderVariant;
	size?: SliderSize;
	/** Header with the label and the live value. */
	showValue?: boolean;
	formatValue?: (value: number) => string;
	/** Ticks under the track; clicking one jumps there. */
	marks?: SliderMark[];
	onValueChange?: (value: number | number[]) => void;
	/** Fires once a drag or key press settles. */
	onValueCommit?: (value: number | number[]) => void;
} = $props();

const THUMB_WIDTH = 20;

const values = $derived(Array.isArray(value) ? value : [value]);
const layout = $derived(sliderLayout(variantProp, orientationProp, Array.isArray(value)));
const variant = $derived(layout.variant);
const orientation = $derived(layout.orientation);
const styles = $derived(slider({ variant, size }));
const first = $derived(values[0] ?? min);
const percent = $derived(sliderPercent(first, min, max));

function jumpTo(target: number) {
	if (!Array.isArray(value)) {
		value = target;
		onValueChange?.(target);
		return;
	}
	const list = value;
	const nearest = list.reduce(
		(best, v, i) =>
			Math.abs(v - target) < Math.abs((list[best] ?? 0) - target) ? i : best,
		0,
	);
	value = list.map((v, i) => (i === nearest ? target : v));
	onValueChange?.(value);
}

function setSingle(next: number) {
	if (next === first) return;
	value = next;
	onValueChange?.(next);
}

// bits-ui marks the active thumb on the DOM only; the wave crest needs it in render.
let dragging = $state(false);
$effect(() => {
	if (!dragging) return;
	const stop = () => (dragging = false);
	window.addEventListener("pointerup", stop);
	window.addEventListener("pointercancel", stop);
	return () => {
		window.removeEventListener("pointerup", stop);
		window.removeEventListener("pointercancel", stop);
	};
});

// Inline: the handle parts where it crosses the label or the value.
let control = $state<HTMLElement>();
let labelEl = $state<HTMLElement>();
let valueEl = $state<HTMLElement>();
let boxes = $state({ width: 0, label: [0, 0], value: [0, 0] });
$effect(() => {
	if (variant !== "inline" || !control) return;
	const node = control;
	const measure = () => {
		const origin = node.getBoundingClientRect().left;
		const span = (el?: HTMLElement) => {
			const r = el?.getBoundingClientRect();
			return r ? [r.left - origin, r.right - origin] : [0, 0];
		};
		boxes = { width: node.offsetWidth, label: span(labelEl), value: span(valueEl) };
	};
	measure();
	const observer = new ResizeObserver(measure);
	for (const el of [node, labelEl, valueEl]) if (el) observer.observe(el);
	return () => observer.disconnect();
});
const split = $derived(
	variant === "inline" && boxes.width
		? sliderInlineSplit(sliderThumbCenter(percent, boxes.width, THUMB_WIDTH), [
				{ start: boxes.label[0] ?? 0, end: boxes.label[1] ?? 0 },
				{ start: boxes.value[0] ?? 0, end: boxes.value[1] ?? 0 },
			])
		: 0,
);

// Ruler: the strip follows the pointer in px; the value snaps to the nearest step.
let drag: { id: number; x: number; offset: number } | null = null;
let stripOffset = $state<number | null>(null);
function onRulerDown(event: PointerEvent) {
	if (disabled || event.button !== 0) return;
	// bits-ui listens on the root; the ruler drives the value itself.
	event.stopPropagation();
	const target = event.currentTarget as HTMLElement;
	target.setPointerCapture(event.pointerId);
	drag = {
		id: event.pointerId,
		x: event.clientX,
		offset: sliderRulerOffset(first, min, step),
	};
	target.parentElement
		?.querySelector<HTMLElement>('[data-slot="slider-thumb"]')
		?.focus({ preventScroll: true });
}
function onRulerMove(event: PointerEvent) {
	if (!drag || drag.id !== event.pointerId) return;
	const lowest = sliderRulerOffset(max, min, step);
	stripOffset = Math.min(0, Math.max(lowest, drag.offset + event.clientX - drag.x));
	setSingle(sliderRulerValueAt(stripOffset, min, max, step));
}
function onRulerUp(event: PointerEvent) {
	if (drag?.id !== event.pointerId) return;
	drag = null;
	stripOffset = null;
	onValueCommit?.(first);
}
</script>

{#snippet body()}
	{#if showValue && variant !== "inline" && variant !== "fluid" && variant !== "ruler"}
		<div class={styles.header()}>
			<span class={styles.title()}>{label}</span>
			<span class={styles.value()}>{values.map(formatValue).join(" - ")}</span>
		</div>
	{/if}
	{#if variant === "ruler"}
		<div
			aria-hidden="true"
			class={styles.ruler()}
			onpointerdown={onRulerDown}
			onpointermove={onRulerMove}
			onpointerup={onRulerUp}
			onpointercancel={onRulerUp}
		>
			<div class={styles.rulerReadout()}>{formatValue(first)}</div>
			<div class={styles.rulerWindow()}>
				<div
					data-settling={stripOffset === null || undefined}
					class={styles.rulerStrip()}
					style:transform="translateX({stripOffset ?? sliderRulerOffset(first, min, step)}px)"
				>
					{#each sliderRulerTicks(min, max, step) as tick (tick.value)}
						<span class={styles.rulerTick()} style:left="{tick.offset}px">
							<span data-major={tick.major || undefined} class={styles.rulerTickLine()}></span>
							{#if tick.major}<span class={styles.rulerTickLabel()}>{tick.value}</span>{/if}
						</span>
					{/each}
				</div>
				<span class={styles.rulerNeedle()}></span>
			</div>
		</div>
	{/if}
	<!-- Only tracks the drag; the thumb carries role="slider" and the keyboard. -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={control}
		data-orientation={orientation}
		data-disabled={disabled || undefined}
		class={styles.control()}
		onpointerdown={() => (dragging = true)}
	>
		{#if variant === "fluid"}
			<div aria-hidden="true" class={styles.overlay()}>
				<span class={styles.inlineLabel()}>{label}</span>
				<span class={styles.inlineValue()}>{formatValue(first)}</span>
			</div>
		{/if}
		<span data-slot="slider-track" data-orientation={orientation} class={styles.track()}>
			<SliderPrimitive.Range data-slot="slider-range" class={styles.range()}>
				{#if variant === "fluid"}
					<span aria-hidden="true" class={styles.fillText()}>
						<span class={styles.inlineLabel()}>{label}</span>
						<span class={styles.inlineValue()}>{formatValue(first)}</span>
					</span>
				{/if}
			</SliderPrimitive.Range>
		</span>
		{#if variant === "inline"}
			<div aria-hidden="true" class={styles.overlay()}>
				<span bind:this={labelEl} class={styles.inlineLabel()}>{label}</span>
				<span bind:this={valueEl} class={styles.inlineValue()}>{formatValue(first)}</span>
			</div>
		{/if}
		{#if variant === "wave"}
			<div aria-hidden="true" class={styles.overlay()}>
				{#each sliderWaveBars(percent, dragging) as bar, i (i)}
					<span
						data-filled={bar.filled || undefined}
						class={styles.bar()}
						style:--bar-scale={bar.scale}
						style:transition-delay="{bar.delayMs}ms"
					></span>
				{/each}
			</div>
		{/if}
		{#each values as v, index (index)}
			<SliderPrimitive.Thumb
				{index}
				aria-label={label}
				aria-valuetext={formatValue(v)}
				data-slot="slider-thumb"
				class={styles.thumb()}
				style={variant === "inline" ? `--slider-split: ${split}` : undefined}
			>
				{#if variant === "bubble"}
					<span aria-hidden="true" class={styles.bubble()}>{formatValue(v)}</span>
				{/if}
			</SliderPrimitive.Thumb>
		{/each}
	</div>
	{#if marks.length > 0 && orientation === "horizontal" && variant !== "ruler"}
		<div class={styles.marks()}>
			{#each marks as mark (mark.value)}
				<span class={styles.mark()} style:left="{sliderPercent(mark.value, min, max)}%">
					<span aria-hidden="true" class={styles.markDot()}></span>
					{#if mark.label}
						<button
							type="button"
							{disabled}
							class={styles.markButton()}
							onclick={() => jumpTo(mark.value)}>{mark.label}</button
						>
					{/if}
				</span>
			{/each}
		</div>
	{/if}
{/snippet}

<!-- bits-ui's type/value form a discriminated union that can't narrow from a runtime variable. -->
{#if Array.isArray(value)}
	<SliderPrimitive.Root
		bind:value={value as number[]}
		type="multiple"
		{min}
		{max}
		{step}
		{orientation}
		{disabled}
		onValueChange={(next) => onValueChange?.(next)}
		onValueCommit={(next) => onValueCommit?.(next)}
		data-slot="slider"
		data-variant={variant}
		class={cn(styles.root(), classProp)}
		{...rest}
	>
		{@render body()}
	</SliderPrimitive.Root>
{:else}
	<SliderPrimitive.Root
		bind:value={value as number}
		type="single"
		{min}
		{max}
		{step}
		{orientation}
		{disabled}
		onValueChange={(next) => onValueChange?.(next)}
		onValueCommit={(next) => onValueCommit?.(next)}
		data-slot="slider"
		data-variant={variant}
		class={cn(styles.root(), classProp)}
		{...rest}
	>
		{@render body()}
	</SliderPrimitive.Root>
{/if}
