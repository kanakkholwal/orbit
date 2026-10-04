import { tv, type VariantProps } from "tailwind-variants";

export const toggleGroup = tv({
	slots: {
		root: "inline-flex items-center gap-0.5 border border-border",
		// Single-select items are role=radio/aria-checked, not aria-pressed; data-state
		// is the one attribute bits-ui sets unconditionally ("on"/"off") in both modes.
		item: [
			"inline-flex items-center gap-1.5 font-medium text-muted-foreground outline-none",
			"transition-[color,background-color,box-shadow,scale] duration-(--duration-fast) ease-[var(--ease-smooth)] motion-reduce:transition-none",
			"hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[var(--press-scale-sm)]",
			"disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-foreground",
			"[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
		],
	},
	variants: {
		variant: {
			default: {
				root: "bg-card",
				item: "data-[state=on]:bg-foreground/[0.08]",
			},
			outline: {
				root: "bg-transparent",
				item: "data-[state=on]:bg-foreground/[0.08]",
			},
		},
		size: {
			// The rim and radius scale with the item, so small groups stay slim.
			sm: {
				root: "rounded-lg p-0.5",
				item: "h-6 rounded-md px-2 text-xs [&_svg]:size-3",
			},
			md: { root: "rounded-lg p-0.5", item: "h-7 rounded-md px-2.5 text-xs" },
			lg: { root: "rounded-xl p-1", item: "h-8 rounded-lg px-3 text-sm [&_svg]:size-4" },
			xl: {
				root: "rounded-xl p-1",
				item: "h-10 rounded-lg px-4 text-base [&_svg]:size-4",
			},
		},
	},
	defaultVariants: { variant: "default", size: "md" },
});

export type ToggleGroupVariant = NonNullable<VariantProps<typeof toggleGroup>["variant"]>;
export type ToggleGroupSize = NonNullable<VariantProps<typeof toggleGroup>["size"]>;
