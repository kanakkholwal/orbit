import { tv, type VariantProps } from "tailwind-variants";

export const avatar = tv({
	base: "relative inline-grid shrink-0 place-items-center overflow-hidden bg-card",
	variants: {
		size: {
			sm: "size-8 text-xs",
			md: "size-10 text-sm",
			lg: "size-14 text-base",
			xl: "size-20 text-xl",
		},
		shape: {
			circle: "rounded-full",
			square: "rounded-lg",
		},
	},
	defaultVariants: { size: "md", shape: "circle" },
});

export type AvatarSize = NonNullable<VariantProps<typeof avatar>["size"]>;
export type AvatarShape = NonNullable<VariantProps<typeof avatar>["shape"]>;
