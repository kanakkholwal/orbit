import { tv, type VariantProps } from "tailwind-variants";

export const toggleButton = tv({
	base: [
		"inline-flex items-center justify-center gap-1.5 rounded-lg border border-transparent font-medium transition-[background-color,color,transform,scale,translate] duration-[var(--duration-press)] ease-[var(--ease-out)]",
		"text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground",
		"aria-pressed:border-border aria-pressed:bg-foreground/[0.08] aria-pressed:text-foreground",
		"outline-none focus-visible:ring-2 focus-visible:ring-ring",
		"active:scale-[var(--press-scale)] disabled:pointer-events-none disabled:opacity-50",
	],
	variants: {
		// shadcn's names: `outline` keeps a field-style border at rest, so it reads as a button.
		variant: {
			default: "",
			outline:
				"border-input hover:border-border-strong aria-pressed:border-border-strong",
		},
		size: {
			sm: "h-7 min-w-7 px-2 text-xs",
			md: "h-9 min-w-9 px-2.5 text-sm",
			lg: "h-10 min-w-10 px-3 text-sm",
			xl: "h-12 min-w-12 px-4 text-base",
		},
	},
	defaultVariants: { variant: "default", size: "md" },
});

export type ToggleVariant = NonNullable<VariantProps<typeof toggleButton>["variant"]>;
export type ToggleSize = NonNullable<VariantProps<typeof toggleButton>["size"]>;
