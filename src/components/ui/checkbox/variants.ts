import { tv, type VariantProps } from "tailwind-variants";

export const checkbox = tv({
	slots: {
		box: [
			// The primary fill pops in from the centre rather than cross-fading.
			"relative grid place-items-center border-2 border-muted-foreground/50 bg-background",
			"transition-[border-color,scale] duration-(--duration-fast) ease-[var(--ease-out)] active:scale-[var(--press-scale-icon)]",
			"before:pointer-events-none before:absolute before:-inset-0.5 before:rounded-[inherit] before:bg-primary",
			"before:scale-70 before:opacity-0 before:transition-[scale,opacity] before:[transition-duration:var(--duration-instant),var(--duration-base)] before:ease-linear",
			"hover:border-muted-foreground",
			"data-[state=checked]:border-primary data-[state=checked]:before:scale-100 data-[state=checked]:before:opacity-100",
			"data-[state=indeterminate]:border-primary data-[state=indeterminate]:before:scale-100 data-[state=indeterminate]:before:opacity-100",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
			"motion-reduce:transition-none motion-reduce:before:transition-none",
		],
		mark: "relative z-10",
		text: "block text-foreground",
	},
	variants: {
		size: {
			sm: { box: "size-3.5 rounded-[4px]", mark: "size-2.5", text: "text-xs" },
			md: { box: "size-4 rounded-[5px]", mark: "size-3", text: "text-sm" },
			lg: { box: "size-5 rounded-md", mark: "size-3.5", text: "text-sm" },
			xl: { box: "size-6 rounded-lg", mark: "size-4", text: "text-base" },
		},
	},
	defaultVariants: { size: "md" },
});

export type CheckboxSize = NonNullable<VariantProps<typeof checkbox>["size"]>;
