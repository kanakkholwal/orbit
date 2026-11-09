/** Nearest ancestor that actually scrolls: a fixed rail and a drawer wrap the nav differently. */
function scrollParent(el: HTMLElement): HTMLElement | null {
	let node = el.parentElement;
	while (node) {
		const style = getComputedStyle(node);
		if (
			(style.overflowY === "auto" || style.overflowY === "scroll") &&
			node.scrollHeight > node.clientHeight
		) {
			return node;
		}
		node = node.parentElement;
	}
	return null;
}

/** Centres the current link in its scroller, only when it sits meaningfully off-centre. */
export function revealCurrent(root: HTMLElement | null | undefined) {
	const current = root?.querySelector<HTMLElement>('a[aria-current="page"]');
	if (!current) return undefined;
	let content: HTMLElement | null = null;
	let frame = 0;
	const reveal = () => {
		const viewport = scrollParent(current);
		if (!viewport) return;
		const box = viewport.getBoundingClientRect();
		const row = current.getBoundingClientRect();
		const offset = row.top - box.top - box.height / 2 + row.height / 2;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (Math.abs(offset) > 40)
			viewport.scrollBy({ top: offset, behavior: reduced ? "auto" : "smooth" });
	};
	const onTransitionEnd = (event: TransitionEvent) => {
		if (event.propertyName === "grid-template-rows") reveal();
	};
	frame = requestAnimationFrame(() => {
		reveal();
		content = current.closest<HTMLElement>('[data-slot="collapsible-content"]');
		content?.addEventListener("transitionend", onTransitionEnd);
	});
	return () => {
		cancelAnimationFrame(frame);
		content?.removeEventListener("transitionend", onTransitionEnd);
	};
}
