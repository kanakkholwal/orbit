import { tv, type VariantProps } from "tailwind-variants";

// The list is the control height in every variant; triggers fill it, inside any rim padding.
export const tabsFrame = tv({
	slots: {
		list: "relative inline-flex w-max items-stretch",
		trigger:
			"relative z-10 inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:pointer-events-none [&_svg]:shrink-0",
		// The sliding marker, measured from the active trigger.
		indicator:
			"pointer-events-none absolute left-0 transition-[transform,scale,translate,width,height] duration-(--duration-slow) ease-[var(--ease-drawer)] motion-reduce:transition-none",
	},
	variants: {
		variant: {
			pill: {
				list: "gap-1 rounded-full bg-card p-1",
				trigger: "rounded-full aria-selected:text-primary-foreground",
				indicator: "top-1 bottom-1 rounded-full bg-primary",
			},
			segment: {
				list: "gap-0.5 bg-card p-0.5",
				trigger: "aria-selected:text-foreground",
				indicator: "top-0.5 bottom-0.5 border border-border bg-background shadow-sm",
			},
			underline: {
				list: "gap-1 border-border border-b",
				trigger: "rounded-md aria-selected:text-foreground",
				indicator: "-bottom-px h-0.5 rounded-full bg-primary",
			},
			soft: {
				list: "gap-1",
				trigger: "aria-selected:text-foreground",
				indicator: "inset-y-0 bg-foreground/[0.06]",
			},
			outline: {
				list: "gap-1",
				trigger: "aria-selected:text-foreground",
				indicator: "inset-y-0 border border-border",
			},
			enclosed: {
				list: "gap-1 border-border border-b",
				trigger: "aria-selected:text-foreground",
				indicator:
					"-bottom-px top-0 border border-border border-b-background bg-background",
			},
		},
		size: {
			xs: { list: "h-6", trigger: "gap-1 px-2 text-xs [&_svg]:size-3" },
			sm: { list: "h-8", trigger: "gap-1.5 px-2.5 text-xs [&_svg]:size-3.5" },
			default: { list: "h-9", trigger: "gap-2 px-3 text-sm [&_svg]:size-4" },
			lg: { list: "h-10", trigger: "gap-2 px-3.5 text-sm [&_svg]:size-4" },
			xl: { list: "h-12", trigger: "gap-2 px-4 text-base [&_svg]:size-4.5" },
		},
		// Vertical lists grow with their triggers; the marker follows on both axes.
		orientation: {
			horizontal: {},
			vertical: { list: "h-auto w-full flex-col", trigger: "justify-start" },
		},
	},
	compoundVariants: [
		// An edge rule has no vertical form, so selection reads from the trigger text alone.
		{
			variant: ["underline", "enclosed"],
			orientation: "vertical",
			class: { list: "border-b-0", indicator: "hidden" },
		},
		// Stacked triggers take the ladder height the horizontal list gives them by stretching.
		{ orientation: "vertical", size: "xs", class: { trigger: "h-6" } },
		{ orientation: "vertical", size: "sm", class: { trigger: "h-8" } },
		{ orientation: "vertical", size: "default", class: { trigger: "h-9" } },
		{ orientation: "vertical", size: "lg", class: { trigger: "h-10" } },
		{ orientation: "vertical", size: "xl", class: { trigger: "h-12" } },
		// Small pills keep a slimmer rim so the trigger still has room.
		{
			variant: "pill",
			size: ["xs", "sm"],
			class: { list: "gap-0.5 p-0.5", indicator: "top-0.5 bottom-0.5" },
		},
		// Segment: the list takes the ladder radius, the trigger and marker sit 2px inside it.
		{
			variant: "segment",
			size: "xs",
			class: {
				list: "rounded-sm",
				trigger: "rounded-[calc(var(--radius-sm)-2px)]",
				indicator: "rounded-[calc(var(--radius-sm)-2px)]",
			},
		},
		{
			variant: "segment",
			size: "sm",
			class: {
				list: "rounded-md",
				trigger: "rounded-[calc(var(--radius-md)-2px)]",
				indicator: "rounded-[calc(var(--radius-md)-2px)]",
			},
		},
		{
			variant: "segment",
			size: ["default", "lg"],
			class: {
				list: "rounded-lg",
				trigger: "rounded-[calc(var(--radius-lg)-2px)]",
				indicator: "rounded-[calc(var(--radius-lg)-2px)]",
			},
		},
		{
			variant: "segment",
			size: "xl",
			class: {
				list: "rounded-xl",
				trigger: "rounded-[calc(var(--radius-xl)-2px)]",
				indicator: "rounded-[calc(var(--radius-xl)-2px)]",
			},
		},
		// Soft and outline triggers are controls themselves: the ladder radius.
		{
			variant: ["soft", "outline"],
			size: "xs",
			class: { trigger: "rounded-sm", indicator: "rounded-sm" },
		},
		{
			variant: ["soft", "outline"],
			size: "sm",
			class: { trigger: "rounded-md", indicator: "rounded-md" },
		},
		{
			variant: ["soft", "outline"],
			size: ["default", "lg"],
			class: { trigger: "rounded-lg", indicator: "rounded-lg" },
		},
		{
			variant: ["soft", "outline"],
			size: "xl",
			class: { trigger: "rounded-xl", indicator: "rounded-xl" },
		},
		{
			variant: "enclosed",
			size: "xs",
			class: { trigger: "rounded-t-sm", indicator: "rounded-t-sm" },
		},
		{
			variant: "enclosed",
			size: "sm",
			class: { trigger: "rounded-t-md", indicator: "rounded-t-md" },
		},
		{
			variant: "enclosed",
			size: ["default", "lg"],
			class: { trigger: "rounded-t-lg", indicator: "rounded-t-lg" },
		},
		{
			variant: "enclosed",
			size: "xl",
			class: { trigger: "rounded-t-xl", indicator: "rounded-t-xl" },
		},
	],
	defaultVariants: { variant: "pill", size: "default", orientation: "horizontal" },
});

export type TabsVariant = NonNullable<VariantProps<typeof tabsFrame>["variant"]>;
export type TabsSize = NonNullable<VariantProps<typeof tabsFrame>["size"]>;
export type TabsOrientation = NonNullable<VariantProps<typeof tabsFrame>["orientation"]>;
