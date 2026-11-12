export type NumberLimitEdge = "min" | "max";

/** The limit a key press runs into when the value already sits on it. */
export function limitHit(
	key: string,
	value: number | null,
	min?: number,
	max?: number,
): NumberLimitEdge | null {
	if (value === null) return null;
	if (
		max !== undefined &&
		value >= max &&
		(key === "ArrowUp" || key === "PageUp" || key === "End")
	)
		return "max";
	if (
		min !== undefined &&
		value <= min &&
		(key === "ArrowDown" || key === "PageDown" || key === "Home")
	)
		return "min";
	return null;
}

export const limitMessage = (edge: NumberLimitEdge, limit: string) =>
	edge === "max" ? `Maximum is ${limit}` : `Minimum is ${limit}`;

/** Restarts the group's shake, even when it is already playing. */
export function nudge(el: HTMLElement | null) {
	if (!el) return;
	el.dataset.nudge = "false";
	el.getBoundingClientRect();
	el.dataset.nudge = "true";
}

export const LIMIT_HINT_MS = 1500;
