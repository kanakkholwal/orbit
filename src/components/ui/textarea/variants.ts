import { tv, type VariantProps } from "tailwind-variants";
import { fieldFrame, fieldHalo, fieldText } from "$lib/control.js";

export const textarea = tv({
	base: [fieldFrame(), "w-full leading-relaxed placeholder:text-muted-foreground"],
	variants: {
		// No fixed height: the ladder's radius and text, with a min height that grows with the size.
		size: {
			xs: [fieldText({ size: "xs" }), "min-h-12 rounded-sm px-2 py-1"],
			sm: [fieldText({ size: "sm" }), "min-h-14 rounded-md px-2.5 py-1.5"],
			default: [fieldText({ size: "default" }), "min-h-16 rounded-lg px-3 py-2"],
			lg: [fieldText({ size: "lg" }), "min-h-20 rounded-lg px-3.5 py-2.5"],
			xl: [fieldText({ size: "xl" }), "min-h-24 rounded-xl px-4 py-3"],
		},
		variant: {
			outline: "",
			soft: "border-transparent bg-card hover:border-transparent",
			// The outline look plus a soft focus halo.
			ring: fieldHalo(),
		},
		autoGrow: {
			true: "resize-none overflow-y-hidden",
			false: "resize-y",
		},
	},
	defaultVariants: { size: "default", variant: "outline", autoGrow: false },
});

export type TextareaSize = NonNullable<VariantProps<typeof textarea>["size"]>;
export type TextareaVariant = NonNullable<VariantProps<typeof textarea>["variant"]>;
