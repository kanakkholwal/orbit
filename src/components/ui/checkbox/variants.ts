import { tv, type VariantProps } from "tailwind-variants";

export const checkbox = tv({
	slots: {
		box: [
			// The primary fill pops in from the centre rather than cross-fading.
			"relative grid place-items-center border-2 border-muted-foreground/75 bg-background",
			"transition-[border-color,scale] duration-(--duration-fast) ease-[var(--ease-ui-out)] active:scale-[var(--press-scale-icon)]",
			"before:pointer-events-none before:absolute before:-inset-0.5 before:rounded-[inherit] before:bg-primary",
			"before:scale-70 before:opacity-0 before:transition-[scale,opacity] before:[transition-duration:var(--duration-instant),var(--duration-base)] before:ease-(--ease-ui-out)",
			"hover:border-muted-foreground aria-invalid:border-destructive data-[invalid]:border-destructive",
			"data-[state=checked]:border-primary data-[state=checked]:before:scale-100 data-[state=checked]:before:opacity-100",
			"data-[state=checked]:hover:border-primary-hover data-[state=checked]:hover:before:bg-primary-hover",
			"data-[state=indeterminate]:border-primary data-[state=indeterminate]:before:scale-100 data-[state=indeterminate]:before:opacity-100",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
			"motion-reduce:transition-none motion-reduce:before:transition-none",
		],
		mark: "relative z-10",
		// The labelled wrapper; a bare checkbox renders without it.
		root: "inline-flex items-start gap-2.5",
		label: "cursor-pointer select-none",
		text: "block text-foreground",
	},
	variants: {
		/** `default`: a square box; `circle`: a round one, for task lists; `card`: the whole
		 * labelled tile is the hit area and edges in the primary colour once checked. */
		variant: {
			default: {},
			circle: {},
			card: {
				root: "relative w-full rounded-xl border border-border bg-card px-3.5 py-3 transition-[border-color,scale] duration-(--duration-press) ease-(--ease-ui-out) active:scale-(--press-scale-lg) motion-reduce:transition-none hover:border-border-strong has-data-[state=checked]:border-primary",
				label: "after:absolute after:inset-0 after:rounded-[inherit]",
			},
		},
		size: {
			sm: { box: "size-3.5 rounded-[4px]", mark: "size-2.5", text: "text-xs" },
			default: { box: "size-4 rounded-[5px]", mark: "size-3", text: "text-sm" },
			lg: { box: "size-5 rounded-md", mark: "size-3.5", text: "text-sm" },
			xl: { box: "size-6 rounded-md", mark: "size-4", text: "text-base" },
		},
	},
	compoundVariants: [{ variant: "circle", class: { box: "rounded-full" } }],
	defaultVariants: { variant: "default", size: "default" },
});

export type CheckboxVariant = NonNullable<VariantProps<typeof checkbox>["variant"]>;
export type CheckboxSize = NonNullable<VariantProps<typeof checkbox>["size"]>;
