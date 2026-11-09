/** Offset box of the pressed option, for an indicator that slides between options. */
export type PillBox = { x: number; y: number; w: number; h: number };

const PRESSED = '[data-pressed], [data-state="on"], [aria-pressed="true"]';

/** `el`'s box relative to its offset parent, the indicator's positioning context. */
export function offsetBox(el: HTMLElement): PillBox {
	return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
}

/** Where the indicator sits over the pressed option inside `track`, or null when none is. */
export function pressedBox(track: HTMLElement | null | undefined): PillBox | null {
	const active = track?.querySelector<HTMLElement>(PRESSED);
	return active ? offsetBox(active) : null;
}

/** Inline style that places the indicator; hidden until an option is pressed. */
export function pillStyle(box: PillBox | null): Record<string, string> {
	if (!box) return { opacity: "0" };
	return {
		translate: `${box.x}px ${box.y}px`,
		width: `${box.w}px`,
		height: `${box.h}px`,
	};
}

/** `pillStyle` as a `style` attribute string, for the Svelte port. */
export function pillCss(box: PillBox | null): string {
	return Object.entries(pillStyle(box))
		.map(([property, value]) => `${property}: ${value}`)
		.join("; ");
}
