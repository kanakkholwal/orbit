import { tv, type VariantProps } from "tailwind-variants";

/** The control ladder from DESIGN.md: height, radius, text and icon per shadcn `size`. */
export const controlSize = tv({
	variants: {
		size: {
			xs: "h-6 [height:var(--control-height-xs)]! rounded-sm text-xs [&_svg]:size-3",
			sm: "h-8 [height:var(--control-height-sm)]! rounded-md text-xs [&_svg]:size-3.5",
			default:
				"h-9 [height:var(--control-height-default)]! rounded-lg text-sm [&_svg]:size-4",
			lg: "h-10 [height:var(--control-height-lg)]! rounded-lg text-sm [&_svg]:size-4.5",
			xl: "h-12 [height:var(--control-height-xl)]! rounded-xl text-base [&_svg]:size-5",
		},
	},
	defaultVariants: { size: "default" },
});

export type ControlSize = NonNullable<VariantProps<typeof controlSize>["size"]>;

/** One frame for every field. Focus is a ring-coloured border, no halo; a trigger (Select,
 * Combobox) also takes a neutral border while its popup is open. */
export const fieldFrame = tv({
	base: [
		"border border-input bg-(--field) text-foreground outline-none",
		"transition-[color,border-color,box-shadow] duration-(--duration-fast) ease-(--ease-ui-out) motion-reduce:transition-none",
		"hover:border-border-strong aria-invalid:border-destructive",
		"disabled:cursor-not-allowed disabled:opacity-50",
	],
	variants: {
		kind: {
			input: "focus-visible:border-ring",
			trigger: [
				"focus-visible:border-ring",
				"data-[popup-open]:border-border-strong data-[state=open]:border-border-strong",
			],
		},
	},
	defaultVariants: { kind: "input" },
});

/** The opt-in soft halo around a focused text field: Input and Textarea's `ring` variant. */
export const fieldHalo = tv({
	base: "focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:ring-destructive/20",
});

/** iOS zooms the page into a focused field under 16px, so text entry reads 16px below `md`. */
export const fieldText = tv({
	variants: {
		size: {
			xs: "text-base md:text-xs",
			sm: "text-base md:text-xs",
			default: "text-base md:text-sm",
			lg: "text-base md:text-sm",
			xl: "text-base",
		},
	},
	defaultVariants: { size: "default" },
});
