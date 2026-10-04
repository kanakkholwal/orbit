import { tv, type VariantProps } from "tailwind-variants";

export const notchedShelf = tv({
	slots: {
		root: "relative z-10 flex -translate-y-px items-start justify-center",
		wing: "h-full w-auto shrink-0 translate-y-px overflow-visible",
		stroke: "",
		edge: "mt-px min-w-0 grow border-border border-t",
		bar: "relative z-10 flex h-[calc(100%+1px)] min-w-0 shrink-0 items-center justify-center bg-current",
		content: "flex items-center justify-center",
	},
	variants: {
		/** Solid fills with the surface it bridges into; outline draws only the silhouette. */
		variant: {
			solid: {
				root: "text-background",
				stroke: "stroke-border",
				content: "text-foreground",
			},
			muted: { root: "text-muted", stroke: "stroke-border", content: "text-foreground" },
			inverse: {
				root: "text-foreground",
				stroke: "stroke-transparent",
				content: "text-background",
			},
			outline: {
				root: "text-transparent",
				stroke: "stroke-border",
				bar: "border-border border-b",
				content: "text-foreground",
			},
		},
		/** Hanging drops from a top edge; rising grows up from a bottom edge. */
		layout: {
			hanging: {},
			// The 1px overlap nudge flips too, so it tucks under the bottom edge.
			rising: { root: "translate-y-px -scale-y-100", content: "-scale-y-100" },
		},
		/** Bar height; the wings keep their aspect, so depth and width scale with it. */
		size: {
			sm: { root: "h-8" },
			md: { root: "h-11" },
			lg: { root: "h-16" },
		},
		shape: { smooth: {}, soft: {}, sharp: {} },
		/** Where along the edge the shelf sits; insets keep a wing off a rounded corner. */
		align: {
			start: { root: "mr-auto ml-6" },
			center: { root: "mx-auto" },
			end: { root: "mr-6 ml-auto" },
		},
		/** Continues the hairline along the rest of the edge, full width. */
		edge: {
			true: { root: "w-full" },
			false: { root: "w-fit" },
		},
		mirrored: {
			true: { wing: "-translate-x-px -scale-x-100" },
			false: { wing: "translate-x-px" },
		},
	},
	// A full-width shelf has no side to align to.
	compoundVariants: [{ edge: true, class: { root: "mx-0" } }],
	defaultVariants: {
		variant: "solid",
		layout: "hanging",
		size: "md",
		shape: "smooth",
		align: "center",
		edge: false,
		mirrored: false,
	},
});

export type NotchedShelfVariant = NonNullable<
	VariantProps<typeof notchedShelf>["variant"]
>;
export type NotchedShelfLayout = NonNullable<VariantProps<typeof notchedShelf>["layout"]>;
export type NotchedShelfSize = NonNullable<VariantProps<typeof notchedShelf>["size"]>;
export type NotchedShelfShape = NonNullable<VariantProps<typeof notchedShelf>["shape"]>;
export type NotchedShelfAlign = NonNullable<VariantProps<typeof notchedShelf>["align"]>;

/** Left wing paths in an 85x64 box: `fill` bridges the surface into the bar, `edge` traces it. */
export const NOTCHED_SHELF_PATHS: Record<
	NotchedShelfShape,
	{ fill: string; edge: string }
> = {
	// Recast's shelf: an eased shoulder, a straight run, then a flat landing into the bar.
	smooth: {
		fill: "M50 45C57.3095 56.6952 71.2084 63.9997 85 64V0H0C13.7915 0 26.6905 7.30481 34 19L50 45Z",
		edge: "M0 0C13.7915 0 26.6905 7.30481 34 19L50 45C57.3095 56.6952 71.2084 63.9997 85 64",
	},
	soft: {
		fill: "M0 0C42.5 0 42.5 64 85 64V0Z",
		edge: "M0 0C42.5 0 42.5 64 85 64",
	},
	sharp: {
		fill: "M16 0L69 64H85V0Z",
		edge: "M0 0H16L69 64H85",
	},
};
