import { tv, type VariantProps } from "tailwind-variants";

// Open state is `data-popup-open` from Base UI and `data-state=open` from bits-ui.
export const selectTrigger = tv({
	base: "inline-flex items-center justify-between gap-2 text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
	variants: {
		variant: {
			default: [
				"w-full rounded-lg border border-input bg-background",
				"hover:border-border-strong focus-visible:border-ring data-[popup-open]:border-ring data-[state=open]:border-ring",
			],
			// Text and a chevron: a compact switch beside a heading, not a form field.
			ghost: [
				"w-auto rounded-md font-medium text-muted-foreground",
				"hover:bg-foreground/[0.06] hover:text-foreground",
				"data-[popup-open]:bg-foreground/[0.06] data-[popup-open]:text-foreground data-[state=open]:bg-foreground/[0.06] data-[state=open]:text-foreground",
			],
		},
		size: {
			xs: "h-6 gap-1 px-1.5 text-xs [&_svg]:size-3",
			sm: "h-8 px-2.5 text-xs",
			default: "h-9 px-3 text-sm",
		},
	},
	defaultVariants: { variant: "default", size: "default" },
});

// Pair with the trigger's size; every size grows past a short trigger to fit its rows.
export const selectContent = tv({
	variants: {
		size: {
			xs: [
				"rounded-lg",
				"**:data-[slot=select-item]:gap-3 **:data-[slot=select-item]:px-2 **:data-[slot=select-item]:py-1 **:data-[slot=select-item]:text-xs",
				"[&_[data-slot=select-item]_svg]:size-3",
			],
			sm: [
				"**:data-[slot=select-item]:gap-3 **:data-[slot=select-item]:py-1 **:data-[slot=select-item]:text-xs",
				"[&_[data-slot=select-item]_svg]:size-3",
			],
			default: "",
		},
	},
	defaultVariants: { size: "default" },
});

export type SelectContentSize = NonNullable<VariantProps<typeof selectContent>["size"]>;

export type SelectTriggerVariant = NonNullable<
	VariantProps<typeof selectTrigger>["variant"]
>;
export type SelectTriggerSize = NonNullable<VariantProps<typeof selectTrigger>["size"]>;
