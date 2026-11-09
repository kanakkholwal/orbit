import { tv, type VariantProps } from "tailwind-variants";

/** Parts follow shadcn/ui; `layout` and `size` on Empty reach the parts through `group/empty`. */
export const empty = tv({
	slots: {
		root: "group/empty flex w-full min-w-0 flex-1 text-balance",
		header: [
			"flex max-w-sm flex-col items-center gap-2 text-center",
			"group-data-[layout=horizontal]/empty:items-start group-data-[layout=horizontal]/empty:text-left",
		],
		title: [
			"font-medium text-foreground text-lg tracking-tight",
			// Words rise out of a soft blur when the state appears; a remount (new key) replays it.
			"transition-[translate,opacity,filter] delay-75 duration-(--duration-base) ease-(--ease-ui-out) starting:translate-y-[0.3em] starting:opacity-0 starting:blur-[2px] motion-reduce:transition-none",
			"group-data-[size=sm]/empty:text-base group-data-[size=lg]/empty:text-xl",
		],
		description: [
			"transition-[translate,opacity,filter] delay-100 duration-(--duration-base) ease-(--ease-ui-out) starting:translate-y-[0.3em] starting:opacity-0 starting:blur-[2px] motion-reduce:transition-none",
			"text-muted-foreground text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
			"group-data-[size=sm]/empty:text-xs/relaxed",
		],
		content: [
			"flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm",
			"group-data-[layout=horizontal]/empty:w-auto group-data-[layout=horizontal]/empty:items-end",
		],
	},
	variants: {
		variant: {
			default: {},
			// The classic drop zone: a dashed frame that says "something goes here".
			outline: { root: "rounded-xl border border-border border-dashed" },
			card: { root: "rounded-xl border border-border bg-card" },
		},
		layout: {
			vertical: { root: "flex-col items-center justify-center text-center" },
			// For inline slots like a table body: media and words left, actions right.
			horizontal: {
				root: "flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between",
			},
		},
		size: {
			sm: { root: "gap-4 p-4" },
			default: { root: "gap-6 p-6 md:p-10" },
			lg: { root: "gap-8 p-8 md:p-16" },
		},
	},
	defaultVariants: { variant: "default", layout: "vertical", size: "default" },
});

/** The art above the title: as-is, or an icon on a toned tile. */
export const emptyMedia = tv({
	base: [
		"flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
		"transition-[scale,opacity,filter] duration-(--duration-spring-snappy) ease-(--ease-spring-snappy) starting:scale-60 starting:opacity-0 starting:blur-[2px] motion-reduce:transition-none",
	],
	variants: {
		variant: {
			default: "mb-2 group-data-[layout=horizontal]/empty:mb-0",
			icon: "mb-2 size-10 rounded-xl group-data-[layout=horizontal]/empty:mb-0 [&_svg:not([class*='size-'])]:size-5",
		},
		tone: {
			neutral: "",
			primary: "",
			success: "",
			warning: "",
			destructive: "",
			info: "",
		},
	},
	compoundVariants: [
		{
			variant: "icon",
			tone: "neutral",
			class: "border border-border bg-card text-foreground",
		},
		{ variant: "icon", tone: "primary", class: "bg-primary/10 text-primary" },
		{
			variant: "icon",
			tone: "success",
			class:
				"bg-[color-mix(in_oklch,var(--success)_12%,transparent)] text-success-strong",
		},
		{
			variant: "icon",
			tone: "warning",
			class:
				"bg-[color-mix(in_oklch,var(--warning)_14%,transparent)] text-warning-strong",
		},
		{
			variant: "icon",
			tone: "destructive",
			class:
				"bg-[color-mix(in_oklch,var(--destructive)_12%,transparent)] text-destructive-strong",
		},
		{
			variant: "icon",
			tone: "info",
			class: "bg-[color-mix(in_oklch,var(--info)_12%,transparent)] text-info-strong",
		},
		// A bare glyph takes the tone as its colour, so `tone` is never a dead prop.
		{ variant: "default", tone: "primary", class: "text-primary" },
		{ variant: "default", tone: "success", class: "text-success-strong" },
		{ variant: "default", tone: "warning", class: "text-warning-strong" },
		{ variant: "default", tone: "destructive", class: "text-destructive-strong" },
		{ variant: "default", tone: "info", class: "text-info-strong" },
	],
	defaultVariants: { variant: "default", tone: "neutral" },
});

export type EmptyVariant = NonNullable<VariantProps<typeof empty>["variant"]>;
export type EmptyLayout = NonNullable<VariantProps<typeof empty>["layout"]>;
export type EmptySize = NonNullable<VariantProps<typeof empty>["size"]>;
export type EmptyMediaVariant = NonNullable<VariantProps<typeof emptyMedia>["variant"]>;
export type EmptyMediaTone = NonNullable<VariantProps<typeof emptyMedia>["tone"]>;

/** The morphing illustration; each path's colours follow its `data-tone` and cross-fade while shapes spring. */
export const emptyIllustration = tv({
	slots: {
		root: "mb-2 w-full max-w-72 group-data-[layout=horizontal]/empty:mb-0",
		svg: "block h-auto w-full overflow-visible",
		shape: [
			"fill-none stroke-none stroke-[1.5px] [stroke-linecap:round] [stroke-linejoin:round] [vector-effect:non-scaling-stroke]",
			"transition-[fill,stroke] duration-(--duration-slow) motion-reduce:transition-none",
			"data-[tone=outline]:fill-background data-[tone=outline]:stroke-foreground",
			"data-[tone=ink]:fill-background data-[tone=ink]:stroke-foreground data-[tone=accent]:fill-background data-[tone=accent]:stroke-primary",
			"data-[tone=tuck]:fill-background data-[tone=tuck]:stroke-border data-[tone=slot]:fill-background data-[tone=slot]:stroke-border",
			"data-[tone=subtle]:fill-background data-[tone=subtle]:stroke-border data-[tone=back]:fill-background data-[tone=back]:stroke-muted-foreground",
			"data-[tone=muted]:fill-background data-[tone=muted]:stroke-muted-foreground data-[tone=shade]:fill-muted data-[tone=shade]:stroke-foreground",
			"data-[tone=query]:fill-muted-foreground data-[tone=bar]:fill-border data-[tone=dot]:fill-foreground",
			"data-[tone=success]:fill-background data-[tone=success]:stroke-success data-[tone=warning]:fill-background data-[tone=warning]:stroke-warning",
			"data-[kind=mark]:fill-none data-[kind=stroke]:fill-none",
		],
	},
	variants: {
		size: {
			sm: { root: "max-w-48" },
			default: { root: "max-w-72" },
			lg: { root: "max-w-96" },
		},
	},
	defaultVariants: { size: "default" },
});

export type EmptyIllustrationSize = NonNullable<
	VariantProps<typeof emptyIllustration>["size"]
>;
