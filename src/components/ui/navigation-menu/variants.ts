import { tv, type VariantProps } from "tailwind-variants";
import { popover } from "$components/ui/popover/variants.js";

/** Trigger and top-level link look; shadcn's name, so shadcn blocks can import it. */
export const navigationMenuTriggerStyle = tv({
	base: [
		"group/navigation-menu-trigger inline-flex w-max items-center justify-center font-medium outline-none",
		// bg-muted matches card and popover surfaces, so the fill is a foreground tint like ghost buttons.
		"transition-[color,background-color,scale] [transition-duration:var(--duration-instant),var(--duration-instant),var(--duration-slow)] ease-[var(--ease-out-quart)]",
		"hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring active:scale-[var(--press-scale-sm)]",
		"data-[state=open]:bg-accent data-[popup-open]:bg-accent",
		"disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none",
	],
	variants: {
		size: {
			sm: "h-8 rounded-md px-2 text-xs",
			default: "h-9 rounded-lg px-2.5 text-sm",
		},
	},
	defaultVariants: { size: "default" },
});

export type NavigationMenuSize = NonNullable<
	VariantProps<typeof navigationMenuTriggerStyle>["size"]
>;

/** The visual contract both ports share; motion is per primitive, as in shadcn's two ports. */
export const navigationMenu = tv({
	slots: {
		// h-fit: a stretched root (grid or flex parent) hung the panel far below the trigger.
		root: "group/navigation-menu relative flex h-fit min-w-0 max-w-max items-center justify-center",
		list: "group flex flex-1 list-none items-center justify-center gap-0",
		item: "relative",
		chevron: [
			"relative top-px ml-1 size-3 shrink-0 transition-transform duration-[var(--duration-overlay)] ease-[var(--ease-ui-out)]",
			"group-data-[state=open]/navigation-menu-trigger:rotate-180",
			"group-data-[popup-open]/navigation-menu-trigger:rotate-180 motion-reduce:transition-none",
		],
		content:
			"p-2 has-data-[slot=navigation-menu-body]:p-0 **:data-[slot=navigation-menu-link]:focus:ring-0",
		body: "p-2",
		footer:
			"flex min-h-11 items-center justify-between gap-4 border-border border-t px-3 py-2 text-xs",
		// Popover's own surface, so the panel and every popover look the same.
		viewport: [
			popover().surface(),
			"overflow-hidden [--navigation-menu-spacing:calc(1rem+2px)]",
		],
		// The panel's rows follow the menu row contract: tint on hover and focus, squish on press.
		link: [
			"flex flex-col gap-0.5 rounded-md p-2 text-sm outline-none",
			"transition-[background-color,scale] [transition-duration:var(--duration-instant),var(--duration-slow)] ease-[var(--ease-out-quart)]",
			"hover:bg-accent focus:bg-accent active:scale-[var(--press-scale-row)]",
			"data-[active]:bg-foreground/[0.06] aria-[current=page]:bg-foreground/[0.06] motion-reduce:transition-none",
		],
		indicator: "top-full z-10 flex h-1.5 items-end justify-center overflow-hidden",
		indicatorArrow:
			"relative top-[60%] size-2 rotate-45 rounded-tl-sm bg-border shadow-md",
	},
	variants: {
		variant: {
			default: {},
			// The rim lives on the content: the primitive sizes the viewport from it, so viewport padding is lost.
			framed: {
				viewport: ["rounded-2xl bg-card [--navigation-menu-spacing:calc(0.5rem+2px)]"],
				content: [
					"p-1 has-data-[slot=navigation-menu-body]:p-1",
					"not-has-data-[slot=navigation-menu-body]:*:rounded-[11px] not-has-data-[slot=navigation-menu-body]:*:border not-has-data-[slot=navigation-menu-body]:*:border-border not-has-data-[slot=navigation-menu-body]:*:bg-popover not-has-data-[slot=navigation-menu-body]:*:p-2 not-has-data-[slot=navigation-menu-body]:*:shadow-surface",
				],
				body: "rounded-[11px] border border-border bg-popover shadow-surface",
				footer: "border-t-0 px-3 pt-2 pb-1",
			},
		},
	},
	defaultVariants: { variant: "default" },
});

export type NavigationMenuVariant = NonNullable<
	VariantProps<typeof navigationMenu>["variant"]
>;
