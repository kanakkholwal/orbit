import { tv, type VariantProps } from "tailwind-variants";

/** Page buttons tint on hover, fill when current and squish on press; `size` is per part, as in shadcn. */
export const pagination = tv({
	slots: {
		link: [
			"grid place-items-center rounded-lg text-muted-foreground tabular-nums outline-none",
			"transition-[color,background-color,scale] [transition-duration:var(--duration-fast),var(--duration-fast),var(--duration-slow)] ease-[var(--ease-out-quart)]",
			"hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[var(--press-scale-icon)]",
			"aria-[current=page]:bg-foreground/[0.08] aria-[current=page]:font-medium aria-[current=page]:text-foreground",
			"disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none",
		],
		nav: "border border-border",
	},
	variants: {
		size: {
			sm: { link: "size-7 text-xs [&_svg]:size-3" },
			md: { link: "size-8 text-sm [&_svg]:size-3.5" },
			lg: { link: "size-9 text-sm [&_svg]:size-4" },
		},
	},
	defaultVariants: { size: "md" },
});

export type PaginationSize = NonNullable<VariantProps<typeof pagination>["size"]>;
