import {
	type EmptyFrame,
	type EmptyPhase,
	type EmptyScene,
	SCENE_FRAMES,
	SHAPE_KINDS,
	sceneShapePath,
} from "./art";

// Shapes lead and details trail: back tiles, body, front tiles, then strokes and the mark.
const DELAY = [0.05, 0.03, 0, 0.04, 0.07, 0.1, 0.06, 0.09, 0.11, 0.14];
const NUDGE = [0.03, 0.015, 0, 0.02, 0.035, 0.05, 0.02, 0.04, 0.05, 0.07];
const DRIFT = 2.5;

/** A spring's visual duration and bounce as stiffness and damping. */
function springOf(visualDuration: number, bounce: number) {
	const root = (2 * Math.PI) / (visualDuration * 1.2);
	return { k: root * root, c: 2 * Math.min(1, Math.max(0.05, 1 - bounce)) * root };
}
const MORPH = springOf(0.42, 0.16);
const SMOOTH = springOf(0.4, 0);
const SWAY = { k: 90, c: 19 };

type Channel = {
	pos: Float64Array;
	vel: Float64Array;
	target: Float64Array;
	queue: { at: number; values: number[] }[];
	k: number;
	c: number;
	still: boolean;
};

const channel = (values: number[], spring: { k: number; c: number }): Channel => ({
	pos: Float64Array.from(values),
	vel: new Float64Array(values.length),
	target: Float64Array.from(values),
	queue: [],
	...spring,
	still: true,
});

/** Integrates one spring vector; a new target keeps the velocity, so shapes retarget mid-flight. */
function advance(ch: Channel, now: number, dt: number) {
	for (let next = ch.queue[0]; next && next.at <= now; next = ch.queue[0]) {
		ch.queue.shift();
		ch.target.set(next.values);
		ch.still = false;
	}
	if (!ch.still) {
		const steps = Math.max(1, Math.ceil(dt * 240));
		const h = dt / steps;
		const { pos, vel, target, k, c } = ch;
		for (let s = 0; s < steps; s++) {
			for (let i = 0; i < pos.length; i++) {
				const v =
					(vel[i] ?? 0) +
					(-k * ((pos[i] ?? 0) - (target[i] ?? 0)) - c * (vel[i] ?? 0)) * h;
				vel[i] = v;
				pos[i] = (pos[i] ?? 0) + v * h;
			}
		}
		let settled = true;
		for (let i = 0; i < pos.length; i++) {
			if (
				Math.abs((pos[i] ?? 0) - (target[i] ?? 0)) > 0.004 ||
				Math.abs(vel[i] ?? 0) > 0.02
			) {
				settled = false;
				break;
			}
		}
		if (settled) {
			pos.set(target);
			vel.fill(0);
			ch.still = true;
		}
	}
	return !ch.still || ch.queue.length > 0;
}

export const initialShapes = (scene: EmptyScene, phase: EmptyPhase) =>
	SCENE_FRAMES[scene][phase].prims.map((p, i) => ({
		...sceneShapePath(SHAPE_KINDS[i] ?? "tile", p.geo, p.fx[1], 0, 0),
		opacity: String(p.fx[0]),
		tone: p.tone,
	}));

/** One frame loop drives every path through the DOM; it sleeps once everything settles. */
export function createIllustration(paths: SVGPathElement[], start: EmptyFrame) {
	const geo = start.prims.map((p) => channel(p.geo, MORPH));
	const fx = start.prims.map((p) => channel(p.fx, SMOOTH));
	const sway = channel([0, 0], SWAY);
	let raf = 0;
	let last = 0;
	const paint = () => {
		const ox = (sway.pos[0] ?? 0) * DRIFT;
		const oy = (sway.pos[1] ?? 0) * DRIFT;
		paths.forEach((node, i) => {
			const g = geo[i];
			const f = fx[i];
			if (!g || !f) return;
			const { d, dash } = sceneShapePath(
				SHAPE_KINDS[i] ?? "tile",
				g.pos,
				f.pos[1] ?? 0,
				ox,
				oy,
			);
			const opacity = String(
				Math.round(Math.min(1, Math.max(0, f.pos[0] ?? 0)) * 1000) / 1000,
			);
			if (node.getAttribute("d") !== d) node.setAttribute("d", d);
			if (node.getAttribute("opacity") !== opacity) node.setAttribute("opacity", opacity);
			if (node.getAttribute("stroke-dasharray") !== dash)
				node.setAttribute("stroke-dasharray", dash);
		});
	};
	const tick = (time: number) => {
		raf = 0;
		const now = time / 1000;
		const dt = last ? Math.min(0.034, Math.max(0, now - last)) : 1 / 60;
		last = now;
		let busy = advance(sway, now, dt);
		for (const ch of [...geo, ...fx]) busy = advance(ch, now, dt) || busy;
		paint();
		if (busy) raf = requestAnimationFrame(tick);
		else last = 0;
	};
	const kick = () => {
		if (!raf) raf = requestAnimationFrame(tick);
	};
	return {
		/** Parallax drift from a pointer position in -1..1 on each axis. */
		pointer(x: number, y: number) {
			sway.queue = [];
			sway.target.set([x, y]);
			sway.still = false;
			kick();
		},
		go(next: EmptyFrame, sceneChanged: boolean, reduced: boolean) {
			paths.forEach((node, i) => {
				node.dataset.tone = next.prims[i]?.tone ?? "";
			});
			if (reduced) {
				next.prims.forEach((p, i) => {
					for (const [ch, values] of [
						[geo[i], p.geo],
						[fx[i], p.fx],
					] as const) {
						if (!ch) continue;
						ch.queue = [];
						ch.target.set(values);
						ch.pos.set(values);
						ch.vel.fill(0);
						ch.still = true;
					}
				});
				paint();
				return;
			}
			const now = performance.now() / 1000;
			const delays = sceneChanged ? DELAY : NUDGE;
			next.prims.forEach((p, i) => {
				const delay = delays[i] ?? 0;
				const g = geo[i];
				const f = fx[i];
				if (!g || !f) return;
				g.queue = [{ at: now + delay, values: p.geo }];
				// A stroke the new scene redraws first wipes, then draws in a beat after the shapes land.
				if (sceneChanged && p.redraw)
					f.queue = [
						{ at: now, values: [p.fx[0], 0] },
						{ at: now + delay + 0.18, values: p.fx },
					];
				else
					f.queue = [
						{
							at: now + delay + (p.fx[1] > (f.target[1] ?? 0) + 0.01 ? 0.12 : 0),
							values: p.fx,
						},
					];
			});
			kick();
		},
		destroy() {
			if (raf) cancelAnimationFrame(raf);
			raf = 0;
		},
	};
}
