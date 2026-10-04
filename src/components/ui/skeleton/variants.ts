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
