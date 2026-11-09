import { tv, type VariantProps } from "tailwind-variants";

export const skeleton = tv({
	// Size defaults live in classes so a caller's own `h-*`/`w-*` wins, as with shadcn's.
	base: "skeleton-shimmer h-4 w-full bg-card",
	variants: {
		shape: {
			line: "rounded-md",
			circle: "rounded-full",
			block: "rounded-xl",
		},
	},
	defaultVariants: { shape: "line" },
});

export type SkeletonShape = NonNullable<VariantProps<typeof skeleton>["shape"]>;

/** Skeleton around real content: both share one cell, so the placeholder takes the content's shape and the reveal never jumps. */
export const skeletonReveal = tv({
	slots: {
		root: "grid",
		placeholder:
			"col-start-1 row-start-1 h-full w-full transition-opacity duration-(--duration-base) ease-(--ease-ui-out) data-[loading=false]:pointer-events-none data-[loading=false]:opacity-0 motion-reduce:transition-none",
		content:
			"col-start-1 row-start-1 min-w-0 transition-opacity duration-(--duration-base) ease-(--ease-ui-out) data-[loading=true]:invisible data-[loading=true]:opacity-0 motion-reduce:transition-none",
	},
});
