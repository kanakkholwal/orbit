import { offsetBox, pillStyle } from "$lib/pill.js";

const CHECKED = '[data-checked], [data-state="checked"]';

/** Keeps `pill` over the row holding the checked radio, gliding once it has been placed. */
export function attachRadioPill(root: HTMLElement, pill: HTMLElement) {
	const place = () => {
		const row = root
			.querySelector(CHECKED)
			?.closest<HTMLElement>('[data-slot="radio-group-item"]');
		Object.assign(pill.style, { opacity: "", ...pillStyle(row ? offsetBox(row) : null) });
		requestAnimationFrame(() => {
			pill.dataset.ready = "true";
		});
	};
	place();
	const mo = new MutationObserver(place);
	mo.observe(root, {
		subtree: true,
		attributes: true,
		attributeFilter: ["data-checked", "data-state"],
	});
	const ro = new ResizeObserver(place);
	ro.observe(root);
	return () => {
		mo.disconnect();
		ro.disconnect();
	};
}
