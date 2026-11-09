import { tv, type VariantProps } from "tailwind-variants";

/** `default` sits on the page with a border; `secondary` is the grey card step; `framed` adds Dialog's
 * rim; `well` is a grey rim around a raised page-colour body, with CardFooter in the rim. */
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
			// A child selector restyles the rim footer, so CardFooter needs no context (RSC-safe).
			well: {
				root: "border-transparent bg-card p-1 [&>[data-slot=card-footer]]:px-3 [&>[data-slot=card-footer]]:pt-2 [&>[data-slot=card-footer]]:pb-1 [&>[data-slot=card-footer]]:text-muted-foreground [&>[data-slot=card-footer]]:text-xs",
				body: "rounded-[11px] bg-background shadow-surface dark:bg-popover",
			},
		},
	},
	defaultVariants: { variant: "default" },
});

export type CardVariant = NonNullable<VariantProps<typeof cardFrame>["variant"]>;
