import { tv, type VariantProps } from "tailwind-variants";
import { anchoredSurface } from "$lib/anchored-surface.js";

/** The popover look; NavigationMenu's panel reads `surface` too, so both change together. */
export const popover = tv({
	slots: {
		surface: "",
		content: "",
	},
	variants: {
		size: {
			xs: {
				surface: anchoredSurface({ size: "xs" }).surface(),
				content: anchoredSurface({ size: "xs" }).content(),
			},
			sm: {
				surface: anchoredSurface({ size: "sm" }).surface(),
				content: anchoredSurface({ size: "sm" }).content(),
			},
			default: {
				surface: anchoredSurface().surface(),
				content: anchoredSurface().content(),
			},
			lg: {
				surface: anchoredSurface({ size: "lg" }).surface(),
				content: anchoredSurface({ size: "lg" }).content(),
			},
			xl: {
				surface: anchoredSurface({ size: "xl" }).surface(),
				content: anchoredSurface({ size: "xl" }).content(),
			},
		},
	},
	defaultVariants: { size: "default" },
});

export type PopoverSize = NonNullable<VariantProps<typeof popover>["size"]>;
