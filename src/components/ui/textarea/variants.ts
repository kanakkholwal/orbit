import { tv, type VariantProps } from "tailwind-variants";

export const textarea = tv({
	base: [
		"min-h-16 w-full rounded-lg border text-foreground leading-relaxed",
		"placeholder:text-muted-foreground",
		"transition-[box-shadow,border-color] duration-[var(--duration-press)] ease-[var(--ease-out)]",
		"outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
		"disabled:cursor-not-allowed disabled:opacity-50",
		"aria-[invalid=true]:border-[var(--destructive)] aria-[invalid=true]:focus-visible:ring-[color-mix(in_oklch,var(--destructive)_40%,transparent)]",
	],
	variants: {
		size: {
			sm: "px-2.5 py-1.5 text-xs",
			md: "px-3 py-2 text-sm",
			lg: "px-3.5 py-2.5 text-sm",
			xl: "px-4 py-3 text-base",
		},
		variant: {
			outline: "border-input bg-background",
			soft: "border-transparent bg-card",
		},
		autoGrow: {
			true: "resize-none overflow-y-hidden",
			false: "resize-y",
		},
	},
	defaultVariants: { size: "md", variant: "outline", autoGrow: false },
});

export type TextareaSize = NonNullable<VariantProps<typeof textarea>["size"]>;
export type TextareaVariant = NonNullable<VariantProps<typeof textarea>["variant"]>;
