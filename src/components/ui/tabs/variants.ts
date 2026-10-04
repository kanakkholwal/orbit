import { tv, type VariantProps } from "tailwind-variants";

export const tabsFrame = tv({
	slots: {
		list: "relative inline-flex w-max items-center",
		trigger:
			"relative z-10 inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
		// The sliding marker, measured from the active trigger.
		indicator:
			"pointer-events-none absolute left-0 transition-[transform,scale,translate,width] duration-(--duration-slow) ease-[var(--ease-drawer)] motion-reduce:transition-none",
	},
	variants: {
		variant: {
			pill: {
				list: "gap-1 rounded-full bg-card p-1",
				trigger: "rounded-full aria-selected:text-primary-foreground",
				indicator: "top-1 bottom-1 rounded-full bg-primary",
			},
			segment: {
				list: "gap-0.5 rounded-lg bg-card p-0.5",
				trigger: "rounded-md aria-selected:text-foreground",
				indicator:
					"top-0.5 bottom-0.5 rounded-md border border-border bg-background shadow-sm",
			},
			underline: {
				list: "gap-1 border-border border-b",
				trigger: "rounded-md aria-selected:text-foreground",
				indicator: "-bottom-px h-0.5 rounded-full bg-primary",
			},
			soft: {
				list: "gap-1",
				trigger: "rounded-lg aria-selected:text-foreground",
				indicator: "inset-y-0 rounded-lg bg-foreground/[0.06]",
			},
			outline: {
				list: "gap-1",
				trigger: "rounded-lg aria-selected:text-foreground",
				indicator: "inset-y-0 rounded-lg border border-border",
			},
			enclosed: {
				list: "gap-1 border-border border-b",
				trigger: "rounded-t-lg aria-selected:text-foreground",
				indicator:
					"-bottom-px top-0 rounded-t-lg border border-border border-b-background bg-background",
			},
		},
		size: {
			sm: { trigger: "h-7 px-2.5 text-xs" },
			md: { trigger: "h-8 px-3.5 text-sm" },
			lg: { trigger: "h-10 px-4 text-sm" },
			xl: { trigger: "h-12 px-5 text-base" },
		},
	},
	defaultVariants: { variant: "pill", size: "md" },
});

export type TabsVariant = NonNullable<VariantProps<typeof tabsFrame>["variant"]>;
export type TabsSize = NonNullable<VariantProps<typeof tabsFrame>["size"]>;
