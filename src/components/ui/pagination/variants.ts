import { tv, type VariantProps } from "tailwind-variants";

/** Page buttons tint on hover, fill when current and squish on press; `size` is per part, as in shadcn. */
export const pagination = tv({
	slots: {
		link: [
			"grid place-items-center text-muted-foreground tabular-nums outline-none",
			"transition-[color,background-color,scale] [transition-duration:var(--duration-fast),var(--duration-fast),var(--duration-slow)] ease-[var(--ease-out-quart)]",
			"hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[var(--press-scale-icon)]",
			"aria-[current=page]:bg-foreground/[0.08] aria-[current=page]:font-medium aria-[current=page]:text-foreground",
			"disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none",
		],
		nav: "border border-border",
	},
	variants: {
		size: {
			// Square links on the control ladder; min-w lets long page numbers widen them.
			xs: { link: "h-6 min-w-6 rounded-sm px-1 text-xs [&_svg]:size-3" },
			sm: { link: "h-8 min-w-8 rounded-md px-1.5 text-xs [&_svg]:size-3.5" },
			default: { link: "h-9 min-w-9 rounded-lg px-1.5 text-sm [&_svg]:size-4" },
			lg: { link: "h-10 min-w-10 rounded-lg px-2 text-sm [&_svg]:size-4" },
			xl: { link: "h-12 min-w-12 rounded-xl px-2.5 text-base [&_svg]:size-4.5" },
		},
	},
	defaultVariants: { size: "default" },
});

export type PaginationSize = NonNullable<VariantProps<typeof pagination>["size"]>;
