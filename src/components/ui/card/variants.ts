import { tv, type VariantProps } from "tailwind-variants";

/** `default` sits on the page with a border; `secondary` is the grey card step; `framed` adds Dialog's rim. */
export const cardFrame = tv({
	slots: {
		root: "rounded-2xl border border-border",
		body: "flex flex-col gap-6 py-6 text-card-foreground",
	},
	variants: {
		variant: {
			// The Lifted ladder makes --card a grey step, so the default card uses the page colour.
			default: { root: "bg-background", body: "" },
			secondary: { root: "border-transparent bg-card", body: "" },
			ghost: { root: "border-transparent bg-transparent", body: "" },
			framed: { root: "bg-background p-1", body: "rounded-[11px] bg-card" },
		},
	},
	defaultVariants: { variant: "default" },
});

export type CardVariant = NonNullable<VariantProps<typeof cardFrame>["variant"]>;
