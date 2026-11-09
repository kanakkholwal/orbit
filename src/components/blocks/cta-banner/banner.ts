/** Film grain as an SVG turbulence tile, laid over the tint so flat colour reads as a material. */
export const BANNER_NOISE = `url("data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`;

/** Diagonal light and shade bands across the grain tint. */
export const BANNER_BANDS =
	"linear-gradient(118deg, transparent 8%, rgb(255 255 255 / 0.16) 18%, transparent 30%, transparent 52%, rgb(0 0 0 / 0.12) 66%, transparent 80%), linear-gradient(118deg, transparent 72%, rgb(255 255 255 / 0.14) 84%, transparent 96%)";

/** Hairline rules across the grain banner, in percent of its box. */
export const BANNER_LINES = { x: [17, 25, 26.5, 80], y: [58, 88, 90.5] } as const;

/** Where floating icons drift on the grain banner, and how far each one's loop is offset. */
export const BANNER_SPOTS = [
	{ x: "10%", y: "20%", size: "size-8", delay: 0 },
	{ x: "85%", y: "15%", size: "size-6", delay: 1 },
	{ x: "15%", y: "75%", size: "size-7", delay: 2 },
	{ x: "80%", y: "70%", size: "size-6.5", delay: 0.5 },
	{ x: "50%", y: "10%", size: "size-5.5", delay: 1.5 },
	{ x: "25%", y: "40%", size: "size-5", delay: 3 },
] as const;

const STARTS = [
	0, 3.4, 1.1, 4.7, 2.2, 0.6, 3.9, 1.8, 5.1, 2.9, 0.2, 4.2, 1.5, 3.1, 0.9, 4.9,
];

/** Each ticker row's start offset in ems, so stacked rows never line their words up. */
export const tickerRows = (count: number) =>
	Array.from(
		{ length: count },
		(_, at) =>
			((STARTS[at % STARTS.length] ?? 0) + Math.floor(at / STARTS.length) * 2.7) % 5.6,
	);

/** Defaults for the tuning props; `speed` scales every loop, 2 is twice as fast. */
export const BANNER_DEFAULTS = {
	speed: 1,
	noise: 0.4,
	angle: -38,
	rows: 32,
} as const;

/** Ticker rows held to 4..48, enough to fill the field without thousands of nodes. */
export const bannerRows = (rows: number) => Math.max(4, Math.min(48, Math.round(rows)));

/** A loop length scaled by the root's `--banner-speed`. */
export const bannerPace = (seconds: number) =>
	`calc(${seconds}s / var(--banner-speed, 1))`;

/** Two identical halves of 20 words, so a ticker run loops on translateX(-50%) without a seam. */
export const BANNER_RUN = Array.from({ length: 40 }, (_, n) => `word-${n}`);
