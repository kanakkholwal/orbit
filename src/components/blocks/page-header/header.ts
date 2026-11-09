/** The nearest ancestor that scrolls vertically, or null for the page itself. */
export function scrollParent(el: HTMLElement): HTMLElement | null {
	for (let node = el.parentElement; node; node = node.parentElement) {
		const { overflowY } = getComputedStyle(node);
		if (
			(overflowY === "auto" || overflowY === "scroll") &&
			node.scrollHeight > node.clientHeight
		)
			return node;
	}
	return null;
}

/** Calls `onChange` with whether the sentinel has left through the top of its scroll container. */
export function watchCondensed(
	sentinel: HTMLElement,
	onChange: (condensed: boolean) => void,
) {
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry)
				onChange(
					!entry.isIntersecting &&
						entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0),
				);
		},
		{ root: scrollParent(sentinel) },
	);
	observer.observe(sentinel);
	return () => observer.disconnect();
}
