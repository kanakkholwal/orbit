/** The Orbit aperture mark: three solid pieces of an O, drawn on a 48 by 48 grid. */
export const MARK_PATHS = [
  "M 27.346 3.268 A 21 21 0 0 1 43.627 31.468 L 32.316 31.2 A 11 11 0 0 0 29.37 14.4 Z",
  "M 40.281 37.263 A 21 21 0 0 1 7.719 37.263 L 13.606 27.602 A 11 11 0 0 0 29.629 33.451 Z",
  "M 4.373 31.468 A 21 21 0 0 1 20.654 3.268 L 26.077 13.198 A 11 11 0 0 0 13.001 24.15 Z",
] as const;

/** Standalone SVG markup for icons, favicons and generated images. */
export function markSvg(color = "currentColor", opacity = 1): string {
  const paths = MARK_PATHS.map((d) => `<path d="${d}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="${color}" fill-opacity="${opacity}">${paths}</g></svg>`;
}
