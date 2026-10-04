import { tv, type VariantProps } from "tailwind-variants";

export const radioGroup = tv({
	slots: {
		root: "flex gap-2",
		label: "inline-flex cursor-pointer items-start gap-2.5 text-foreground",
		ring: [
			"mt-0.5 grid shrink-0 place-items-center rounded-full border-2 border-muted-foreground/50 bg-background transition-colors",
			"peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
		],
		dot: "radio-dot rounded-full bg-primary",
	},
	variants: {
		variant: {
			default: {},
			card: {
				label:
					"rounded-xl border border-border bg-card px-3.5 py-3 transition-colors hover:border-border-strong has-checked:border-primary",
			},
			// Menu-style rows: the checked row is tinted, for pickers inside a popover.
			list: {
				root: "gap-0.5",
				label: [
					"w-full items-center rounded-md px-2 py-1.5 transition-colors hover:bg-foreground/[0.06]",
					"has-data-checked:bg-foreground/[0.06] has-data-[state=checked]:bg-foreground/[0.06] has-data-checked:font-medium has-data-[state=checked]:font-medium",
				],
				ring: "mt-0",
			},
		},
		size: {
			sm: { label: "text-xs", ring: "size-3.5", dot: "size-1.5" },
			md: { label: "text-sm", ring: "size-4", dot: "size-2" },
			lg: { label: "text-sm", ring: "size-5", dot: "size-2.5" },
			xl: { label: "text-base", ring: "size-6", dot: "size-3" },
		},
		orientation: {
			vertical: { root: "flex-col" },
			horizontal: { root: "flex-row flex-wrap items-start" },
		},
	},
	defaultVariants: { variant: "default", size: "md", orientation: "vertical" },
});

export type RadioVariant = NonNullable<VariantProps<typeof radioGroup>["variant"]>;
export type RadioSize = NonNullable<VariantProps<typeof radioGroup>["size"]>;
export type RadioOrientation = NonNullable<
	VariantProps<typeof radioGroup>["orientation"]
>;
