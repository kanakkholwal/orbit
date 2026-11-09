export type TocDepth = 2 | 3;

export interface TocItem {
	/** Id of the heading element the link targets. */
	id: string;
	label: string;
	depth: TocDepth;
}

/** Inclusive index range of headings in view. */
export type TocRange = [number, number];

export interface TocRow {
	depth: TocDepth;
	/** Text box of the link, relative to the list. */
	top: number;
	bottom: number;
}

export interface TocTrack {
	width: number;
	height: number;
	d: string;
	rows: [top: number, bottom: number][];
	/** Distance along `d` where each row's straight run starts and ends. */
	lengths: [start: number, end: number][];
}

/** Horizontal rail position for a depth; sub-headings sit one step in. */
export const railX = (depth: TocDepth) => (depth <= 2 ? 8 : 16);

/** Left padding of a link, clearing its rail. */
export const itemPad = (depth: TocDepth) => (depth <= 2 ? 20 : 32);

type Point = [number, number];

function cubicLength(p0: Point, p1: Point, p2: Point, p3: Point, steps = 24): number {
	let length = 0;
	let prev = p0;
	for (let i = 1; i <= steps; i++) {
		const t = i / steps;
		const u = 1 - t;
		const x =
			u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0];
		const y =
			u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1];
		length += Math.hypot(x - prev[0], y - prev[1]);
		prev = [x, y];
	}
	return length;
}

/** One continuous rail through every row, bending between depths, with lengths per row. */
export function buildTrack(rows: TocRow[], curve: boolean): TocTrack | null {
	if (rows.length === 0) return null;
	let d = "";
	let total = 0;
	let width = 0;
	let height = 0;
	const out: TocTrack["rows"] = [];
	const lengths: TocTrack["lengths"] = [];
	let prev: { x: number; bottom: number } | null = null;
	for (const row of rows) {
		const x = railX(row.depth) + 0.5;
		const { top, bottom } = row;
		if (!prev) d += `M${x} ${top}`;
		else if (prev.x === x) {
			d += ` L${x} ${top}`;
			total += top - prev.bottom;
		} else if (curve) {
			d += ` C ${prev.x} ${top - 4} ${x} ${prev.bottom + 4} ${x} ${top}`;
			total += cubicLength(
				[prev.x, prev.bottom],
				[prev.x, top - 4],
				[x, prev.bottom + 4],
				[x, top],
			);
		} else {
			const mid = (prev.bottom + top) / 2;
			d += ` L${prev.x} ${mid} L${x} ${mid} L${x} ${top}`;
			total += top - prev.bottom + Math.abs(x - prev.x);
		}
		d += ` L${x} ${bottom}`;
		lengths.push([total, total + bottom - top]);
		total += bottom - top;
		out.push([top, bottom]);
		width = Math.max(width, x + 8);
		height = Math.max(height, bottom);
		prev = { x, bottom };
	}
	return { width, height, d, rows: out, lengths };
}

/** Faint per-link rail: the bend in from the previous depth, then a straight run. */
export function itemRail(items: TocItem[], index: number, curve: boolean) {
	const here = items[index]?.depth ?? 2;
	const l1 = railX(here);
	const l0 = index === 0 ? l1 : railX(items[index - 1]?.depth ?? here);
	const l2 = index === items.length - 1 ? l1 : railX(items[index + 1]?.depth ?? here);
	const bend =
		l0 === l1
			? null
			: curve
				? `M ${l0 + 0.5} 0 C ${l0 + 0.5} 8 ${l1 + 0.5} 4 ${l1 + 0.5} 12`
				: `M ${l0 + 0.5} 0 L ${l0 + 0.5} 6 L ${l1 + 0.5} 6 L ${l1 + 0.5} 12`;
	return { l0, l1, l2, bend };
}

/** Headings in view, or the last one scrolled past when none is. `tops` is null for missing ids. */
export function activeRange(
	tops: (number | null)[],
	offset: number,
	viewport: number,
): TocRange {
	const visible: number[] = [];
	let passed = 0;
	tops.forEach((top, i) => {
		if (top === null) return;
		if (top < offset) passed = i;
		else if (top < viewport - 40) visible.push(i);
	});
	return visible.length ? [visible[0] ?? 0, visible.at(-1) ?? 0] : [passed, passed];
}

/** The dot follows the leading edge: the top when the range moved up, else the bottom. */
export function movedUp(prev: TocRange | null, next: TocRange, wasUp: boolean): boolean {
	if (!prev) return false;
	return (
		next[0] < prev[0] ||
		next[1] < prev[1] ||
		(next[0] === prev[0] && next[1] === prev[1] && wasUp)
	);
}

/** Range covering the given ids, in item order; null when none match. */
export function rangeFromIds(items: TocItem[], ids: readonly string[]): TocRange | null {
	const indices = ids
		.map((id) => items.findIndex((item) => item.id === id))
		.filter((i) => i >= 0);
	return indices.length ? [Math.min(...indices), Math.max(...indices)] : null;
}

export const idsInRange = (items: TocItem[], range: TocRange) =>
	items.slice(range[0], range[1] + 1).map((item) => item.id);

/** Inline style for the accent layer: clip to the active rows and place the dot. */
export function thumbStyle(track: TocTrack, range: TocRange, up: boolean): string {
	const top = track.rows[range[0]]?.[0] ?? 0;
	const bottom = track.rows[range[1]]?.[1] ?? 0;
	const at = up ? track.lengths[range[0]]?.[0] : track.lengths[range[1]]?.[1];
	return `--track-top:${top}px;--track-bottom:${bottom}px;--offset-distance:${at ?? 0}px`;
}
