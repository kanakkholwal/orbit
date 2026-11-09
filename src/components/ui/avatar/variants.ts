import { tv, type VariantProps } from "tailwind-variants";

export const avatar = tv({
	base: "group/avatar relative inline-grid shrink-0 place-items-center bg-card",
	variants: {
		size: {
			sm: "size-8 text-xs",
			default: "size-10 text-sm",
			lg: "size-14 text-base",
			xl: "size-20 text-xl",
		},
		shape: {
			circle: "rounded-full",
			square: "",
		},
	},
	// Square corners scale with the tile, near a quarter of its side.
	compoundVariants: [
		{ shape: "square", size: "sm", class: "rounded-md" },
		{ shape: "square", size: "default", class: "rounded-lg" },
		{ shape: "square", size: "lg", class: "rounded-xl" },
		{ shape: "square", size: "xl", class: "rounded-3xl" },
	],
	defaultVariants: { size: "default", shape: "circle" },
});

// Group members overlap on a background ring, lift on hover, and pop in when they join.
export const avatarGroup = tv({
	slots: {
		root: [
			"group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
			"*:transition-[translate,scale,opacity] *:duration-(--duration-fast) *:ease-(--ease-ui-out) *:hover:-translate-y-0.5 *:starting:scale-75 *:starting:opacity-0 motion-reduce:*:transition-none",
		],
		count: "font-medium text-muted-foreground tabular-nums ring-2 ring-background",
		badge: [
			"absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none",
			"group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
			"group-data-[size=lg]/avatar:size-3.5 group-data-[size=lg]/avatar:[&>svg]:size-2.5 group-data-[size=xl]/avatar:size-5 group-data-[size=xl]/avatar:[&>svg]:size-3",
		],
	},
});

export type AvatarSize = NonNullable<VariantProps<typeof avatar>["size"]>;
export type AvatarShape = NonNullable<VariantProps<typeof avatar>["shape"]>;
