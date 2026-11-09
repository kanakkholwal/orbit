import { tv, type VariantProps } from "tailwind-variants";

export const pageHeader = tv({
	slots: {
		root: "@container/page w-full",
		sentinel: "h-px",
		// Bottom space only without tabs; the tab row sits on the bar's edge.
		bar: "group/bar z-10 bg-background px-4 pt-6 pb-6 transition-[padding,box-shadow] duration-(--duration-base) ease-(--ease-ui-out) @xl/page:px-8 data-[condensed=true]:pt-3 data-[condensed=true]:pb-3 has-[[data-slot=page-header-tabs]]:pb-0 motion-reduce:transition-none",
		// Breadcrumbs and description fold away while condensed.
		fold: "grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-(--duration-base) ease-(--ease-ui-out) group-data-[condensed=true]/bar:grid-rows-[0fr] group-data-[condensed=true]/bar:opacity-0 motion-reduce:transition-none",
		foldInner: "min-h-0 overflow-hidden",
		crumbs: "pb-3",
		row: "flex flex-wrap items-center justify-between gap-x-6 gap-y-3",
		heading: "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1",
		title:
			"truncate font-semibold text-2xl tracking-tight transition-[font-size] duration-(--duration-base) ease-(--ease-ui-out) group-data-[condensed=true]/bar:text-lg @3xl/page:text-3xl @3xl/page:group-data-[condensed=true]/bar:text-lg motion-reduce:transition-none",
		side: "flex items-center gap-3",
		description:
			"max-w-160 pt-2 text-pretty text-muted-foreground text-sm leading-relaxed",
		tabs: "mt-4 group-data-[condensed=true]/bar:mt-2",
		tabList: "w-full justify-start border-b-0",
		tabCount: "ml-1.5 text-muted-foreground text-xs tabular-nums",
		panels: "px-4 py-6 @xl/page:px-8",
	},
	variants: {
		/** `sticky` pins the header and condenses it once the page scrolls; `static` scrolls away. */
		variant: {
			static: { bar: "border-border border-b" },
			sticky: {
				bar: "sticky top-0 border-border border-b bg-background/90 backdrop-blur data-[condensed=true]:shadow-sm",
			},
		},
	},
	defaultVariants: { variant: "static" },
});

export type PageHeaderVariant = NonNullable<VariantProps<typeof pageHeader>["variant"]>;
