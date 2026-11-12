import { tv, type VariantProps } from "tailwind-variants";

export const morphText = tv({
	slots: {
		root: "relative inline-grid align-baseline leading-none",
		word: "relative inline-grid align-baseline leading-none",
		sizer: "invisible col-start-1 row-start-1 whitespace-nowrap",
		stage: "relative col-start-1 row-start-1 whitespace-nowrap",
		item: "absolute top-0 left-0 origin-bottom-left whitespace-nowrap",
		subtext: "morph-text-subtext mt-8 text-muted-foreground uppercase tracking-widest",
		filter: "pointer-events-none absolute size-0",
	},
	variants: {
		size: {
			inherit: { subtext: "text-[0.3em]" },
			sm: { word: "text-3xl", subtext: "text-xs" },
			default: { word: "text-5xl", subtext: "text-sm" },
			lg: { word: "text-7xl", subtext: "text-base" },
		},
		layout: {
			inline: {},
			stacked: { root: "flex flex-col items-center" },
		},
	},
	defaultVariants: { size: "inherit", layout: "inline" },
});

export type MorphTextSize = NonNullable<VariantProps<typeof morphText>["size"]>;
