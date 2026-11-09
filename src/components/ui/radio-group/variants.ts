import { tv, type VariantProps } from "tailwind-variants";

export const radioGroup = tv({
	slots: {
		root: "flex gap-2",
		label: "inline-flex cursor-pointer items-start gap-2.5 text-foreground",
		// The ring is the primitive itself: Base UI marks it data-checked, bits-ui data-state.
		ring: [
			"mt-0.5 grid shrink-0 place-items-center rounded-full border-2 border-muted-foreground/75 bg-background outline-none",
			"transition-[background-color,border-color] duration-(--duration-fast) ease-(--ease-ui-out) hover:border-muted-foreground motion-reduce:transition-none",
			"aria-invalid:border-destructive data-checked:border-primary data-[state=checked]:border-primary",
			"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
		],
		dot: "radio-dot rounded-full bg-primary",
		pill: "hidden",
	},
	variants: {
		variant: {
			default: {},
			// Checked, the ring fills and the dot turns to the label colour: reads at the smallest size.
			solid: {
				ring: "data-checked:bg-primary data-[state=checked]:bg-primary",
				dot: "bg-primary-foreground",
			},
			card: {
				label:
					"rounded-xl border border-border bg-card px-3.5 py-3 transition-[border-color,scale] duration-(--duration-press) ease-(--ease-ui-out) active:scale-(--press-scale-lg) motion-reduce:transition-none hover:border-border-strong has-checked:border-primary",
			},
			// Menu-style rows: the checked row is tinted, for pickers inside a popover.
			// One highlight glides to the checked row instead of each row tinting itself.
			list: {
				root: "relative isolate gap-0.5",
				label: [
					"relative z-1 w-full items-center rounded-md px-2 py-1.5 transition-colors hover:bg-accent/60",
					"has-data-checked:font-medium has-data-[state=checked]:font-medium",
				],
				ring: "mt-0",
				pill: "pointer-events-none absolute top-0 left-0 block rounded-md bg-foreground/[0.06] data-[ready=true]:transition-[translate,width,height,opacity] data-[ready=true]:duration-(--duration-spring-snappy) data-[ready=true]:ease-(--ease-spring-snappy) motion-reduce:transition-none",
			},
		},
		size: {
			sm: { label: "text-xs", ring: "size-3.5", dot: "size-1.5" },
			default: { label: "text-sm", ring: "size-4", dot: "size-2" },
			lg: { label: "text-sm", ring: "size-5", dot: "size-2.5" },
			xl: { label: "text-base", ring: "size-6", dot: "size-3" },
		},
		orientation: {
			vertical: { root: "flex-col" },
			horizontal: { root: "flex-row flex-wrap items-start" },
			// Responsive columns for `card` items; a column never narrows below 12rem.
			grid: { root: "grid grid-cols-[repeat(auto-fill,minmax(min(12rem,100%),1fr))]" },
		},
	},
	defaultVariants: { variant: "default", size: "default", orientation: "vertical" },
});

export type RadioVariant = NonNullable<VariantProps<typeof radioGroup>["variant"]>;
export type RadioSize = NonNullable<VariantProps<typeof radioGroup>["size"]>;
export type RadioOrientation = NonNullable<
	VariantProps<typeof radioGroup>["orientation"]
>;
