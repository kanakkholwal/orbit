import { tv, type VariantProps } from "tailwind-variants";

export const changelogFeed = tv({
	slots: {
		root: "@container/log w-full bg-background text-foreground",
		inner: "mx-auto w-full max-w-200 px-4 py-16 @xl/log:px-8",
		header: "mb-6 flex flex-wrap items-end justify-between gap-4",
		heading: "grid gap-2",
		title: "text-balance font-semibold text-3xl tracking-tight",
		description: "text-muted-foreground text-sm",
		toolbar: "mb-4 flex flex-wrap items-center justify-between gap-3",
		count: "text-muted-foreground text-sm tabular-nums",
		filterCount: "text-muted-foreground tabular-nums",
		// A month folds away once every entry in it is filtered out; clip keeps its heading sticky.
		month:
			"grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-(--duration-collapse) ease-(--ease-out-quad) data-[hidden=true]:grid-rows-[0fr] data-[hidden=true]:opacity-0 motion-reduce:transition-none",
		monthInner: "relative min-h-0 overflow-clip",
		// Each month heading sticks while its entries scroll under it.
		monthLabel:
			"sticky top-0 z-1 border-border border-b bg-background/90 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider backdrop-blur",
		list: "divide-y-0 rounded-none border-0",
		row: "grid grid-rows-[1fr] border-border border-b opacity-100 transition-[grid-template-rows,opacity,border-color] duration-(--duration-collapse) ease-(--ease-out-quad) data-[hidden=true]:grid-rows-[0fr] data-[hidden=true]:border-transparent data-[hidden=true]:opacity-0 motion-reduce:transition-none",
		rowInner: "min-h-0 overflow-hidden",
		trigger: "items-start gap-4 px-1 py-4 hover:bg-transparent",
		triggerBody:
			"grid min-w-0 flex-1 gap-1.5 @xl/log:grid-cols-[6rem_minmax(0,1fr)] @xl/log:gap-x-6",
		meta: "flex gap-2 font-normal text-muted-foreground text-xs @xl/log:grid @xl/log:gap-0.5",
		version: "font-mono",
		body: "grid gap-1",
		titleLine: "flex flex-wrap items-center gap-2 font-medium text-base text-foreground",
		summary: "font-normal text-muted-foreground text-sm leading-relaxed",
		panel: "grid gap-4 pr-10 pb-5 pl-1 @xl/log:pl-[calc(6rem+1.75rem)]",
		details:
			"grid list-disc gap-1.5 pl-4 text-muted-foreground text-sm leading-relaxed marker:text-border",
		figure: "grid gap-2",
		photo: "aspect-[3/2] w-full overflow-hidden rounded-xl bg-muted object-cover",
		caption: "text-muted-foreground text-xs",
		end: "pt-8 text-center text-muted-foreground text-sm",
		empty: "py-12 text-center text-muted-foreground text-sm",
	},
	variants: {
		/** `timeline` threads the entries on a rail; `list` is plain rows. */
		variant: {
			list: {},
			timeline: {
				monthInner: "border-border border-l pl-5 @xl/log:pl-6",
				monthLabel: "-ml-5 pl-5 @xl/log:-ml-6 @xl/log:pl-6",
				row: "relative before:absolute before:top-6 before:-left-5 before:size-2 before:-translate-x-[calc(50%+0.5px)] before:rounded-full before:bg-border data-[open]:before:bg-primary data-[state=open]:before:bg-primary @xl/log:before:-left-6",
			},
		},
	},
	defaultVariants: { variant: "list" },
});

export type ChangelogFeedVariant = NonNullable<
	VariantProps<typeof changelogFeed>["variant"]
>;
