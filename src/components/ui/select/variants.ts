import { tv, type VariantProps } from "tailwind-variants";
import { controlSize, fieldFrame } from "$lib/control.js";

// Open state is `data-popup-open` from Base UI and `data-state=open` from bits-ui.
export const selectTrigger = tv({
	// Content sits at the start and the chevron takes the slack, so an icon and label never drift apart.
	base: "inline-flex items-center justify-start",
	variants: {
		variant: {
			default: [fieldFrame({ kind: "trigger" }), "w-full"],
			// Text and a chevron: a compact switch beside a heading, not a form field.
			ghost: [
				"w-auto font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
				"transition-[color,background-color,scale] duration-(--duration-fast) ease-(--ease-ui-out) motion-reduce:transition-none",
				"hover:bg-foreground/[0.06] hover:text-foreground",
				"data-[popup-open]:bg-foreground/[0.08] data-[popup-open]:text-foreground data-[state=open]:bg-foreground/[0.08] data-[state=open]:text-foreground",
				"disabled:cursor-not-allowed disabled:opacity-50",
			],
		},
		// The chevron stays a step under the ladder's icon at lg and xl.
		size: {
			xs: [controlSize({ size: "xs" }), "gap-1 px-2"],
			sm: [controlSize({ size: "sm" }), "gap-1.5 px-2.5"],
			default: [controlSize({ size: "default" }), "gap-2 px-3"],
			lg: [controlSize({ size: "lg" }), "gap-2 px-3.5 [&_svg]:size-4"],
			xl: [controlSize({ size: "xl" }), "gap-2.5 px-4 [&_svg]:size-4.5"],
		},
	},
	defaultVariants: { variant: "default", size: "default" },
});

export type SelectTriggerVariant = NonNullable<
	VariantProps<typeof selectTrigger>["variant"]
>;
export type SelectTriggerSize = NonNullable<VariantProps<typeof selectTrigger>["size"]>;
export type SelectContentSize = SelectTriggerSize;
