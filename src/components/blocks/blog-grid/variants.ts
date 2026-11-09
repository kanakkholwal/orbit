import { tv, type VariantProps } from "tailwind-variants";

export const blogGrid = tv({
	slots: {
		root: "@container/blog w-full bg-background text-foreground",
		inner: "mx-auto w-full max-w-280 px-4 py-16 @xl/blog:px-8",
		header: "mb-8 grid gap-3",
		title: "text-balance font-semibold text-3xl tracking-tight @3xl/blog:text-4xl",
		description: "max-w-136 text-pretty text-base text-muted-foreground leading-relaxed",
		filters: "mb-8 max-w-full overflow-x-auto",
		// Page and filter changes ease this frame's height; see easeHeight.
		frame:
			"overflow-clip transition-[height] duration-(--duration-collapse) ease-(--ease-out-quad) motion-reduce:transition-none",
		page: "grid gap-10 transition-[opacity,translate] duration-(--duration-base) ease-(--ease-ui-out) starting:translate-x-[calc(var(--dir)*24px)] starting:opacity-0 motion-reduce:transition-none",
		grid: "grid gap-x-6 gap-y-10 @xl/blog:grid-cols-2 @4xl/blog:grid-cols-3",
		card: "group/post grid content-start gap-4 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
		imageFrame: "aspect-[16/10] overflow-hidden rounded-2xl bg-muted",
		image:
			"size-full object-cover transition-[scale] duration-(--duration-slow) ease-(--ease-ui-out) group-hover/post:scale-[1.03] motion-reduce:transition-none",
		body: "grid gap-2",
		meta: "flex gap-1.5 text-muted-foreground text-xs",
		cardTitle:
			"text-balance font-semibold text-lg leading-snug tracking-tight group-hover/post:underline group-hover/post:underline-offset-4",
		excerpt: "line-clamp-2 text-pretty text-muted-foreground text-sm leading-relaxed",
		byline: "mt-1 flex items-center gap-2 text-sm",
		author: "font-medium",
		readTime: "text-muted-foreground before:mr-2 before:content-['·']",
		pagination: "mt-12",
		empty: "py-16 text-center text-muted-foreground text-sm",
		reader:
			"mx-auto grid max-w-180 gap-6 transition-opacity duration-(--duration-base) starting:opacity-0 motion-reduce:transition-none",
		back: "justify-self-start",
		readerTitle: "text-balance font-semibold text-3xl tracking-tight @3xl/blog:text-4xl",
		readerImage: "aspect-[16/9] overflow-hidden rounded-2xl bg-muted",
		featuredCard:
			"@3xl/blog:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] @3xl/blog:items-center @3xl/blog:gap-10",
		featuredTitle: "text-2xl @3xl/blog:text-3xl",
		featuredExcerpt: "line-clamp-3 text-base",
		readerBody:
			"grid gap-4 text-pretty text-base leading-relaxed [&>p:first-child]:text-lg [&>p:first-child]:text-foreground [&>p]:text-muted-foreground",
	},
	variants: {
		/** `featured` leads page one with the newest (or `featured`) post as a wide card; `grid` keeps every card equal. */
		variant: {
			featured: {},
			grid: {},
		},
	},
	defaultVariants: { variant: "featured" },
});

export type BlogGridVariant = NonNullable<VariantProps<typeof blogGrid>["variant"]>;
