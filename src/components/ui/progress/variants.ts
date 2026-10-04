import { tv, type VariantProps } from "tailwind-variants";

export const progress = tv({
	slots: {
		root: "w-full",
		header: "mb-2 flex items-end justify-between gap-4",
		titles: "min-w-0 space-y-1",
		title: "font-medium text-sm text-foreground/90",
		helper: "text-sm text-muted-foreground leading-5",
		value: "shrink-0 font-medium text-sm text-muted-foreground tabular-nums",
		track: "relative w-full overflow-hidden rounded-full bg-input",
		fill: "progress-fill h-full w-full rounded-full bg-current",
		sweep: "progress-gloss absolute inset-y-0 left-0 w-[38%] rounded-full",
		ring: "relative shrink-0",
		ringSvg: "size-full -rotate-90",
		ringTrack: "fill-none stroke-current opacity-15",
		ringFill: "progress-ring fill-none stroke-current",
		ringLabel:
			"pointer-events-none absolute inset-0 m-auto flex size-fit max-w-[78%] items-center justify-center truncate font-semibold text-foreground tabular-nums",
		caption: "flex max-w-48 flex-col items-center gap-0.5 text-center",
	},
	variants: {
		size: {
			sm: { track: "h-1", ring: "size-28", ringLabel: "text-lg" },
			md: { track: "h-2", ring: "size-32", ringLabel: "text-xl" },
			lg: { track: "h-3", ring: "size-40", ringLabel: "text-2xl" },
			xl: { track: "h-4", ring: "size-44", ringLabel: "text-3xl" },
		},
		tone: {
			default: { track: "text-primary", ring: "text-primary" },
			info: { track: "text-(--info)", ring: "text-(--info)" },
			success: { track: "text-(--success)", ring: "text-(--success)" },
			destructive: { track: "text-(--destructive)", ring: "text-(--destructive)" },
		},
		variant: {
			linear: {},
			circular: { root: "inline-flex w-auto flex-col items-center gap-3" },
		},
	},
	defaultVariants: { size: "md", tone: "default", variant: "linear" },
});

export type ProgressSize = NonNullable<VariantProps<typeof progress>["size"]>;
export type ProgressTone = NonNullable<VariantProps<typeof progress>["tone"]>;
export type ProgressVariant = NonNullable<VariantProps<typeof progress>["variant"]>;

/** Ring geometry in a 100-unit viewBox: radius 45, a 5% gap either side of the fill. */
export const PROGRESS_RING = { radius: 45, stroke: 10, gap: 5 };

/** Share of `[min, max]` that `value` covers, 0 to 100. */
export function progressPercent(value: number, min: number, max: number): number {
	if (max <= min) return value >= max ? 100 : 0;
	return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}
