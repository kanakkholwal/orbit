/** Distributes over a props union, so omitting the render slots keeps each branch separate. */
export type WithoutChildren<T> = T extends unknown
	? Omit<T, "child" | "children">
	: never;
