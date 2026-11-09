import { tv, type VariantProps } from "tailwind-variants";

export const scrollArea = tv({
	slots: {
		root: "relative overflow-hidden",
		viewport: "size-full overscroll-contain rounded-[inherit] outline-none",
	},
	variants: {
		scrollbar: {
			auto: {},
			hidden: {
				viewport:
					"overflow-x-hidden! overflow-y-auto! [scrollbar-gutter:auto] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
			},
		},
	},
	defaultVariants: { scrollbar: "auto" },
});

export type ScrollAreaScrollbar = NonNullable<
	VariantProps<typeof scrollArea>["scrollbar"]
>;
