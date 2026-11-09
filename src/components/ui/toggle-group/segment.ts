import { pillStyle, pressedBox } from "$lib/pill.js";

/**
 * Keeps `indicator` over the pressed item: it follows pressed-state changes and resizes, and only
 * glides once placed, so the first paint never slides in from the corner.
 */
export function attachSegmentPill(root: HTMLElement, indicator: HTMLElement) {
	const place = () => {
		Object.assign(indicator.style, { opacity: "", ...pillStyle(pressedBox(root)) });
		requestAnimationFrame(() => {
			indicator.dataset.ready = "true";
		});
	};
	place();
	const mo = new MutationObserver(place);
	mo.observe(root, {
		subtree: true,
		attributes: true,
		attributeFilter: ["data-pressed", "data-state", "aria-pressed"],
	});
	const ro = new ResizeObserver(place);
	ro.observe(root);
	return () => {
		mo.disconnect();
		ro.disconnect();
	};
}
