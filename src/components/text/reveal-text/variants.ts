import { tv, type VariantProps } from "tailwind-variants";

export const revealText = tv({
	slots: {
		root: "group/reveal block [--reveal-blur:var(--reveal-blur-amount)] motion-reduce:[--reveal-blur:0px] motion-reduce:[--reveal-x:0%] motion-reduce:[--reveal-y:0%] pointer-coarse:[--reveal-blur:0px]",
		line: "block",
		mask: "",
		unit: "inline-block transition-[opacity,translate,filter] duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] [transition-delay:var(--reveal-delay)] group-data-[revealed=false]/reveal:translate-x-(--reveal-x) group-data-[revealed=false]/reveal:translate-y-(--reveal-y) group-data-[revealed=false]/reveal:opacity-0 group-data-[revealed=false]/reveal:blur-(--reveal-blur) group-data-[revealed=false]/reveal:transition-none motion-reduce:duration-250 motion-reduce:[transition-delay:calc(var(--reveal-delay)*0.3)]",
		srOnly: "sr-only",
	},
	variants: {
		// `tracking` letters converge from loose spacing; `wipe` uncovers the text through a soft edge.
		variant: {
			default: {},
			tracking: {
				unit: "group-data-[revealed=false]/reveal:translate-x-(--reveal-track) group-data-[revealed=false]/reveal:translate-y-0",
			},
			wipe: {
				root: [
					"-my-[0.1em] py-[0.1em] [mask-image:linear-gradient(90deg,#000_44%,transparent_56%)] [mask-position:0%_0] [mask-repeat:no-repeat] [mask-size:230%_100%]",
					"transition-[mask-position] duration-900 ease-(--ease-ui-out) data-[revealed=false]:[mask-position:100%_0] data-[revealed=false]:transition-none motion-reduce:[mask-image:none]",
				],
				unit: "group-data-[revealed=false]/reveal:translate-x-0 group-data-[revealed=false]/reveal:translate-y-0 group-data-[revealed=false]/reveal:opacity-100 group-data-[revealed=false]/reveal:blur-none",
			},
		},
		split: {
			word: {},
			char: { unit: "whitespace-pre" },
			line: { unit: "whitespace-pre-wrap" },
		},
		trigger: {
			mount: {},
			view: {},
		},
		/** The side each unit travels in from. */
		direction: {
			up: { root: "[--reveal-x:0%] [--reveal-y:40%]" },
			down: { root: "[--reveal-x:0%] [--reveal-y:-40%]" },
			left: { root: "[--reveal-x:40%] [--reveal-y:0%]" },
			right: { root: "[--reveal-x:-40%] [--reveal-y:0%]" },
		},
		/** Clips each unit so it rises out of its own line box instead of floating in. */
		mask: {
			true: { mask: "inline-block overflow-hidden pb-[0.1em] align-bottom" },
			false: { mask: "contents" },
		},
		/** Where the stagger wave starts. */
		staggerFrom: {
			start: {},
			end: {},
			center: {},
			edges: {},
			random: {},
		},
		size: {
			inherit: {},
			sm: { root: "text-xl" },
			default: { root: "text-3xl" },
			lg: { root: "text-5xl" },
		},
	},
	defaultVariants: {
		variant: "default",
		split: "word",
		trigger: "mount",
		direction: "up",
		mask: false,
		staggerFrom: "start",
		size: "inherit",
	},
});

export type RevealTextVariant = NonNullable<VariantProps<typeof revealText>["variant"]>;
export type RevealTextSplit = NonNullable<VariantProps<typeof revealText>["split"]>;
export type RevealTextTrigger = NonNullable<VariantProps<typeof revealText>["trigger"]>;
export type RevealTextDirection = NonNullable<
	VariantProps<typeof revealText>["direction"]
>;
export type RevealTextStaggerFrom = NonNullable<
	VariantProps<typeof revealText>["staggerFrom"]
>;
export type RevealTextSize = NonNullable<VariantProps<typeof revealText>["size"]>;

/** `track` is the em offset a letter starts from its word's centre, for the tracking variant. */
export type RevealUnit = { key: string; text: string; delay: number; track: number };

const NBSP = String.fromCharCode(160);

/** Position of unit `i` of `total` in the stagger wave; random is seeded, so it is stable. */
export function staggerRank(
	i: number,
	total: number,
	from: RevealTextStaggerFrom,
): number {
	if (from === "end") return total - 1 - i;
	if (from === "center") return Math.abs((total - 1) / 2 - i);
	if (from === "edges") return Math.min(i, total - 1 - i);
	if (from === "random")
		return Math.floor((Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1) * total);
	return i;
}

/** Splits lines into staggered units; word units carry their trailing space as a nbsp. */
export function revealUnits(
	lines: string[],
	split: RevealTextSplit,
	delayMs: number,
	staggerMs: number,
	staggerFrom: RevealTextStaggerFrom = "start",
	trackEm = 0,
): RevealUnit[][] {
	const parts = lines.map((line) =>
		split === "line"
			? [line]
			: split === "char"
				? Array.from(line)
				: line.split(/\s+/).filter(Boolean),
	);
	const total = parts.reduce((sum, p) => sum + p.length, 0);
	let n = 0;
	return parts.map((line, l) => {
		const tracks = split === "char" && trackEm ? letterTracks(line, trackEm) : [];
		return line.map((part, i) => {
			const text = split === "word" && i < line.length - 1 ? `${part}${NBSP}` : part;
			const delay = delayMs + staggerRank(n++, total, staggerFrom) * staggerMs;
			return { key: `${l}-${i}`, text, delay, track: tracks[i] ?? 0 };
		});
	});
}

/** Each letter's offset from its word's centre, so a word opens from tight spacing. */
function letterTracks(chars: string[], trackEm: number): number[] {
	const out = chars.map(() => 0);
	let start = 0;
	for (let i = 0; i <= chars.length; i++) {
		if (i < chars.length && !/\s/.test(chars[i] ?? "")) continue;
		const center = (i - 1 - start) / 2;
		for (let j = start; j < i; j++) out[j] = (center - (j - start)) * trackEm;
		start = i + 1;
	}
	return out;
}
