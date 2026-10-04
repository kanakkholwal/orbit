import { tv } from "tailwind-variants";

// `fixed top-0 left-0` needs a Base UI/bits-ui Positioner wrapper's content back to
// `static`, or it can't measure it.
const ANCHORED_BASE = [
	"fixed top-0 left-0 z-50 pointer-events-none opacity-0",
	// Plain `ease`: 150ms in, 100ms out.
	"duration-[var(--duration-exit)] ease-[var(--ease-smooth)]",
	"data-[state=open]:pointer-events-auto data-[state=open]:opacity-100",
	"data-[state=open]:duration-[var(--duration-dropdown)]",
	// The first open mounts the element already open, so only @starting-style can animate it.
	"starting:data-[state=open]:opacity-0",
	"motion-reduce:transition-none",
];

/**
 * Class contract every anchored surface shares, so a popover, a menu and a select
 * open and close identically. bits-ui only sets the origin variable, so apply it here.
 */
export const ANCHORED = tv({
	base: [
		...ANCHORED_BASE,
		"origin-(--bits-floating-transform-origin) scale-[var(--popover-exit-scale)] transition-[opacity,scale,translate]",
		// The closed state leans toward its trigger, so opening reads as unfolding from it.
		// `side` is bits-ui's own popper attribute.
		"data-[state=closed]:data-[placement^=bottom]:-translate-y-1",
		"data-[state=closed]:data-[placement^=top]:translate-y-1",
		"data-[state=closed]:data-[side=bottom]:-translate-y-1",
		"data-[state=closed]:data-[side=top]:translate-y-1",
		"data-[state=open]:scale-100",
		"starting:data-[state=open]:scale-[var(--popover-enter-scale)]",
		"starting:data-[state=open]:data-[placement^=bottom]:-translate-y-1",
		"starting:data-[state=open]:data-[placement^=top]:translate-y-1",
		"starting:data-[state=open]:data-[side=bottom]:-translate-y-1",
		"starting:data-[state=open]:data-[side=top]:translate-y-1",
		// Side placements lean toward the trigger too.
		"data-[state=closed]:data-[side=left]:translate-x-1 data-[state=closed]:data-[side=right]:-translate-x-1",
		"starting:data-[state=open]:data-[side=left]:translate-x-1 starting:data-[state=open]:data-[side=right]:-translate-x-1",
	],
})();

/**
 * Unfolds a surface from its trigger edge instead of scaling. Base menus and selects use
 * `ANCHORED` (the zoom) since 2026-09-29; this stays for surfaces that opt in.
 */
export const UNFOLD = tv({
	base: [
		...ANCHORED_BASE,
		"group/surface transition-[opacity,translate,clip-path,border-radius]",
		// Negative insets keep the box-shadow inside the clip; only the near edge closes to 100%.
		// `side` is bits-ui's own popper attribute.
		"data-[state=open]:[clip-path:inset(-4rem)]",
		"data-[state=closed]:data-[placement^=bottom]:[clip-path:inset(-4rem_-4rem_100%_-4rem)]",
		"data-[state=closed]:data-[placement^=bottom]:-translate-y-1.5 data-[state=closed]:data-[placement^=bottom]:rounded-t-none",
		"data-[state=closed]:data-[placement^=top]:[clip-path:inset(100%_-4rem_-4rem_-4rem)]",
		"data-[state=closed]:data-[placement^=top]:translate-y-1.5 data-[state=closed]:data-[placement^=top]:rounded-b-none",
		"data-[state=closed]:data-[side=bottom]:[clip-path:inset(-4rem_-4rem_100%_-4rem)]",
		"data-[state=closed]:data-[side=bottom]:-translate-y-1.5 data-[state=closed]:data-[side=bottom]:rounded-t-none",
		"data-[state=closed]:data-[side=top]:[clip-path:inset(100%_-4rem_-4rem_-4rem)]",
		"data-[state=closed]:data-[side=top]:translate-y-1.5 data-[state=closed]:data-[side=top]:rounded-b-none",
		"starting:data-[state=open]:data-[placement^=bottom]:[clip-path:inset(-4rem_-4rem_100%_-4rem)]",
		"starting:data-[state=open]:data-[placement^=bottom]:-translate-y-1.5 starting:data-[state=open]:data-[placement^=bottom]:rounded-t-none",
		"starting:data-[state=open]:data-[placement^=top]:[clip-path:inset(100%_-4rem_-4rem_-4rem)]",
		"starting:data-[state=open]:data-[placement^=top]:translate-y-1.5 starting:data-[state=open]:data-[placement^=top]:rounded-b-none",
		"starting:data-[state=open]:data-[side=bottom]:[clip-path:inset(-4rem_-4rem_100%_-4rem)]",
		"starting:data-[state=open]:data-[side=bottom]:-translate-y-1.5 starting:data-[state=open]:data-[side=bottom]:rounded-t-none",
		"starting:data-[state=open]:data-[side=top]:[clip-path:inset(100%_-4rem_-4rem_-4rem)]",
		"starting:data-[state=open]:data-[side=top]:translate-y-1.5 starting:data-[state=open]:data-[side=top]:rounded-b-none",
	],
})();

/** Rows inside an `UNFOLD` surface settle in one after another; `stagger()` numbers them. */
export const UNFOLD_ITEM = tv({
	base: [
		"transition-[color,background-color,opacity,translate,scale] duration-[var(--duration-tooltip)] ease-[var(--ease-out)]",
		// Only the first three rows stagger, so a long menu still settles in 240ms.
		"[--stagger:calc(min(var(--i,0),2)*var(--stagger-step))] [transition-delay:0s,0s,var(--stagger),var(--stagger),0s]",
		"active:scale-[var(--press-scale-row)]",
		"group-data-[state=closed]/surface:opacity-0 group-data-[state=closed]/surface:-translate-y-1.5",
		"group-data-[state=closed]/surface:[--stagger:0s] group-data-[state=closed]/surface:duration-[var(--duration-exit)]",
		"starting:group-data-[state=open]/surface:opacity-0 starting:group-data-[state=open]/surface:-translate-y-1.5",
		"motion-reduce:transition-none",
	],
})();

/** Numbers `rows` for `UNFOLD_ITEM`'s stagger delay. */
export function stagger(rows: Iterable<HTMLElement>) {
	let i = 0;
	for (const row of rows) row.style.setProperty("--i", String(i++));
}
