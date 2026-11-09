import { tv, type VariantProps } from "tailwind-variants";

export const anchoredSurface = tv({
	slots: {
		surface: "border border-border bg-popover text-foreground shadow-(--overlay-shadow)",
		content: "",
	},
	variants: {
		size: {
			xs: { surface: "rounded-lg", content: "w-56 p-2 text-xs" },
			sm: { surface: "rounded-lg", content: "w-64 p-2.5 text-xs" },
			default: { surface: "rounded-xl", content: "w-72 p-3 text-sm" },
			lg: { surface: "rounded-xl", content: "w-80 p-4 text-sm" },
			xl: { surface: "rounded-2xl", content: "w-96 p-5 text-base" },
		},
	},
	defaultVariants: { size: "default" },
});

export type AnchoredSurfaceSize = NonNullable<
	VariantProps<typeof anchoredSurface>["size"]
>;
