const seconds = (list: string) => list.split(",").map((v) => Number.parseFloat(v) || 0);

/** The longest running transition on `el`, in ms; 0 under reduced motion or none. */
export function transitionMs(el: Element): number {
	const style = getComputedStyle(el);
	const delays = seconds(style.transitionDelay);
	return Math.max(
		0,
		...seconds(style.transitionDuration).map((d, i) => (d + (delays[i] ?? 0)) * 1000),
	);
}
