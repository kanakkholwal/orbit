import { tv, type VariantProps } from "tailwind-variants";
import { controlSize, fieldFrame, fieldText } from "$lib/control.js";

export const nativeSelect = tv({
	slots: {
		wrapper: "group/native-select relative w-fit has-[select:disabled]:opacity-50",
		select: [
			fieldFrame({ kind: "trigger" }),
			"w-full min-w-0 appearance-none disabled:pointer-events-none disabled:opacity-100",
		],
		icon: "pointer-events-none absolute top-1/2 -translate-y-1/2 select-none text-muted-foreground",
		option: "bg-[Canvas] text-[CanvasText]",
	},
	variants: {
		size: {
			xs: {
				select: [controlSize({ size: "xs" }), fieldText({ size: "xs" }), "pr-6 pl-2"],
				icon: "right-2 size-3",
			},
			sm: {
				select: [controlSize({ size: "sm" }), fieldText({ size: "sm" }), "pr-7 pl-2.5"],
				icon: "right-2.5 size-3.5",
			},
			default: {
				select: [
					controlSize({ size: "default" }),
					fieldText({ size: "default" }),
					"pr-8 pl-3",
				],
				icon: "right-3 size-4",
			},
			lg: {
				select: [controlSize({ size: "lg" }), fieldText({ size: "lg" }), "pr-9 pl-3.5"],
				icon: "right-3.5 size-4",
			},
			xl: {
				select: [controlSize({ size: "xl" }), fieldText({ size: "xl" }), "pr-10 pl-4"],
				icon: "right-4 size-4.5",
			},
		},
	},
	defaultVariants: { size: "default" },
});

export type NativeSelectSize = NonNullable<VariantProps<typeof nativeSelect>["size"]>;
