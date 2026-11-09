import { tv, type VariantProps } from "tailwind-variants";
import { controlSize } from "$lib/control.js";

export const toggleButton = tv({
	base: [
		"inline-flex items-center justify-center border border-transparent font-medium transition-[background-color,color,border-color,scale] duration-[var(--duration-press)] ease-[var(--ease-ui-out)]",
		"text-muted-foreground hover:bg-accent hover:text-accent-foreground",
		"aria-pressed:border-border aria-pressed:bg-foreground/[0.08] aria-pressed:text-foreground",
		"outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
		"disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	],
	variants: {
		// shadcn's names: `outline` keeps a field-style border at rest, so it reads as a button.
		variant: {
			default: "",
			outline:
				"border-input hover:border-border-strong aria-pressed:border-border-strong",
			// Pressed takes the brand tint; --primary ink is 4.05:1 on it in light, --primary-hover 4.72:1.
			primary:
				"aria-pressed:border-transparent aria-pressed:bg-[color-mix(in_oklch,var(--primary)_14%,transparent)] aria-pressed:text-primary-hover",
		},
		// Icon-only toggles stay square: 2 x px + icon + border fits the height, min-w holds the rest.
		size: {
			xs: [
				controlSize({ size: "xs" }),
				"min-w-6 gap-1 px-1 active:scale-[var(--press-scale-icon)]",
			],
			sm: [
				controlSize({ size: "sm" }),
				"min-w-8 gap-1.5 px-2 active:scale-[var(--press-scale-sm)]",
			],
			default: [
				controlSize({ size: "default" }),
				"min-w-9 gap-1.5 px-2 active:scale-[var(--press-scale)]",
			],
			lg: [
				controlSize({ size: "lg" }),
				"min-w-10 gap-2 px-2.5 active:scale-[var(--press-scale-lg)]",
			],
			xl: [
				controlSize({ size: "xl" }),
				"min-w-12 gap-2 px-3 active:scale-[var(--press-scale-lg)]",
			],
		},
	},
	defaultVariants: { variant: "default", size: "default" },
});

export type ToggleVariant = NonNullable<VariantProps<typeof toggleButton>["variant"]>;
export type ToggleSize = NonNullable<VariantProps<typeof toggleButton>["size"]>;
