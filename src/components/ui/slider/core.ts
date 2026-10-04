import type { SliderVariant } from "./variants";

/** Variants drawn around one value; a range (array value) falls back to `track`. */
export const SLIDER_SINGLE_THUMB_VARIANTS: readonly SliderVariant[] = [
	"inline",
	"fluid",
	"wave",
	"ruler",
];

/** Variants with a vertical layout; the rest carry text, bars or a scale and stay horizontal. */
export const SLIDER_VERTICAL_VARIANTS: readonly SliderVariant[] = [
	"default",
	"track",
	"bubble",
];

export function sliderLayout(
	variant: SliderVariant,
	orientation: "horizontal" | "vertical",
	isRange: boolean,
): { variant: SliderVariant; orientation: "horizontal" | "vertical" } {
	const resolved =
		isRange && SLIDER_SINGLE_THUMB_VARIANTS.includes(variant) ? "track" : variant;
	return {
		variant: resolved,
		orientation: SLIDER_VERTICAL_VARIANTS.includes(resolved) ? orientation : "horizontal",
	};
}

export const SLIDER_WAVE_BARS = 32;
/** Crest width in bars; larger spreads the bell wider. */
const WAVE_SPREAD = 2.6;

export type SliderWaveBar = { scale: number; filled: boolean; delayMs: number };

/** Gaussian crest centred on `percent`; bars rise further while dragging. */
export function sliderWaveBars(
	percent: number,
	dragging: boolean,
	bars = SLIDER_WAVE_BARS,
): SliderWaveBar[] {
	const head = (percent / 100) * (bars - 1);
	return Array.from({ length: bars }, (_, i) => {
		const distance = Math.abs(i - head);
		const crest = Math.exp(-(distance ** 2) / (2 * WAVE_SPREAD ** 2));
		return {
			scale: 0.22 + crest * (dragging ? 0.78 : 0.6),
			filled: i <= Math.round(head),
			delayMs: Math.min(distance * 12, 120),
		};
	});
}

/** Where a contained thumb's centre sits, in px from the control's start edge. */
export function sliderThumbCenter(
	percent: number,
	controlSize: number,
	thumbSize: number,
): number {
	return thumbSize / 2 + ((controlSize - thumbSize) * percent) / 100;
}

/** 0 to 1: how far the inline handle has parted, easing over 6px at each text edge. */
export function sliderInlineSplit(
	x: number,
	boxes: { start: number; end: number }[],
): number {
	return boxes.reduce(
		(most, box) =>
			Math.max(
				most,
				Math.max(0, Math.min(1, (x + 2 - box.start) / 6, (box.end + 2 - x) / 6)),
			),
		0,
	);
}

export const SLIDER_RULER_GAP = 14;
export const SLIDER_RULER_MAJOR_EVERY = 5;
/** Beyond this many steps the ruler stops drawing a tick per step. */
const RULER_MAX_TICKS = 400;

export type SliderRulerTick = { value: number; offset: number; major: boolean };

/** Tick per step (thinned past 400), plus `max` when the step doesn't divide the range. */
export function sliderRulerTicks(
	min: number,
	max: number,
	step: number,
): SliderRulerTick[] {
	const span = Number(((max - min) / step).toFixed(6));
	const whole = Math.floor(span);
	const stride = Math.max(1, Math.ceil(whole / RULER_MAX_TICKS));
	const ticks: SliderRulerTick[] = [];
	for (let i = 0; i <= whole; i += stride) {
		ticks.push({
			value: Number((min + i * step).toFixed(6)),
			offset: i * SLIDER_RULER_GAP,
			major: i % (SLIDER_RULER_MAJOR_EVERY * stride) === 0,
		});
	}
	if (span > whole)
		ticks.push({ value: max, offset: span * SLIDER_RULER_GAP, major: true });
	return ticks;
}

/** Strip offset in px that puts `value` under the needle. */
export function sliderRulerOffset(value: number, min: number, step: number): number {
	return -((value - min) / step) * SLIDER_RULER_GAP;
}

/** Nearest step to a strip offset, clamped to the bounds. */
export function sliderRulerValueAt(
	offset: number,
	min: number,
	max: number,
	step: number,
): number {
	const raw = min + (-offset / SLIDER_RULER_GAP) * step;
	const snapped = min + Math.round((raw - min) / step) * step;
	const clamped = Math.min(max, Math.max(min, snapped));
	// max may sit off the step grid (0 to 10 by 4); snap to it when it's the nearer end.
	const value = Math.abs(raw - max) < Math.abs(raw - clamped) ? max : clamped;
	return Number(value.toFixed(6));
}
