import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const outDir = join(import.meta.dirname, "../static/assets/landing");
mkdirSync(outDir, { recursive: true });

const DEEP = [4, 100, 73];
const BASE = [5, 132, 96];
const LIGHT = [60, 214, 160];

const mix = (a, b, t) => a + (b - a) * t;

function seeded(seed) {
	let s = seed >>> 0;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 4294967296;
	};
}

function render({ name, width, height, angle, streaks, vLines, hLines, seed }) {
	const rand = seeded(seed);
	const px = Buffer.alloc(width * height * 3);
	const ca = Math.cos(angle);
	const sa = Math.sin(angle);
	const aspect = width / height;
	const line = Math.max(1, Math.round(width / 1300));

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const u = (x / width) * aspect;
			const v = y / height;
			const d = u * ca + v * sa;
			const p = -u * sa + v * ca;

			let glow = 0;
			for (const s of streaks) {
				const band = Math.exp(-(((d - s.c) / s.w) ** 2));
				glow += s.a * band * (0.55 + 0.45 * Math.sin(p * s.f + s.phase));
			}
			glow = Math.min(1, Math.max(0, glow));

			const shade = 0.55 + 0.45 * Math.sin(u * 2.3 + v * 1.7 + seed);
			const grain = (rand() + rand() - 1) * 18;

			const i = (y * width + x) * 3;
			for (let ch = 0; ch < 3; ch++) {
				const body = mix(DEEP[ch], BASE[ch], shade);
				px[i + ch] = Math.max(
					0,
					Math.min(255, mix(body, LIGHT[ch], glow * 0.58) + grain),
				);
			}
		}
	}

	const drawLine = (x0, y0, x1, y1) => {
		for (let y = y0; y < y1; y++) {
			for (let x = x0; x < x1; x++) {
				const i = (y * width + x) * 3;
				for (let ch = 0; ch < 3; ch++) px[i + ch] = mix(px[i + ch], 255, 0.26);
			}
		}
	};
	for (const f of vLines) {
		const x = Math.round(f * width);
		drawLine(x, 0, Math.min(width, x + line), height);
	}
	for (const f of hLines) {
		const y = Math.round(f * height);
		drawLine(0, y, width, Math.min(height, y + line));
	}

	return sharp(px, { raw: { width, height, channels: 3 } })
		.webp({ quality: 80, effort: 6 })
		.toFile(join(outDir, name))
		.then((info) =>
			console.log(
				name,
				info.width,
				info.height,
				`${Math.round(info.size / 1024)} KB`,
			),
		);
}

await render({
	name: "cta-gradient.webp",
	width: 2400,
	height: 1000,
	angle: -0.62,
	seed: 7,
	streaks: [
		{ c: 0.25, w: 0.1, a: 0.85, f: 2.2, phase: 0.4 },
		{ c: 0.78, w: 0.16, a: 0.7, f: 1.6, phase: 2.1 },
		{ c: 1.55, w: 0.12, a: 0.75, f: 2.8, phase: 4.0 },
		{ c: 2.1, w: 0.2, a: 0.55, f: 1.3, phase: 1.2 },
	],
	vLines: [0.168, 0.25, 0.264, 0.803],
	hLines: [0.575, 0.88, 0.906],
});

await render({
	name: "search-gradient.webp",
	width: 1200,
	height: 1600,
	angle: -1.05,
	seed: 3,
	streaks: [
		{ c: -0.2, w: 0.1, a: 0.95, f: 2.4, phase: 0.8 },
		{ c: 0.35, w: 0.12, a: 0.85, f: 1.9, phase: 2.6 },
		{ c: 0.9, w: 0.09, a: 0.9, f: 2.2, phase: 5.1 },
		{ c: -0.75, w: 0.08, a: 0.7, f: 3.1, phase: 1.7 },
	],
	vLines: [0.333, 0.51, 0.525],
	hLines: [0.196, 0.736, 0.75, 0.831],
});
