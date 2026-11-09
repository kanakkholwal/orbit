export type EmptyScene = "search" | "offline" | "inbox" | "map";
export type EmptyPhase = "idle" | "loading" | "done";
export type EmptyShapeKind = "tile" | "body" | "stroke" | "mark";
/** `geo` springs as one vector; `fx` holds opacity and how much of a stroke is drawn. */
export type EmptyShape = {
	kind: EmptyShapeKind;
	geo: number[];
	fx: [number, number];
	tone: string;
	redraw: boolean;
};
export type EmptyFrame = { prims: EmptyShape[]; label: string };

/** Ten primitives in one paint order for every scene, so a scene change only moves them. */
export const SHAPE_KINDS: EmptyShapeKind[] = [
	"tile",
	"tile",
	"body",
	"tile",
	"tile",
	"tile",
	"tile",
	"stroke",
	"stroke",
	"mark",
];
export const SCENE_VIEW = { width: 320, height: 216 };

type Pt = readonly [number, number];
type Seg = { len: number; at: (t: number) => Pt };

const N = 176;
const K = 40;
const M = 12;
const TAU = Math.PI * 2;
const RAD = Math.PI / 180;
const ORIGIN: Pt = [0, 0];

const num = (list: ArrayLike<number>, i: number) => list[i] ?? 0;
const pt = (list: readonly Pt[], i: number): Pt => list[i] ?? ORIGIN;

const seg = (a: Pt, b: Pt): Seg => {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	return { len: Math.hypot(dx, dy), at: (t) => [a[0] + dx * t, a[1] + dy * t] };
};

/** A clockwise arc from `from` to `to`, in radians. */
function arc(c: Pt, r: number, from: number, to: number): Seg {
	let end = to;
	while (end < from - 1e-9) end += TAU;
	const sweep = end - from;
	return {
		len: sweep * r,
		at: (t) => [
			c[0] + r * Math.cos(from + sweep * t),
			c[1] + r * Math.sin(from + sweep * t),
		],
	};
}
const arcDeg = (c: Pt, r: number, from: number, to: number) =>
	arc(c, r, from * RAD, to * RAD);
const polar = (c: Pt, r: number, deg: number): Pt => [
	c[0] + r * Math.cos(deg * RAD),
	c[1] + r * Math.sin(deg * RAD),
];

function chain(points: Pt[], closed = false) {
	const segs: Seg[] = [];
	const n = closed ? points.length : points.length - 1;
	for (let i = 0; i < n; i++)
		segs.push(seg(pt(points, i), pt(points, (i + 1) % points.length)));
	return segs;
}

/** A Catmull-Rom curve through the points, walked by arc length. */
function curve(points: Pt[]): Seg {
	const dense: Pt[] = [];
	for (let i = 0; i < points.length - 1; i++) {
		const p0 = pt(points, Math.max(0, i - 1));
		const p1 = pt(points, i);
		const p2 = pt(points, i + 1);
		const p3 = pt(points, Math.min(points.length - 1, i + 2));
		for (let s = 0; s < 16; s++) {
			const t = s / 16;
			const t2 = t * t;
			const t3 = t2 * t;
			const axis = (k: 0 | 1) =>
				0.5 *
				(2 * p1[k] +
					(p2[k] - p0[k]) * t +
					(2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
					(3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t3);
			dense.push([axis(0), axis(1)]);
		}
	}
	dense.push(pt(points, points.length - 1));
	const cum = [0];
	for (let i = 1; i < dense.length; i++) {
		const a = pt(dense, i - 1);
		const b = pt(dense, i);
		cum.push(num(cum, i - 1) + Math.hypot(b[0] - a[0], b[1] - a[1]));
	}
	const len = num(cum, cum.length - 1);
	return {
		len,
		at: (t) => {
			const goal = t * len;
			let i = 1;
			while (i < cum.length - 1 && num(cum, i) < goal) i++;
			const a = pt(dense, i - 1);
			const b = pt(dense, i);
			const u = (goal - num(cum, i - 1)) / (num(cum, i) - num(cum, i - 1) || 1);
			return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
		},
	};
}

/** Shares `n` points between segments by length; every segment starts on a point, so corners survive. */
function allot(lens: number[], n: number) {
	const total = lens.reduce((sum, len) => sum + len, 0);
	if (total < 1e-6) return lens.map((_, i) => (i === 0 ? n : 0));
	const exact = lens.map((len) => (len / total) * n);
	const counts = exact.map((value, i) =>
		num(lens, i) > 1e-6 ? Math.max(1, Math.floor(value)) : 0,
	);
	let sum = counts.reduce((a, b) => a + b, 0);
	while (sum < n) {
		let best = -1;
		for (let i = 0; i < counts.length; i++) {
			const gain = num(exact, i) - num(counts, i);
			if (
				num(lens, i) > 1e-6 &&
				(best < 0 || gain > num(exact, best) - num(counts, best))
			)
				best = i;
		}
		counts[best] = num(counts, best) + 1;
		sum++;
	}
	while (sum > n) {
		let best = -1;
		for (let i = 0; i < counts.length; i++) {
			const over = num(counts, i) - num(exact, i);
			if (num(counts, i) > 1 && (best < 0 || over > num(counts, best) - num(exact, best)))
				best = i;
		}
		counts[best] = num(counts, best) - 1;
		sum--;
	}
	return counts;
}

function sample(segs: Seg[], n: number, open: boolean) {
	const counts = allot(
		segs.map((s) => s.len),
		open ? n - 1 : n,
	);
	const out: number[] = [];
	segs.forEach((s, i) => {
		const count = num(counts, i);
		for (let j = 0; j < count; j++) out.push(...s.at(j / count));
	});
	const last = segs[segs.length - 1];
	if (open && last) out.push(...last.at(1));
	return out;
}

function rrect(
	x: number,
	y: number,
	w: number,
	h: number,
	radius: number | [number, number, number, number],
) {
	const [tl, tr, br, bl] =
		typeof radius === "number" ? [radius, radius, radius, radius] : radius;
	return [
		seg([x + tl, y], [x + w - tr, y]),
		arcDeg([x + w - tr, y + tr], tr, -90, 0),
		seg([x + w, y + tr], [x + w, y + h - br]),
		arcDeg([x + w - br, y + h - br], br, 0, 90),
		seg([x + w - br, y + h], [x + bl, y + h]),
		arcDeg([x + bl, y + h - bl], bl, 90, 180),
		seg([x, y + h - bl], [x, y + tl]),
		arcDeg([x + tl, y + tl], tl, 180, 270),
	];
}

type Lobe = { c: Pt; r: number };

/** Overlapping circles on a flat base; the outline walks each circle's exposed top. */
function cloud(lobes: Lobe[], base: number): Seg[] {
	const meet = (a: Lobe, b: Lobe): Pt => {
		const dx = b.c[0] - a.c[0];
		const dy = b.c[1] - a.c[1];
		const d = Math.hypot(dx, dy);
		const along = (a.r * a.r - b.r * b.r + d * d) / (2 * d);
		const h = Math.sqrt(Math.max(0, a.r * a.r - along * along));
		const mx = a.c[0] + (along * dx) / d;
		const my = a.c[1] + (along * dy) / d;
		const p: Pt = [mx + (h * dy) / d, my - (h * dx) / d];
		const q: Pt = [mx - (h * dy) / d, my + (h * dx) / d];
		return p[1] < q[1] ? p : q;
	};
	const angle = (c: Pt, p: Pt) => Math.atan2(p[1] - c[1], p[0] - c[0]);
	const joins = lobes.slice(1).flatMap((lobe, i) => {
		const prev = lobes[i];
		return prev ? [meet(prev, lobe)] : [];
	});
	const first = lobes[0];
	const last = lobes[lobes.length - 1];
	if (!first || !last) return [];
	const segs = [arc(first.c, first.r, -Math.PI / 2, angle(first.c, pt(joins, 0)))];
	for (let i = 1; i < lobes.length - 1; i++) {
		const lobe = lobes[i];
		if (lobe)
			segs.push(
				arc(lobe.c, lobe.r, angle(lobe.c, pt(joins, i - 1)), angle(lobe.c, pt(joins, i))),
			);
	}
	segs.push(arc(last.c, last.r, angle(last.c, pt(joins, joins.length - 1)), Math.PI / 2));
	segs.push(seg([last.c[0], base], [first.c[0], base]));
	segs.push(arc(first.c, first.r, Math.PI / 2, Math.PI * 1.5));
	return segs;
}

type TileOptions = { rot?: number; skew?: number; z?: number; o?: number };
const tile = (
	cx: number,
	cy: number,
	w: number,
	h: number,
	r: number,
	tone: string,
	{ rot = 0, skew = 0, z = 1, o = 1 }: TileOptions = {},
): EmptyShape => ({
	kind: "tile",
	geo: [cx, cy, w, h, r, rot, skew, z],
	fx: [o, 1],
	tone,
	redraw: false,
});
const box = (
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
	tone: string,
	options?: TileOptions,
) => tile(x + w / 2, y + h / 2, w, h, r, tone, options);
const disc = (c: Pt, r: number, tone: string, options?: TileOptions) =>
	tile(c[0], c[1], r * 2, r * 2, r, tone, options);
/** A shape a scene does not need shrinks into a point inside something that stays. */
const park = (c: Pt, z: number) => tile(c[0], c[1], 4, 4, 2, "tuck", { z, o: 0 });
const body = (segs: Seg[], z: number): EmptyShape => ({
	kind: "body",
	geo: [...sample(segs, N, false), z],
	fx: [1, 1],
	tone: "outline",
	redraw: false,
});

type StrokeOptions = {
	dash?: number;
	z?: number;
	z1?: number;
	o?: number;
	draw?: number;
	redraw?: boolean;
};
const line = (
	segs: Seg[],
	tone: string,
	{ dash = 0, z = 1, z1 = z, o = 1, draw = 1, redraw = false }: StrokeOptions = {},
): EmptyShape => ({
	kind: "stroke",
	geo: [...sample(segs, K, true), dash, z, z1],
	fx: [o, draw],
	tone,
	redraw,
});
const rest = (p: Pt, z: number) => line([seg(p, p)], "ink", { z, o: 0, draw: 0 });
const mark = (
	[a, b]: [Seg[], Seg[]],
	tone: string,
	{ z = 1, o = 1, draw = 1, redraw = true }: StrokeOptions = {},
): EmptyShape => ({
	kind: "mark",
	geo: [...sample(a, M, true), ...sample(b, M, true), 0, z, z],
	fx: [o, draw],
	tone,
	redraw,
});

function check(c: Pt, s: number): [Seg[], Seg[]] {
	const a: Pt = [c[0] - 0.42 * s, c[1] + 0.02 * s];
	const b: Pt = [c[0] - 0.12 * s, c[1] + 0.32 * s];
	const e: Pt = [c[0] + 0.44 * s, c[1] - 0.3 * s];
	return [[seg(a, b)], [seg(b, e)]];
}
const cross = (c: Pt, h: number): [Seg[], Seg[]] => [
	[seg([c[0] - h, c[1] - h], [c[0] + h, c[1] + h])],
	[seg([c[0] + h, c[1] - h], [c[0] - h, c[1] + h])],
];
const slashes = (c: Pt): [Seg[], Seg[]] => [
	[seg([c[0] - 10, c[1] + 5], [c[0] - 2, c[1] - 5])],
	[seg([c[0] + 2, c[1] + 5], [c[0] + 10, c[1] - 5])],
];
const glare = (c: Pt, r: number): [Seg[], Seg[]] => [
	[arcDeg(c, r, 196, 236)],
	[arcDeg(c, r, 248, 256)],
];

function search(phase: EmptyPhase): EmptyFrame {
	const card = body(rrect(58, 36, 172, 132, 18), 0.6);
	const tucked = [
		tile(144, 102, 96, 58, 14, "tuck", { z: 0.3 }),
		tile(144, 102, 120, 76, 16, "tuck", { z: 0.3 }),
	];
	if (phase !== "done") {
		const lens: Pt = [196, 118];
		return {
			label: "A magnifying glass over three empty result rows",
			prims: [
				...tucked,
				card,
				box(78, 64, 132, 20, 8, "slot", { z: 0.6 }),
				box(78, 92, 132, 20, 8, "slot", { z: 0.6 }),
				box(78, 120, 132, 20, 8, "slot", { z: 0.6 }),
				disc(lens, 30, "outline", { z: 1.6 }),
				line([seg(polar(lens, 30, 45), [244, 166])], "ink", { z: 1.6 }),
				rest([244, 166], 1.6),
				mark(glare(lens, 20), "muted", { z: 1.6 }),
			],
		};
	}
	const lens: Pt = [204, 61];
	return {
		label: "A results list with a search field and two results",
		prims: [
			...tucked,
			card,
			box(78, 56, 64, 10, 5, "query", { z: 0.6 }),
			box(78, 100, 128, 10, 5, "bar", { z: 0.6 }),
			box(78, 124, 96, 10, 5, "bar", { z: 0.6 }),
			disc(lens, 9, "outline", { z: 1 }),
			line([seg(polar(lens, 9, 45), polar(lens, 17, 45))], "ink", { z: 1 }),
			line([seg([58, 84], [230, 84])], "subtle", { z: 0.6 }),
			mark(glare(lens, 5), "muted", { z: 1, o: 0, draw: 0 }),
		],
	};
}

function offline(phase: EmptyPhase): EmptyFrame {
	const hub: Pt = [160, 92];
	const [top, bottom] =
		phase === "done" ? [146, 146] : phase === "loading" ? [141, 151] : [134, 158];
	const wire = phase === "loading" ? "accent" : "ink";
	return {
		label:
			phase === "done"
				? "A cloud joined to a device by an unbroken line, with a check on the device"
				: phase === "loading"
					? "The broken line reaching back toward the cloud"
					: "A cloud joined to a device by a broken line",
		prims: [
			tile(160, 92, 80, 30, 15, "tuck", { z: 0.3 }),
			tile(160, 92, 104, 36, 18, "tuck", { z: 0.3 }),
			body(
				cloud(
					[
						{ c: [100, 96], r: 22 },
						{ c: [140, 72], r: 34 },
						{ c: [188, 76], r: 28 },
						{ c: [220, 98], r: 20 },
					],
					118,
				),
				1.3,
			),
			park(hub, 1.3),
			park(hub, 1.3),
			park(hub, 1.3),
			box(
				134,
				168,
				52,
				34,
				9,
				phase === "done" ? "success" : phase === "loading" ? "accent" : "outline",
				{
					z: 0.7,
				},
			),
			line([seg([160, 118], [160, top])], wire, { z: 1.3, z1: 1 }),
			line([seg([160, bottom], [160, 168])], wire, { z: 1, z1: 0.7 }),
			phase === "done"
				? mark(check([160, 185], 18), "success", { z: 0.7 })
				: mark(slashes([160, 146]), "warning", {
						z: 1,
						draw: phase === "loading" ? 0 : 1,
					}),
		],
	};
}

function inbox(phase: EmptyPhase): EmptyFrame {
	const lift = phase === "loading" ? 1 : 0;
	const badge: Pt = [226, 84];
	const slot: Pt = [160, 140];
	return {
		label:
			phase === "loading"
				? "A stacked inbox while new mail is checked"
				: "A stacked inbox with a check mark",
		prims: [
			box(112, 72 - 8 * lift, 96, 40, 12, "back", { z: 0.25 }),
			box(100, 88 - 4 * lift, 120, 40, 12, "back", { z: 0.45 }),
			body(rrect(88, 104, 144, 72, [8, 8, 16, 16]), 0.7),
			park(slot, 0.7),
			park(slot, 0.7),
			park(slot, 0.7),
			disc(badge, 17, phase === "loading" ? "muted" : "success", { z: 1.5 }),
			line(
				chain([
					[88, 126],
					[124, 126],
					[133, 140],
					[187, 140],
					[196, 126],
					[232, 126],
				]),
				"ink",
				{ z: 0.7 },
			),
			rest(slot, 0.7),
			mark(check(badge, 16), "success", { z: 1.5, draw: phase === "loading" ? 0 : 1 }),
		],
	};
}

function map(phase: EmptyPhase): EmptyFrame {
	const start: Pt = [90, 142];
	const pin: Pt = [206, 110];
	const found = phase === "done";
	const route = found
		? curve([start, [114, 152], [140, 140], [160, 122], [182, 128], polar(pin, 10, 135)])
		: curve([start, [108, 124], [132, 130], [152, 108], [178, 100], [200, 84]]);
	return {
		label: found
			? "A folded map with a dashed route that ends at a checked destination"
			: phase === "loading"
				? "A folded map while the route is searched again"
				: "A folded map with a dashed route that ends in an x",
		prims: [
			tile(151, 107, 90, 56, 12, "tuck", { z: 0.3 }),
			tile(151, 107, 110, 70, 14, "tuck", { z: 0.3 }),
			body(
				chain(
					[
						[70, 62],
						[124, 48],
						[178, 62],
						[232, 48],
						[232, 152],
						[178, 166],
						[124, 152],
						[70, 166],
					],
					true,
				),
				0.8,
			),
			park(start, 0.8),
			tile(151, 107, 54, 104, 0, "shade", { skew: Math.atan2(14, 54) / RAD, z: 0.8 }),
			found ? disc(pin, 10, "success", { z: 0.8 }) : park(start, 0.8),
			disc(start, 4, "dot", { z: 0.8 }),
			line([route], "accent", {
				dash: 5,
				z: 0.8,
				draw: phase === "loading" ? 0 : 1,
				redraw: true,
			}),
			rest(start, 0.8),
			found
				? mark(check(pin, 10), "success", { z: 0.8 })
				: mark(cross([208, 76], 5), "ink", { z: 0.8, draw: phase === "loading" ? 0 : 1 }),
		],
	};
}

/** Point pairs in a primitive's geo; tiles keep their centre at 0..1, others end in z values. */
const pointCount = (p: EmptyShape) =>
	p.kind === "tile" ? 1 : (p.geo.length - (p.kind === "body" ? 1 : 3)) / 2;

function move(frame: EmptyFrame, dx: number, dy: number): EmptyFrame {
	return {
		...frame,
		prims: frame.prims.map((p) => {
			const geo = [...p.geo];
			for (let i = 0; i < pointCount(p); i++) {
				geo[2 * i] = num(geo, 2 * i) + dx;
				geo[2 * i + 1] = num(geo, 2 * i + 1) + dy;
			}
			return { ...p, geo };
		}),
	};
}

function center(frame: EmptyFrame) {
	let x0 = Number.POSITIVE_INFINITY;
	let y0 = Number.POSITIVE_INFINITY;
	let x1 = Number.NEGATIVE_INFINITY;
	let y1 = Number.NEGATIVE_INFINITY;
	const add = (x: number, y: number) => {
		x0 = Math.min(x0, x);
		y0 = Math.min(y0, y);
		x1 = Math.max(x1, x);
		y1 = Math.max(y1, y);
	};
	for (const p of frame.prims) {
		if (p.fx[0] < 0.01) continue;
		if (p.kind === "tile") {
			const [cx = 0, cy = 0, w = 0, h = 0] = p.geo;
			add(cx - w / 2, cy - h / 2);
			add(cx + w / 2, cy + h / 2);
			continue;
		}
		if (p.kind !== "body" && p.fx[1] < 0.01) continue;
		for (let i = 0; i < pointCount(p); i++) add(num(p.geo, 2 * i), num(p.geo, 2 * i + 1));
	}
	return [
		SCENE_VIEW.width / 2 - (x0 + x1) / 2,
		SCENE_VIEW.height / 2 - (y0 + y1) / 2,
	] as const;
}

const builders: Record<EmptyScene, (phase: EmptyPhase) => EmptyFrame> = {
	search,
	offline,
	inbox,
	map,
};

function sceneFrames(id: EmptyScene): Record<EmptyPhase, EmptyFrame> {
	const [dx, dy] = center(builders[id]("idle"));
	return {
		idle: move(builders[id]("idle"), dx, dy),
		loading: move(builders[id]("loading"), dx, dy),
		done: move(builders[id]("done"), dx, dy),
	};
}

/** Every frame is computed once at load, so server and first client render draw the same thing. */
export const SCENE_FRAMES: Record<EmptyScene, Record<EmptyPhase, EmptyFrame>> = {
	search: sceneFrames("search"),
	offline: sceneFrames("offline"),
	inbox: sceneFrames("inbox"),
	map: sceneFrames("map"),
};

const fmt = (v: number) => String(Math.round(v * 100) / 100);

function tilePath(g: ArrayLike<number>, ox: number, oy: number) {
	const w = Math.max(0, num(g, 2));
	const h = Math.max(0, num(g, 3));
	if (w < 0.05 || h < 0.05) return "";
	const r = Math.min(Math.max(0, num(g, 4)), w / 2, h / 2);
	const tan = Math.tan(num(g, 6) * RAD);
	const cos = Math.cos(num(g, 5) * RAD);
	const sin = Math.sin(num(g, 5) * RAD);
	const px = num(g, 0) + ox * num(g, 7);
	const py = num(g, 1) + oy * num(g, 7);
	const hw = w / 2;
	const hh = h / 2;
	const corners: [number, number, number][] = [
		[hw - r, -hh + r, -90],
		[hw - r, hh - r, 0],
		[-hw + r, hh - r, 90],
		[-hw + r, -hh + r, 180],
	];
	let d = "";
	for (const [cx, cy, start] of corners) {
		for (let s = 0; s <= 6; s++) {
			const a = (start + s * 15) * RAD;
			const x = cx + r * Math.cos(a);
			const y = cy + r * Math.sin(a) + x * tan;
			d += `${d ? "L" : "M"}${fmt(x * cos - y * sin + px)} ${fmt(x * sin + y * cos + py)}`;
		}
	}
	return `${d}Z`;
}

function span(g: ArrayLike<number>, from: number, count: number) {
	let len = 0;
	for (let i = from + 1; i < from + count; i++)
		len += Math.hypot(
			num(g, 2 * i) - num(g, 2 * i - 2),
			num(g, 2 * i + 1) - num(g, 2 * i - 1),
		);
	return len;
}

/** The first `budget` units of a polyline; each point drifts by its own depth between z0 and z1. */
function trace(
	g: ArrayLike<number>,
	from: number,
	count: number,
	budget: number,
	ox: number,
	oy: number,
	z0: number,
	z1: number,
	total: number,
) {
	if (budget <= 0.05) return "";
	const at = (i: number): Pt => {
		const z = z0 + (z1 - z0) * (total > 1 ? (from + i) / (total - 1) : 0);
		return [num(g, 2 * (from + i)) + ox * z, num(g, 2 * (from + i) + 1) + oy * z];
	};
	let [px, py] = at(0);
	let left = budget;
	let d = `M${fmt(px)} ${fmt(py)}`;
	for (let i = 1; i < count; i++) {
		const [x, y] = at(i);
		const len = Math.hypot(x - px, y - py);
		if (len >= left) {
			const u = len ? left / len : 0;
			return `${d}L${fmt(px + (x - px) * u)} ${fmt(py + (y - py) * u)}`;
		}
		left -= len;
		d += `L${fmt(x)} ${fmt(y)}`;
		px = x;
		py = y;
	}
	return d;
}

/** A primitive's current vector as path data, plus a dash pattern for strokes. */
export function sceneShapePath(
	kind: EmptyShapeKind,
	g: ArrayLike<number>,
	drawn: number,
	ox: number,
	oy: number,
) {
	if (kind === "tile") return { d: tilePath(g, ox, oy), dash: "none" };
	if (kind === "body") {
		const z = num(g, 2 * N);
		let d = "";
		for (let i = 0; i < N; i++)
			d += `${i ? "L" : "M"}${fmt(num(g, 2 * i) + ox * z)} ${fmt(num(g, 2 * i + 1) + oy * z)}`;
		return { d: `${d}Z`, dash: "none" };
	}
	const draw = Math.min(1, Math.max(0, drawn));
	const count = (g.length - 3) / 2;
	const gap = num(g, g.length - 3);
	const z0 = num(g, g.length - 2);
	const z1 = num(g, g.length - 1);
	const dash = gap > 0.2 ? `3 ${fmt(gap)}` : "none";
	if (kind === "stroke")
		return {
			d: trace(g, 0, count, draw * span(g, 0, count), ox, oy, z0, z1, count),
			dash,
		};
	const first = span(g, 0, M);
	const budget = draw * (first + span(g, M, M));
	return {
		d:
			trace(g, 0, M, Math.min(budget, first), ox, oy, z0, z1, 1) +
			trace(g, M, M, budget - first, ox, oy, z0, z1, 1),
		dash,
	};
}
