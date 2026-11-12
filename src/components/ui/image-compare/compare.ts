export type CompareOrientation = "horizontal" | "vertical";

export type CompareOptions = {
	orientation: CompareOrientation;
	/** Called with the settled position, 0 to 100; `live` during a drag, once per whole percent. */
	onCommit: (position: number, live: boolean) => void;
	onDragChange: (dragging: boolean) => void;
	onQuietChange: (quiet: boolean) => void;
	/** A mouse moves the divider just by hovering; touch and pen still drag. */
	hover: boolean;
};

type Spring = { stiffness: number; damping: number };
type Drag = {
	pointer: number;
	grab: number;
	press: boolean;
	started: boolean;
	x: number;
	y: number;
	raw: number;
};

/** A time-defined spring (visual duration, bounce) written as stiffness and damping. */
const physical = (duration: number, bounce: number): Spring => {
	const root = (2 * Math.PI) / (duration * 1.2);
	return { stiffness: root * root, damping: 2 * (1 - bounce) * root };
};
const MOVE = physical(0.3, 0);
const TURN = physical(0.45, 0.15);
/** Rubber-band travel past an edge, the handle's inset from the frame and how far it gives there. */
const STRETCH = 9;
const MARGIN = 42;
const GIVE = 12;
/** A key press at a limit kicks the divider this far, then springs back. */
const BUMP_PX = 150;
const INSET = 12;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rubber = (d: number) =>
	Math.sign(d) * (1 - 1 / ((Math.abs(d) * 0.55) / STRETCH + 1)) * STRETCH;
const give = (d: number) => GIVE * (1 - 1 / (d / GIVE + 1));
const soften = (at: number, size: number) =>
	at < MARGIN
		? MARGIN - give(MARGIN - at)
		: at > size - MARGIN
			? size - MARGIN + give(at - size + MARGIN)
			: at;
const fade = (room: number) => clamp(room / 28, 0, 1);

/** A value that springs toward a target, carrying velocity between hand-offs. */
function springValue(initial: number, onChange: () => void) {
	let value = initial;
	let velocity = 0;
	let frame = 0;
	return {
		get: () => value,
		velocity: () => velocity,
		jump(next: number) {
			cancelAnimationFrame(frame);
			frame = 0;
			value = next;
			velocity = 0;
			onChange();
		},
		set(next: number) {
			value = next;
			onChange();
		},
		animate(to: number, spring: Spring, v0 = 0) {
			cancelAnimationFrame(frame);
			velocity = v0;
			let then = performance.now();
			const tick = (now: number) => {
				const dt = Math.min(1 / 30, (now - then) / 1000);
				then = now;
				velocity += (-spring.stiffness * (value - to) - spring.damping * velocity) * dt;
				value += velocity * dt;
				if (Math.abs(value - to) < 0.002 && Math.abs(velocity) < 0.02) {
					value = to;
					velocity = 0;
					frame = 0;
					onChange();
					return;
				}
				onChange();
				frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		},
		stop() {
			cancelAnimationFrame(frame);
			frame = 0;
		},
	};
}

/** The before side of a line through `center` at `angle`, cut from the frame: the clip mid-turn. */
function halfPlane(w: number, h: number, center: [number, number], angle: number) {
	const nx = -Math.cos(angle);
	const ny = -Math.sin(angle);
	const side = ([x, y]: [number, number]) => (x - center[0]) * nx + (y - center[1]) * ny;
	const corners: [number, number][] = [
		[0, 0],
		[w, 0],
		[w, h],
		[0, h],
	];
	const points: [number, number][] = [];
	corners.forEach((corner, i) => {
		const next = corners[(i + 1) % 4] as [number, number];
		const a = side(corner);
		const b = side(next);
		if (a >= 0) points.push(corner);
		if (a >= 0 !== b >= 0) {
			const t = a / (a - b);
			points.push([
				corner[0] + (next[0] - corner[0]) * t,
				corner[1] + (next[1] - corner[1]) * t,
			]);
		}
	});
	return points.length
		? `polygon(${points.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(", ")})`
		: "inset(50%)";
}

/**
 * Drives a before/after divider: drag anywhere (1:1, rubber-banded edges), tap to spring there,
 * keys to step, double-click the handle to centre, and a quarter-turn swing between orientations.
 */
export function createImageCompare(
	root: HTMLElement,
	initial: number,
	opts: CompareOptions,
) {
	let options = opts;
	let latest = initial;
	let goal = initial;
	let drag: Drag | null = null;
	let pressedHandle = false;
	const metrics = { w: 0, h: 0, bw: 0, bh: 0, aw: 0, ah: 0 };
	const reduced = matchMedia("(prefers-reduced-motion: reduce)");
	const q = <T extends HTMLElement>(name: string) =>
		root.querySelector<T>(`[data-compare="${name}"]`);
	const before = q("before");
	const pivot = q("pivot");
	const rotor = q("rotor");
	const slot = q("handle-slot");
	const handle = q("handle");
	const chevrons = q("chevrons");
	const chipBefore = q("chip-before");
	const chipAfter = q("chip-after");
	const chipBottom = q("chip-bottom");

	const vertical = () => options.orientation === "vertical";
	// The divider is a committed position plus a catch-up offset: a press springs the offset to zero
	// while the pointer moves the position 1:1, so the divider glides to the finger and never trails it.
	const pos = springValue(initial, () => paint());
	const lag = springValue(0, () => paint());
	const theta = springValue(vertical() ? 90 : 0, () => paint());

	const turn = () => clamp(theta.get() / 90, 0, 1);
	const shown = () => pos.get() + lag.get();
	const center = (p: number): [number, number] => [
		lerp((p / 100) * metrics.w, metrics.w / 2, turn()),
		lerp(metrics.h / 2, (p / 100) * metrics.h, turn()),
	];

	function paint() {
		const angle = theta.get();
		const p = clamp(shown(), 0, 100);
		const atRest = angle === 0 || angle === 90 || !metrics.w;
		if (before) {
			before.style.clipPath = atRest
				? angle >= 45
					? `inset(0 0 ${(100 - p).toFixed(3)}% 0)`
					: `inset(0 ${(100 - p).toFixed(3)}% 0 0)`
				: halfPlane(metrics.w, metrics.h, center(p), (angle * Math.PI) / 180);
		}
		const [cx, cy] = center(shown());
		const px = atRest ? (angle >= 45 ? "50%" : `${shown()}%`) : `${cx}px`;
		const py = atRest ? (angle >= 45 ? `${shown()}%` : "50%") : `${cy}px`;
		if (pivot) pivot.style.translate = `${px} ${py}`;
		if (rotor) rotor.style.rotate = `${angle}deg`;
		if (chevrons) chevrons.style.rotate = `${angle}deg`;
		// The handle slows near an edge so it is never cut off and never stops dead.
		let offset = 0;
		if (metrics.w) {
			const x = (shown() / 100) * metrics.w;
			const y = (shown() / 100) * metrics.h;
			offset = lerp(soften(x, metrics.w) - x, soften(y, metrics.h) - y, turn());
		}
		const rad = (angle * Math.PI) / 180;
		if (slot)
			slot.style.translate = `${offset * Math.cos(rad)}px ${offset * Math.sin(rad)}px`;
		// Captions fade as the divider reaches them, and hand over mid-turn when "after" changes corner.
		const k = turn();
		const across = clamp(1 - k * 3, 0, 1);
		const down = clamp(k * 3 - 2, 0, 1);
		if (chipBefore)
			chipBefore.style.opacity = String(
				metrics.w
					? across * fade((p / 100) * metrics.w - (INSET + metrics.bw + 8)) +
							down * fade((p / 100) * metrics.h - (INSET + metrics.bh + 8))
					: across + down,
			);
		if (chipAfter)
			chipAfter.style.opacity = String(
				metrics.w
					? across * fade(metrics.w - INSET - metrics.aw - 8 - (p / 100) * metrics.w)
					: across,
			);
		if (chipBottom)
			chipBottom.style.opacity = String(
				metrics.w
					? down * fade(metrics.h - INSET - metrics.ah - 8 - (p / 100) * metrics.h)
					: down,
			);
	}

	const measure = () => {
		metrics.w = root.clientWidth;
		metrics.h = root.clientHeight;
		metrics.bw = chipBefore?.offsetWidth ?? 0;
		metrics.bh = chipBefore?.offsetHeight ?? 0;
		metrics.aw = chipAfter?.offsetWidth ?? 0;
		metrics.ah = chipAfter?.offsetHeight ?? 0;
		paint();
	};

	/** Springs the divider to a position from wherever it shows now. */
	function moveTo(next: number) {
		goal = Number(next.toFixed(2));
		const from = shown();
		lag.jump(0);
		pos.jump(from);
		if (reduced.matches) pos.jump(goal);
		else pos.animate(goal, MOVE);
	}

	function commit(next: number, live = false) {
		if (live && Math.round(next) === Math.round(latest)) return;
		const value = Number(next.toFixed(2));
		if (value === latest) return;
		latest = value;
		options.onCommit(value, live);
	}

	const percentAt = (event: PointerEvent) => {
		const rect = root.getBoundingClientRect();
		return vertical()
			? ((event.clientY - rect.top) / (rect.height || 1)) * 100
			: ((event.clientX - rect.left) / (rect.width || 1)) * 100;
	};
	const axisSize = () => {
		const rect = root.getBoundingClientRect();
		return (vertical() ? rect.height : rect.width) || 1;
	};
	/** Focus that follows a pointer keeps the handle quiet: no ring until a key is pressed. */
	const focusQuietly = () => {
		if (!handle || document.activeElement === handle) return;
		options.onQuietChange(true);
		handle.focus({ preventScroll: true });
	};

	function follow(state: Drag, at: number, first = false) {
		const raw = at - state.grab;
		const size = axisSize();
		const edge = clamp(raw, 0, 100);
		const placed = reduced.matches
			? edge
			: edge + (rubber(((raw - edge) / 100) * size) / size) * 100;
		state.raw = raw;
		if (first && state.press && !reduced.matches) {
			const from = pos.get();
			pos.jump(placed);
			lag.jump(from - placed);
			lag.animate(0, MOVE);
		} else pos.set(placed);
		commit(edge, true);
	}

	function start(state: Drag, at: number) {
		const from = shown();
		state.started = true;
		state.grab = state.press ? 0 : at - from;
		lag.jump(0);
		pos.jump(from);
		options.onDragChange(true);
		focusQuietly();
		follow(state, at, true);
	}

	const onPointerDown = (event: PointerEvent) => {
		if (event.button !== 0 || !event.isPrimary) return;
		const onHandle = !!(event.target as HTMLElement).closest('[data-compare="handle"]');
		pressedHandle = onHandle;
		root.setPointerCapture(event.pointerId);
		const state: Drag = {
			pointer: event.pointerId,
			grab: 0,
			press: !onHandle,
			started: false,
			x: event.clientX,
			y: event.clientY,
			raw: 0,
		};
		drag = state;
		// A finger on the photo might be scrolling the page, so it waits for a sideways drag.
		if (event.pointerType !== "touch" || onHandle) start(state, percentAt(event));
	};

	const onPointerMove = (event: PointerEvent) => {
		const state = drag;
		if (!state && options.hover && event.pointerType === "mouse") {
			const at = clamp(percentAt(event), 0, 100);
			goal = at;
			lag.jump(0);
			pos.jump(at);
			commit(at, true);
			return;
		}
		if (!state || state.pointer !== event.pointerId) return;
		if (!state.started) {
			const along = Math.abs(
				vertical() ? event.clientY - state.y : event.clientX - state.x,
			);
			const across = Math.abs(
				vertical() ? event.clientX - state.x : event.clientY - state.y,
			);
			if (along < 6 && across < 6) return;
			if (across > along) {
				drag = null;
				return;
			}
			start(state, percentAt(event));
			return;
		}
		follow(state, percentAt(event));
	};

	const onPointerEnd = (event: PointerEvent) => {
		const state = drag;
		if (!state || state.pointer !== event.pointerId) return;
		drag = null;
		if (!state.started) {
			if (event.type === "pointerup") {
				focusQuietly();
				const at = clamp(percentAt(event), 0, 100);
				commit(at);
				moveTo(at);
			}
			return;
		}
		// The divider stays where it was let go; past an edge, or still catching up, it springs on.
		const from = shown();
		const velocity = lag.velocity() + (from > 100 || from < 0 ? pos.velocity() : 0);
		const target = clamp(lag.get() !== 0 ? state.raw : from, 0, 100);
		lag.jump(0);
		pos.jump(from);
		goal = Number(target.toFixed(2));
		if (from !== target) {
			if (reduced.matches) pos.jump(target);
			else pos.animate(target, MOVE, velocity);
		}
		commit(target);
		options.onDragChange(false);
	};

	const onKeyDown = (event: KeyboardEvent) => {
		const step = event.shiftKey ? 10 : 1;
		// Keys move the divider the way they point; the other pair follows the value (more "after").
		const toward: Record<string, number> = vertical()
			? {
					ArrowUp: -step,
					ArrowDown: step,
					ArrowRight: -step,
					ArrowLeft: step,
					PageUp: -10,
					PageDown: 10,
				}
			: {
					ArrowLeft: -step,
					ArrowRight: step,
					ArrowUp: -step,
					ArrowDown: step,
					PageUp: -10,
					PageDown: 10,
				};
		let next: number;
		if (event.key === "Home") next = 100;
		else if (event.key === "End") next = 0;
		else if (event.key in toward) next = Math.round(latest) + (toward[event.key] ?? 0);
		else return;
		event.preventDefault();
		options.onQuietChange(false);
		const clamped = clamp(next, 0, 100);
		if (clamped === latest) {
			if (!reduced.matches && next !== clamped)
				pos.animate(
					goal,
					TURN,
					((Math.sign(next - clamped) * BUMP_PX) / axisSize()) * 100,
				);
			return;
		}
		commit(clamped);
		moveTo(clamped);
	};

	const onDoubleClick = () => {
		if (!pressedHandle || latest === 50) return;
		commit(50);
		moveTo(50);
	};
	const prevent = (event: Event) => event.preventDefault();
	const onBlur = () => options.onQuietChange(false);

	root.addEventListener("pointerdown", onPointerDown);
	root.addEventListener("pointermove", onPointerMove);
	root.addEventListener("pointerup", onPointerEnd);
	root.addEventListener("pointercancel", onPointerEnd);
	root.addEventListener("lostpointercapture", onPointerEnd);
	root.addEventListener("mousedown", prevent);
	root.addEventListener("dragstart", prevent);
	root.addEventListener("dblclick", onDoubleClick);
	handle?.addEventListener("keydown", onKeyDown);
	handle?.addEventListener("blur", onBlur);
	const observer = new ResizeObserver(measure);
	for (const node of [root, chipBefore, chipAfter]) if (node) observer.observe(node);
	measure();

	return {
		/** A position from outside a drag (props, keys, double-click) springs the divider there. */
		set(next: number) {
			// The engine's own commits echo back through the framework; only outside changes move it.
			if (drag?.started || next === latest) return;
			latest = next;
			moveTo(next);
		},
		update(next: CompareOptions) {
			const turned = next.orientation !== options.orientation;
			options = next;
			if (!turned) return;
			const target = vertical() ? 90 : 0;
			if (reduced.matches) theta.jump(target);
			else theta.animate(target, TURN);
		},
		destroy() {
			pos.stop();
			lag.stop();
			theta.stop();
			observer.disconnect();
			root.removeEventListener("pointerdown", onPointerDown);
			root.removeEventListener("pointermove", onPointerMove);
			root.removeEventListener("pointerup", onPointerEnd);
			root.removeEventListener("pointercancel", onPointerEnd);
			root.removeEventListener("lostpointercapture", onPointerEnd);
			root.removeEventListener("mousedown", prevent);
			root.removeEventListener("dragstart", prevent);
			root.removeEventListener("dblclick", onDoubleClick);
			handle?.removeEventListener("keydown", onKeyDown);
			handle?.removeEventListener("blur", onBlur);
		},
	};
}
