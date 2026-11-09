/** Past its ends the track still follows the pointer, but every pixel costs more. */
const rubberBand = (over: number, size: number) =>
	(1 - 1 / ((over * 0.55) / size + 1)) * size * 0.12;
const SETTLE = "scale 420ms var(--ease-spring-snappy, cubic-bezier(0.2, 1, 0.3, 1))";

/**
 * Stretches `control` like elastic when a drag pulls past either end, anchored at the far edge,
 * and springs it back on release. The value itself stays clamped by the slider.
 */
export function attachElastic(control: HTMLElement, vertical: () => boolean): () => void {
	let active: number | null = null;
	const reduced = matchMedia("(prefers-reduced-motion: reduce)");

	const reset = () => {
		control.style.transition = reduced.matches ? "none" : SETTLE;
		control.style.scale = "";
	};
	const onDown = (event: PointerEvent) => {
		if (event.button !== 0 || control.hasAttribute("data-disabled")) return;
		active = event.pointerId;
		control.style.transition = "none";
	};
	const onMove = (event: PointerEvent) => {
		if (active !== event.pointerId || reduced.matches) return;
		const box = control.getBoundingClientRect();
		const axisVertical = vertical();
		const size = axisVertical ? box.height : box.width;
		const pos = axisVertical ? event.clientY : event.clientX;
		const start = axisVertical ? box.top : box.left;
		const end = axisVertical ? box.bottom : box.right;
		const over = pos < start ? start - pos : pos > end ? pos - end : 0;
		if (!over) {
			control.style.scale = "";
			return;
		}
		const stretch = 1 + rubberBand(over, size) / size;
		// Anchor the edge away from the pull, so the near end reaches toward the pointer.
		const before = pos < start;
		control.style.transformOrigin = axisVertical
			? `50% ${before ? "100%" : "0%"}`
			: `${before ? "100%" : "0%"} 50%`;
		control.style.scale = axisVertical
			? `1 ${stretch.toFixed(4)}`
			: `${stretch.toFixed(4)} 1`;
	};
	const onUp = (event: PointerEvent) => {
		if (active !== event.pointerId) return;
		active = null;
		reset();
	};

	control.addEventListener("pointerdown", onDown);
	// Capture phase: the slider primitive stops these from bubbling while it drags.
	window.addEventListener("pointermove", onMove, true);
	window.addEventListener("pointerup", onUp, true);
	window.addEventListener("pointercancel", onUp, true);
	return () => {
		control.removeEventListener("pointerdown", onDown);
		window.removeEventListener("pointermove", onMove, true);
		window.removeEventListener("pointerup", onUp, true);
		window.removeEventListener("pointercancel", onUp, true);
		control.style.scale = "";
	};
}
