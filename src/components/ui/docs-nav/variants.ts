import { tv, type VariantProps } from "tailwind-variants";

export const docsNav = tv({
	slots: {
		root: "flex flex-col",
		section: "border-border/60 border-t py-2 first:border-t-0 first:pt-0",
		// pl-1.5: the trigger's chevron (14px) and gap (8px) land the label on the rows' pl-7.
		trigger:
			"h-8 w-full justify-start gap-1.5 pr-3 pl-1.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider hover:text-foreground",
		count:
			"inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground/[0.06] px-1 font-medium text-xs text-foreground/70 tabular-nums",
		sectionIcon: "size-4 shrink-0 text-muted-foreground",
		sectionLabel: "min-w-0",
		topLink:
			"flex h-8 items-center gap-2 rounded-lg px-2 font-medium text-sm outline-none transition-colors duration-(--duration-fast) focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
		content: "px-0 pt-1 pb-1",
		list: "relative",
		pill: "pointer-events-none absolute right-0 rounded-md bg-foreground/[0.06] transition-[transform,height,opacity] duration-[var(--duration-dropdown)] ease-[var(--ease-ui-out)] motion-reduce:transition-none",
		row: "relative",
		marker:
			"pointer-events-none absolute duration-[var(--duration-dropdown)] ease-[var(--ease-ui-out)] motion-reduce:transition-none",
		rail: "pointer-events-none absolute top-1/2 bottom-0 left-3 border-foreground/20 border-l",
		link: "relative z-[1] flex items-center justify-between gap-2 py-1.5 pr-3 pl-7 text-sm outline-none transition-[color,opacity] duration-(--duration-fast) focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none",
		label:
			"truncate transition-transform duration-[var(--duration-dropdown)] ease-[var(--ease-ui-out)] motion-reduce:transition-none",
		badge: "h-4.5 rounded px-1 text-[11px]",
	},
	variants: {
		variant: {
			default: {},
			sidebar: {
				root: "gap-0.5",
				section: "border-t-0 py-0.5 first:pt-0",
				trigger:
					"h-8 rounded-lg px-2 font-normal text-foreground/80 text-sm normal-case tracking-normal hover:bg-foreground/[0.04] hover:text-foreground [&>[data-slot=collapsible-icon]]:order-last [&>[data-slot=collapsible-icon]]:ml-auto [&>[data-slot=collapsible-icon]]:duration-[var(--duration-dropdown)] [&[data-panel-open]>[data-slot=collapsible-icon]]:duration-[var(--duration-collapse)] [&[data-state=open]>[data-slot=collapsible-icon]]:duration-[var(--duration-collapse)]",
				count: "ml-auto mr-1 bg-transparent text-muted-foreground",
				sectionLabel: "flex-1 truncate",
				// Same weight, size and row height as the links inside each section.
				topLink: "h-8 font-normal text-foreground/80 hover:text-foreground",
				content: "pt-0 pb-1",
			},
		},
		sectionCurrent: {
			true: {},
			false: {},
		},
		connector: {
			tick: {
				pill: "left-0",
				row: "[--docs-nav-rung-w:0.75rem] [--docs-nav-rung-x:0.25rem]",
				marker:
					"top-1/2 left-1 h-px -translate-y-1/2 transition-[width,background-color]",
			},
			curve: {
				pill: "left-5",
				row: "[--docs-nav-rung-w:0.5rem] [--docs-nav-rung-x:0.125rem]",
				marker:
					"top-0 left-3 h-1/2 rounded-bl-[7px] border-b border-l transition-[width,border-color]",
			},
		},
		// Rungs at 0/25/75% plus the row midline give one unbroken 8px ladder across 32px rows.
		rungs: {
			true: {
				row: "[--docs-nav-rung:color-mix(in_oklch,var(--foreground)_18%,transparent)] [background:linear-gradient(var(--docs-nav-rung),var(--docs-nav-rung))_var(--docs-nav-rung-x)_0/var(--docs-nav-rung-w)_1px_no-repeat,linear-gradient(var(--docs-nav-rung),var(--docs-nav-rung))_var(--docs-nav-rung-x)_25%/var(--docs-nav-rung-w)_1px_no-repeat,linear-gradient(var(--docs-nav-rung),var(--docs-nav-rung))_var(--docs-nav-rung-x)_75%/var(--docs-nav-rung-w)_1px_no-repeat]",
			},
			false: {},
		},
		// The pill fades on leave but keeps its place, so the next hover still glides from it.
		hovering: { true: { pill: "opacity-100" }, false: { pill: "opacity-0" } },
		state: {
			rest: { link: "text-foreground/70 hover:text-foreground" },
			dimmed: { link: "text-foreground/70 opacity-60" },
			hovered: { link: "text-foreground" },
			active: { link: "font-medium text-foreground" },
		},
	},
	compoundVariants: [
		{
			variant: "sidebar",
			sectionCurrent: true,
			class: {
				trigger: "bg-foreground/[0.06] font-medium text-foreground",
				topLink: "bg-foreground/[0.06] font-medium text-foreground",
			},
		},
		{
			variant: "sidebar",
			sectionCurrent: false,
			class: {
				topLink: "text-foreground/80 hover:bg-foreground/[0.04] hover:text-foreground",
			},
		},
		{
			connector: "tick",
			state: ["rest", "dimmed", "hovered"],
			class: { marker: "bg-foreground/35" },
		},
		{ connector: "tick", state: "active", class: { marker: "bg-foreground" } },
		{
			connector: "curve",
			state: ["rest", "dimmed"],
			class: { marker: "border-foreground/20" },
		},
		{ connector: "curve", state: "hovered", class: { marker: "border-foreground/50" } },
		{ connector: "curve", state: "active", class: { marker: "border-foreground" } },
		{
			connector: "tick",
			rungs: true,
			state: ["rest", "dimmed"],
			class: { marker: "bg-[var(--docs-nav-rung)]" },
		},
		{ rungs: true, state: "active", class: { label: "translate-x-2" } },
	],
	defaultVariants: {
		variant: "default",
		sectionCurrent: false,
		connector: "tick",
		rungs: false,
		hovering: false,
		state: "rest",
	},
});

export type DocsNavConnector = NonNullable<VariantProps<typeof docsNav>["connector"]>;
export type DocsNavVariant = NonNullable<VariantProps<typeof docsNav>["variant"]>;
export type DocsNavRowState = NonNullable<VariantProps<typeof docsNav>["state"]>;

const MARKER_WIDTH: Record<DocsNavConnector, Record<DocsNavRowState, number>> = {
	tick: { rest: 10, dimmed: 10, hovered: 16, active: 20 },
	curve: { rest: 10, dimmed: 10, hovered: 12, active: 14 },
};

/** Marker length in px: grows on hover, longest when active; with rungs the tick matches them. */
export function markerWidth(
	connector: DocsNavConnector,
	rungs: boolean,
	state: DocsNavRowState,
): number {
	if (rungs && connector === "tick")
		return { rest: 12, dimmed: 12, hovered: 18, active: 28 }[state];
	return MARKER_WIDTH[connector][state];
}

export function rowState(
	active: boolean,
	hovered: boolean,
	anyHovered: boolean,
): DocsNavRowState {
	if (active) return "active";
	if (hovered) return "hovered";
	return anyHovered ? "dimmed" : "rest";
}
