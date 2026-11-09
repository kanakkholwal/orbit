import { tv, type VariantProps } from "tailwind-variants";

export const toggleGroup = tv({
	slots: {
		root: "inline-flex items-center gap-0.5 border border-border",
		// bits-ui marks pressed items data-state=on; data-pressed keeps the classes in step with React.
		item: [
			"inline-flex items-center justify-center gap-1.5 font-medium text-muted-foreground outline-none",
			"transition-[color,background-color,box-shadow,scale] duration-(--duration-fast) ease-[var(--ease-smooth)] motion-reduce:transition-none",
			"hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[var(--press-scale-sm)]",
			"disabled:pointer-events-none disabled:opacity-50 data-[pressed]:text-foreground data-[state=on]:text-foreground",
			"[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
		],
		indicator: "hidden",
	},
	variants: {
		variant: {
			default: {
				root: "bg-card",
				item: "data-[pressed]:bg-foreground/[0.08] data-[state=on]:bg-foreground/[0.08]",
			},
			outline: {
				root: "bg-transparent",
				item: "data-[pressed]:bg-foreground/[0.08] data-[state=on]:bg-foreground/[0.08]",
			},
			// One pill slides behind the pressed item, like a segmented control.
			segmented: {
				root: "relative isolate bg-muted",
				item: "relative z-1",
				indicator: [
					"pointer-events-none absolute top-0 left-0 block border border-border bg-background shadow-xs",
					"data-[ready=true]:transition-[translate,width,height,opacity] data-[ready=true]:duration-(--duration-spring-snappy) data-[ready=true]:ease-(--ease-spring-snappy) motion-reduce:transition-none",
				],
			},
			// Separate pill chips that wrap, for filters and topic pickers.
			chip: {
				root: "flex-wrap gap-2 border-0 bg-transparent",
				item: "border border-border bg-background data-[pressed]:border-primary/40 data-[pressed]:bg-primary/10 data-[state=on]:border-primary/40 data-[state=on]:bg-primary/10",
			},
		},
		// The whole group sits on the control ladder: items are the height minus the rim
		// (border + padding), and their radius is the group's minus that same inset.
		size: {
			xs: {
				root: "h-6 rounded-sm p-0.5",
				item: "h-4.5 rounded-[calc(var(--radius-sm)-3px)] px-1.5 text-xs [&_svg]:size-3",
				indicator: "rounded-[calc(var(--radius-sm)-3px)]",
			},
			sm: {
				root: "h-8 rounded-md p-0.5",
				item: "h-6.5 rounded-[calc(var(--radius-md)-3px)] px-2 text-xs [&_svg]:size-3.5",
				indicator: "rounded-[calc(var(--radius-md)-3px)]",
			},
			default: {
				root: "h-9 rounded-lg p-0.5",
				item: "h-7.5 rounded-[calc(var(--radius-lg)-3px)] px-2.5 text-sm [&_svg]:size-4",
				indicator: "rounded-[calc(var(--radius-lg)-3px)]",
			},
			lg: {
				root: "h-10 rounded-lg p-0.5",
				item: "h-8.5 rounded-[calc(var(--radius-lg)-3px)] px-3 text-sm [&_svg]:size-4",
				indicator: "rounded-[calc(var(--radius-lg)-3px)]",
			},
			xl: {
				root: "h-12 rounded-xl p-1",
				item: "h-9.5 rounded-[calc(var(--radius-xl)-5px)] px-3.5 text-base [&_svg]:size-4.5",
				indicator: "rounded-[calc(var(--radius-xl)-5px)]",
			},
		},
	},
	// Chips drop the shared rim: the group grows with its rows and each chip is a full pill.
	compoundVariants: [
		{ variant: "chip", class: { root: "h-auto rounded-none p-0", item: "rounded-full" } },
	],
	defaultVariants: { variant: "default", size: "default" },
});

export type ToggleGroupVariant = NonNullable<VariantProps<typeof toggleGroup>["variant"]>;
export type ToggleGroupSize = NonNullable<VariantProps<typeof toggleGroup>["size"]>;
