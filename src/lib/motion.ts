import { cubicOut } from "svelte/easing";
import type { FlyParams } from "svelte/transition";

/** Entry/exit curve. Mirrors --ease-snappy so JS and CSS motion agree. */
export const snappy = cubicOut;

export const DURATION = {
  press: 100,
  hover: 160,
  pop: 200,
  panel: 260,
  sheet: 340,
} as const;

/** Svelte transitions use WAAPI, which ignores the CSS reduced-motion guard. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Rise-in for content entering on load or on scroll. Fades only when reduced. */
export function rise(y = 10, delay = 0): FlyParams {
  return prefersReducedMotion()
    ? { y: 0, duration: 140, delay: 0 }
    : { y, duration: DURATION.panel, delay, easing: snappy };
}

/** Stagger step for a list. Collapses to zero under reduced motion. */
export function stagger(index: number, step = 45, cap = 6): number {
  if (prefersReducedMotion()) return 0;
  return Math.min(index, cap) * step;
}
