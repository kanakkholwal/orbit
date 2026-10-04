import { tv, type VariantProps } from "tailwind-variants";

export const input = tv({
	base: [
		"w-full rounded-lg border border-input bg-background text-foreground",
		"placeholder:text-muted-foreground",
		"transition-[box-shadow,border-color] duration-[var(--duration-press)] ease-[var(--ease-out)]",
		"outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
		"disabled:cursor-not-allowed disabled:opacity-50",
		"aria-[invalid=true]:border-[var(--destructive)] aria-[invalid=true]:focus-visible:ring-[color-mix(in_oklch,var(--destructive)_40%,transparent)]",
	],
	variants: {
		size: {
			sm: "h-8 px-2.5 text-xs",
			md: "h-9 px-3 text-sm",
			lg: "h-10 px-3.5 text-sm",
			xl: "h-12 px-4 text-base",
		},
	},
	defaultVariants: { size: "md" },
});

export type InputSize = NonNullable<VariantProps<typeof input>["size"]>;
